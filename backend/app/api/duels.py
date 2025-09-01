# app/api/duels.py
from datetime import datetime, timedelta, timezone
import random
from typing import List
# from time import timezone

import aiohttp
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
# from h11 import Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import insert
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.models.user import User
from app.models.friendships import Friendship, FriendshipStatus
from app.models.duel import Duel, DuelStatus
from app.models.duel_progress import DuelProgress, ProblemStatus
from app.config.dependencies import get_db
from app.services import hashing
from fastapi.security import OAuth2PasswordRequestForm
from app.utils.jwt import create_access_token
from fastapi import Response
from app.schemas.token import Token
from app.schemas.duel import DuelCreate, DuelResponse, DuelState, Submission
from app.services.auth import get_current_user
from app.config.levels import LEVEL_RATING_MAP
from app.models.contest import Contest


router = APIRouter(
    prefix="/api/duels",
    tags=["Duels"]
    )



async def get_attempted_problems_cf(handle: str):
    url = f"https://codeforces.com/api/user.status?handle={handle}"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as resp:
            if resp.status != 200:
                return set()
            data = await resp.json()
    if data["status"] != "OK":
        return set()
    # Each submission: contestId, problem.index
    attempted = set()
    for sub in data["result"]:
        if "contestId" in sub["problem"] and "index" in sub["problem"]:
            attempted.add((sub["problem"]["contestId"], sub["problem"]["index"]))
    return attempted




@router.post("", response_model=dict)
async def create_duel(
    duel: DuelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if opponent exists
        if duel.opponent_id is None:
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Opponent ID must be provided"
                )
    
     # Check if opponent exists


        result = await db.execute(select(User).where(User.id == duel.opponent_id))
        opponent = result.scalars().first()
        if not opponent:
                raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Opponent not found"
                )

        if opponent.id == current_user.id:
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="You cannot duel yourself"
                )
        
        if(current_user.codeforces_handle == None or opponent.codeforces_handle== None):
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Both users must have codeforces handles set"
                )
        P=[None]*4 # difficulties of problems
        P[0] = LEVEL_RATING_MAP[duel.duel_level]["P1 rating"]
        P[1] = LEVEL_RATING_MAP[duel.duel_level]["P2 rating"]
        P[2] = LEVEL_RATING_MAP[duel.duel_level]["P3 rating"]
        P[3] = LEVEL_RATING_MAP[duel.duel_level]["P4 rating"]


        # Fetch attempted problems from Codeforces for both users
        attempted_by_creator = await get_attempted_problems_cf(current_user.codeforces_handle)
        attempted_by_opponent = await get_attempted_problems_cf(opponent.codeforces_handle)
        attempted = attempted_by_creator.union(attempted_by_opponent)

            # 3. Call Codeforces API to fetch problems
        async with aiohttp.ClientSession() as session:
                async with session.get("https://codeforces.com/api/problemset.problems") as resp:
                        if resp.status != 200:
                                raise HTTPException(status_code=502, detail="Failed to fetch from Codeforces")
                        data = await resp.json()
    
        if data["status"] != "OK":
                raise HTTPException(status_code=502, detail="Codeforces API error")
        

        problems = data["result"]["problems"]
        filtered = [
                p for p in problems
                if "rating" in p and p["rating"] in P 
                and (duel.topic == "mixed" or duel.topic in p.get("tags", []))
                and (p.get("contestId"), p.get("index")) not in attempted
        ]

        if len(filtered) < 4:
                raise HTTPException(status_code=404, detail="Not enough problems found")
        

        selected=[None]*4

        for i, difficulty in enumerate(P):
                filter_by_difficulty = [
                        p for p in filtered
                        if p['rating']==difficulty
                ]
                selected[i] = random.sample(filter_by_difficulty,1)[0]

        # Create a new duel
        new_duel = Duel(
                creator_id=current_user.id,
                opponent_id=opponent.id,
                topic=duel.topic,
                duel_level=duel.duel_level,

                R1=P[0],
                R2=P[1],
                R3=P[2],
                R4=P[3],

                contestId1=selected[0]["contestId"],
                contestId2=selected[1]["contestId"],
                contestId3=selected[2]["contestId"],
                contestId4=selected[3]["contestId"],

                index1=selected[0]["index"],
                index2=selected[1]["index"],
                index3=selected[2]["index"],
                index4=selected[3]["index"],
        )
        db.add(new_duel)
        await db.commit()
        await db.refresh(new_duel)

        return {"duel_id": new_duel.id, "message": "Duel created successfully"}


@router.post("/{duel_id}/accept", response_model=dict)
async def accept_duel(
    duel_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch the duel
        result = await db.execute(select(Duel).where((Duel.status == DuelStatus.active) & ((Duel.creator_id == current_user.id) | (Duel.opponent_id == current_user.id))))
        active_duels = result.scalars().all()
        if len(active_duels) >= 1:
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="You cannot have more than 1 active duels at a time"
                )
        result = await db.execute(select(Duel).where(Duel.id == duel_id))
        duel = result.scalars().first()
        result = await db.execute(select(Duel).where((Duel.status == DuelStatus.active) & 
                                                     ((Duel.creator_id == duel.creator_id) | (Duel.opponent_id == duel.creator_id))))
        # result = await db.execute(select(Duel).where(Duel.status == DuelStatus.active) & ((Duel.creator_id == duel.creator_id) | (Duel.opponent_id == duel.creator_id)))
        active_duels = result.scalars().all()
        if len(active_duels) >= 1:
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="The creator of this duel already has an active duel"
                )
        if not duel:
                raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Duel not found"
                )
        
        if duel.opponent_id != current_user.id:
                raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You are not the opponent of this duel"
                )
        
        if duel.status != DuelStatus.pending:
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Duel is not in a pending state"
                )
        expired_cutoff = timedelta(minutes=10)
        if duel.created_at + expired_cutoff < datetime.now(timezone.utc):
                duel.status = DuelStatus.expired
                await db.commit()
                await db.refresh(duel)
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Duel request has expired"
                )
        # Update duel status to active
        duel.status = DuelStatus.active
        # from datetime import datetime, timedelta
        duel.start_time = datetime.now(timezone.utc)
        duration = LEVEL_RATING_MAP[duel.duel_level]["Duration"]
        duel.end_time = duel.start_time + timedelta(minutes=duration)
        await db.commit()
        await db.refresh(duel)

        return {"message": "Duel accepted successfully, duel is now active"}


@router.post("/{duel_id}/reject", response_model=dict)
async def reject_duel(
    duel_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch the duel
        result = await db.execute(select(Duel).where(Duel.id == duel_id))
        duel = result.scalars().first()
        if not duel:
                raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Duel not found"
                )
        
        if duel.opponent_id != current_user.id:
                raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You are not the opponent of this duel"
                )
        
        if duel.status != DuelStatus.pending:
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Duel is not in a pending state"
                )
        expired_cutoff = timedelta(minutes=10)
        if duel.created_at + expired_cutoff < datetime.now(timezone.utc):
                duel.status = DuelStatus.expired
                await db.commit()
                await db.refresh(duel)
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Duel request has expired"
                )
        
        # Update duel status to rejected
        duel.status = DuelStatus.rejected
        await db.commit()
        await db.refresh(duel)

        return {"message": "Duel rejected successfully"}


@router.post("/{duel_id}/cancel", response_model=dict)
async def cancel_duel(
    duel_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch the duel
        result = await db.execute(select(Duel).where(Duel.id == duel_id))
        duel = result.scalars().first()
        if not duel:
                raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Duel not found"
                )
        
        if duel.creator_id != current_user.id:
                raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You are not the creator of this duel"
                )
        
        if duel.status != DuelStatus.pending:
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Only pending duels can be cancelled"
                )
        expired_cutoff = timedelta(minutes=10)
        if duel.created_at + expired_cutoff < datetime.now(timezone.utc):
                duel.status = DuelStatus.expired
                await db.commit()
                await db.refresh(duel)
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Duel request has expired"
                )
        
        # Update duel status to cancelled
        duel.status = DuelStatus.cancelled
        await db.commit()
        await db.refresh(duel)

        return {"message": "Duel cancelled successfully"}

@router.get("/active")
async def get_active_duels(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch active duels where the user is either the creator or the opponent
        result = await db.execute(
                select(Duel).where(
                        ((Duel.creator_id == current_user.id) | (Duel.opponent_id == current_user.id)) &
                        (Duel.status == DuelStatus.active)
                ).order_by(Duel.start_time.desc())
        )
        duel = result.scalars().first()

        if not duel:
               return duel

        user_ids = set()
        user_ids.add(duel.creator_id)
        user_ids.add(duel.opponent_id)

        result = await db.execute(select(User).where(User.id.in_(user_ids)))
        users = result.scalars().all()

        user_map = {}

        for user in users:
            contests = await db.execute(select(Contest).where(Contest.user_id == user.id).order_by(Contest.contest_no.desc()))
            contests = contests.scalars().all()
            rating = contests[0].rating if contests else 0
            max_rating = max([c.rating for c in contests]) if contests else 0
            user_map[user.id] = {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "codeforces_handle": user.codeforces_handle,
                "created_at": user.created_at,
                "rating": rating,
                "max_rating": max_rating
                }
            
        response = {
                "id": duel.id,
                "topic": duel.topic,
                "duel_level": duel.duel_level,
                "status": duel.status.value if duel.status else None,
                "start_time": duel.start_time,
                "end_time": duel.end_time,
                "date": duel.date,
                "R1": duel.R1,
                "R2": duel.R2,
                "R3": duel.R3,
                "R4": duel.R4,
                "contestId1": duel.contestId1,
                "contestId2": duel.contestId2,
                "contestId3": duel.contestId3,
                "contestId4": duel.contestId4,
                "index1": duel.index1,
                "index2": duel.index2,
                "index3": duel.index3,
                "index4": duel.index4,
                "creator": user_map.get(duel.creator_id),
                "opponent": user_map.get(duel.opponent_id),
                "created_at": duel.created_at
        }

        return response
        # if not duel:
        #         return {"id": None, "message": "No active duels found"}
        # return {"id": duel.id, "message": "Active duel found"}


@router.get("/pending")
async def get_pending_duels(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch pending duels where the user is the opponent
        result = await db.execute(
                select(Duel).where(
                        (Duel.opponent_id == current_user.id) &
                        (Duel.status == DuelStatus.pending)
                ).order_by(Duel.created_at.desc())
        )
        duels = result.scalars().all()
        now = datetime.now(timezone.utc)
        expired_cutoff = timedelta(minutes=10)
        for duel in duels:
                if duel.created_at + expired_cutoff < now:
                        duel.status = DuelStatus.expired
                        await db.commit()
                        await db.refresh(duel)
        
        pending_duels = [duel for duel in duels if duel.status ==DuelStatus.pending]

        # --- Populate creator and opponent info ---
        user_ids = set()
        for duel in pending_duels:
                user_ids.add(duel.creator_id)
                user_ids.add(duel.opponent_id)
        result = await db.execute(select(User).where(User.id.in_(user_ids)))
        users = result.scalars().all()

        user_map = {}

        for user in users:
               contests = await db.execute(select(Contest).where(Contest.user_id == user.id).order_by(Contest.contest_no.desc()))
               contests = contests.scalars().all()
               rating = contests[0].rating if contests else 0
               max_rating = max([c.rating for c in contests]) if contests else 0
               user_map[user.id] = {
                   "id": user.id,
                   "email": user.email,
                   "username": user.username,
                   "created_at": user.created_at,
                   "codeforces_handle": user.codeforces_handle,
                   "rating": rating,
                   "max_rating": max_rating
               }

        # user_map = {u.id: {"id": u.id, "email": u.email, "username": u.username, "codeforces_handle": u.codeforces_handle} for u in users}

        # Prepare response with populated users
        response = []
        for duel in pending_duels:
                duel_dict = {
                "id": duel.id,
                "topic": duel.topic,
                "duel_level": duel.duel_level,
                "status": duel.status.value if duel.status else None,
                "start_time": duel.start_time,
                "end_time": duel.end_time,
                "date": duel.date,
                "R1": duel.R1,
                "R2": duel.R2,
                "R3": duel.R3,
                "R4": duel.R4,
                "contestId1": duel.contestId1,
                "contestId2": duel.contestId2,
                "contestId3": duel.contestId3,
                "contestId4": duel.contestId4,
                "index1": duel.index1,
                "index2": duel.index2,
                "index3": duel.index3,
                "index4": duel.index4,
                "creator": user_map.get(duel.creator_id),
                "opponent": user_map.get(duel.opponent_id),
                "created_at": duel.created_at
                }
                response.append(duel_dict)

        return response



@router.get("/{duel_id}/poll", response_model=DuelState)
async def get_duel_state(
    duel_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch the duel
        result = await db.execute(select(Duel).where(Duel.id == duel_id))
        duel = result.scalars().first()
        if not duel:
                raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Duel not found"
                )
        
        if duel.creator_id != current_user.id and duel.opponent_id != current_user.id:
                raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You are not a participant of this duel"
                )
        
        
        # Fetch problems details from DuelProgress
        result = await db.execute(select(DuelProgress).where(DuelProgress.duel_id == duel.id))
        progress_entries = result.scalars().all()
        
        problems_dict = {}
        problems_dict[duel.creator_id]= [{}]*4
        problems_dict[duel.opponent_id]= [{}]*4
        tot_solved=0
        for entry in progress_entries:
                score=0
                minutes_taken=None
                if entry.first_solved_at is not None:
                        start_ts = int(duel.start_time.timestamp())
                        # print(duel.start_time, entry.first_solved_at, duel.end_time,'/n/n/n')
                        end_ts = int(duel.end_time.timestamp()) if duel.end_time else start_ts
                        seconds_taken = entry.first_solved_at.timestamp() - start_ts
                        minutes_taken = seconds_taken // 60
                        # print(start_ts, entry.first_solved_at.timestamp(), end_ts,'/n/n/n')
                        if entry.problem_slot==1:
                               max_score =  duel.R1
                        elif entry.problem_slot==2:
                               max_score =  duel.R2
                        elif entry.problem_slot==3:
                               max_score =  duel.R3
                        else:
                               max_score =  duel.R4
                        # Linear score: max_score at start, 0 at end
                        duration_seconds = end_ts - start_ts
                        if duration_seconds > 0:
                                score = max(
                                        0,
                                        int(
                                        max_score
                                        * (1 - min(seconds_taken, duration_seconds) / duration_seconds)
                                        ),
                                )
                        # score=1
                        tot_solved+=1
                else:
                        score=0
                problems_dict[entry.user_id][entry.problem_slot-1] = {
                        "score": score,
                        "submission_id": entry.submission_id,
                }
        
        # from datetime import datetime
        server_time = datetime.now(timezone.utc)
        
        duel_state = DuelState(
                id=duel.id,
                status=duel.status.value,
                start_time=duel.start_time,
                end_time=duel.end_time,
                server_time=server_time,
                problems=problems_dict
        )
        if tot_solved==8 or (duel.end_time is not None and duel.end_time < server_time):
                duel.status = DuelStatus.finished
                await db.commit()
                await db.refresh(duel)
                duel_state.status=duel.status.value
        
        return duel_state


@router.post("/{duel_id}/submit", response_model=dict)
async def submit_solution(
        duel_id: int,
        submission: Submission,
        db: AsyncSession = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    # Validate duel
        if submission.duel_id != duel_id:
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Duel ID in path and body do not match"
                )
        result = await db.execute(select(Duel).where(Duel.id == submission.duel_id))
        duel = result.scalars().first()
        if not duel:
                raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Duel not found"
                )

        if duel.status != DuelStatus.active:
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Duel is not active"
                )

        if duel.creator_id != current_user.id and duel.opponent_id != current_user.id:
                raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You are not a participant of this duel"
                )
        
        if duel.end_time is not None and duel.end_time < datetime.now(timezone.utc):
                duel.status = DuelStatus.finished
                await db.commit()
                await db.refresh(duel)
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Duel has already ended"
                )
        if submission.user_id != current_user.id:
                raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="You can only submit for yourself"
                )

        if submission.problem_slot not in [1, 2, 3, 4]:
                raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid problem slot"
                )

        result = await db.execute(
                select(DuelProgress).where(
                        (DuelProgress.duel_id == duel.id) &
                        (DuelProgress.user_id == current_user.id) &
                        (DuelProgress.problem_slot == submission.problem_slot)
                )
        )
        progress_entry = result.scalars().first()
        if not progress_entry:
                new_entry = DuelProgress(
                        duel_id=duel.id,
                        user_id=current_user.id,
                        problem_slot=submission.problem_slot,
                        status=ProblemStatus.solved,
                        first_solved_at=submission.first_solved_at,
                        submission_id=submission.submission_id
                )
                db.add(new_entry)
                await db.commit()
                await db.refresh(new_entry)
        
        return {"message": "Submission recorded successfully"}



@router.get("/{user_id}/history")
async def get_duel_history(
    user_id: int,
    db: AsyncSession = Depends(get_db),
):
    
    # Fetch all finished duels where the user is either creator or opponent
    result = await db.execute(
        select(Duel)
        .where(
            ((Duel.creator_id == user_id) | (Duel.opponent_id == user_id)) &
            (Duel.status == DuelStatus.finished)
        )
        .order_by(Duel.start_time.desc())
    )
    duels = result.scalars().all()

    # Fetch all involved user ids
    user_ids = set()
    for duel in duels:
        user_ids.add(duel.creator_id)
        user_ids.add(duel.opponent_id)

    # Fetch user info for all involved users
    result = await db.execute(select(User).where(User.id.in_(user_ids)))
    users = result.scalars().all()

    user_map = {}

    for user in users:
        contests = await db.execute(select(Contest).where(Contest.user_id == user.id).order_by(Contest.contest_no.desc()))
        contests = contests.scalars().all()
        rating = contests[0].rating if contests else 0
        max_rating = max([c.rating for c in contests]) if contests else 0
        user_map[user.id] = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "codeforces_handle": user.codeforces_handle,
            "created_at": user.created_at,
            "rating": rating,
            "max_rating": max_rating
        }

    # Prepare response
    duel_list = []
    for duel in duels:
        duel_dict = {
            "id": duel.id,
            "topic": duel.topic,
            "duel_level": duel.duel_level,
            "status": duel.status.value if duel.status else None,
            "start_time": duel.start_time,
            "end_time": duel.end_time,
            "date": duel.date,
            "R1": duel.R1,
            "R2": duel.R2,
            "R3": duel.R3,
            "R4": duel.R4,
            "contestId1": duel.contestId1,
            "contestId2": duel.contestId2,
            "contestId3": duel.contestId3,
            "contestId4": duel.contestId4,
            "index1": duel.index1,
            "index2": duel.index2,
            "index3": duel.index3,
            "index4": duel.index4,
            "creator": user_map.get(duel.creator_id),
            "opponent": user_map.get(duel.opponent_id),
            # You can add more fields as needed, e.g. problems, scores, etc.
        }
        # Optionally, fetch duel progress and scores here if needed
        duel_list.append(duel_dict)

    return duel_list


# states of user's past finished duels
@router.get("/{user_id}/states", response_model=List[DuelState])
async def get_duel_states(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    # Fetch all ongoing duels where the user is either creator or opponent
    result = await db.execute(
        select(Duel)
        .where(
            ((Duel.creator_id == user_id) | (Duel.opponent_id == user_id)) &
            (Duel.status == DuelStatus.finished)
        )
        .order_by(Duel.start_time.desc())
    )
    duels = result.scalars().all()

    # Prepare response
    duel_states = []
    
    for duel in duels:
           # Fetch problems details from DuelProgress
        result = await db.execute(select(DuelProgress).where(DuelProgress.duel_id == duel.id))
        progress_entries = result.scalars().all()
        
        problems_dict = {}
        problems_dict[duel.creator_id]= [{}]*4
        problems_dict[duel.opponent_id]= [{}]*4
        tot_solved=0
        for entry in progress_entries:
                score=0
                minutes_taken=None
                if entry.first_solved_at is not None:
                        start_ts = int(duel.start_time.timestamp())
                        # print(duel.start_time, entry.first_solved_at, duel.end_time,'/n/n/n')
                        end_ts = int(duel.end_time.timestamp()) if duel.end_time else start_ts
                        seconds_taken = entry.first_solved_at.timestamp() - start_ts
                        minutes_taken = seconds_taken // 60
                        # print(start_ts, entry.first_solved_at.timestamp(), end_ts,'/n/n/n')
                        if entry.problem_slot==1:
                               max_score =  duel.R1
                        elif entry.problem_slot==2:
                               max_score =  duel.R2
                        elif entry.problem_slot==3:
                               max_score =  duel.R3
                        else:
                               max_score =  duel.R4
                        # Linear score: max_score at start, 0 at end
                        duration_seconds = end_ts - start_ts
                        if duration_seconds > 0:
                                score = max(
                                        0,
                                        int(
                                        max_score
                                        * (1 - min(seconds_taken, duration_seconds) / duration_seconds)
                                        ),
                                )
                        # score=1
                        tot_solved+=1
                else:
                        score=0
                problems_dict[entry.user_id][entry.problem_slot-1] = {
                        "score": score,
                        "submission_id": entry.submission_id,
                }
        
        # from datetime import datetime
        server_time = datetime.now(timezone.utc)
        
        duel_state = DuelState(
                id=duel.id,
                status=duel.status.value,
                start_time=duel.start_time,
                end_time=duel.end_time,
                server_time=server_time,
                problems=problems_dict
        )
        duel_states.append(duel_state)

    return duel_states