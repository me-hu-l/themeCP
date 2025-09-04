from datetime import datetime, timedelta
import math
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy import delete, update
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from .. import models, schemas
from sqlalchemy.future import select
from app.schemas.contest import ContestCreate, ContestResponse, ContestUpdate
from app.schemas.contest import ProblemUpdateRequest
from app.models.user import User
from ..config.dependencies import get_db
from ..services.auth import get_current_user
import aiohttp
import random
from app.models import Contest
from app.config.levels import LEVEL_RATING_MAP

router = APIRouter(
    prefix="/api/contests",
    tags=["Contests"]
)



@router.get("/me", response_model=List[ContestResponse])
async def get_my_contests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch contests for the current user ordered by start_time
    result = await db.execute(
        select(Contest).where(Contest.user_id == current_user.id).order_by(Contest.contest_no.desc())
    )
    contests = result.scalars().all()

    # if not contests:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail="No contests found for this user"
    #     )
    
    return contests


@router.get("/contestHistory/{user_id}", response_model=List[ContestResponse])
async def get_user_contests(
    user_id: int,
    db: AsyncSession = Depends(get_db)):
    # Fetch contests for the specified user ordered by start_time
    result = await db.execute(
        select(Contest).where(Contest.user_id == user_id).order_by(Contest.contest_no.desc())
    )
    contests = result.scalars().all()

    return contests

@router.post("/addContest", response_model=ContestResponse)
async def create_contest(
    contest: ContestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Contest).where(Contest.user_id == current_user.id).order_by(Contest.contest_no.desc())
    )
    contests = result.scalars().all()

    duration = LEVEL_RATING_MAP[contest.level]["Duration"]

    num_contests = len(contests)
    current_date = datetime.now().strftime("%Y-%m-%d")

    if num_contests == 0:
        prev_rating = 0
    else:
        prev_rating = contests[0].rating or 0

    ratings = [contest.R1, contest.R2, contest.R3, contest.R4]
    times = [contest.T1, contest.T2, contest.T3, contest.T4]

    # Determine how many problems solved (prefix)
    solved_count = 0
    total_time = 0
    for r, t in zip(ratings, times):
        if r is not None and t and t > 0:
            solved_count += 1
            total_time += t
        else:
            break  # prefix only

    if solved_count == 0:
        performance = 800
    else:
        # Select lower/upper bounds based on solved count
        if solved_count == 1:
            lower, upper = ratings[0], ratings[1]
        elif solved_count == 2:
            lower, upper = ratings[1], ratings[2]
        elif solved_count == 3:
            lower, upper = ratings[2], ratings[3]
        else:  # solved all 4
            lower, upper = ratings[3], ratings[3] + 300

        # Time factor (0 = very slow, 1 = very fast)
        max_time = solved_count * duration
        speed_score = max(0.0, min(1.0, (max_time - total_time) / max_time))

        performance = lower + speed_score * (upper - lower)

    # --- Rating update ---
    if num_contests == 0:
        rating = int(performance)
        delta = 0
    else:
        gap = performance - prev_rating
        k = 40 + min(60, abs(gap) / 10)
        delta = int(max(-200, min(200, k * gap / 400)))
        rating = max(0, prev_rating + delta)

    # print("ratings:", ratings)
    # print("times:", times)
    # print("solved_count:", solved_count)
    # print("performance:", performance)


    performance = int(performance)
    delta = int(delta)
    rating = int(rating)

    # Create a new contest
    new_contest = Contest(
        user_id=current_user.id,
        topic=contest.topic,
        contest_level=contest.level,
        contest_no=num_contests+1,  # Randomly assign a contest number
        R1=contest.R1,
        R2=contest.R2,
        R3=contest.R3,
        R4=contest.R4,
        T1=contest.T1,
        T2=contest.T2,
        T3=contest.T3,
        T4=contest.T4,
        date= current_date,
        performance=performance,
        rating=rating,
        delta=delta,
        contestId1=contest.id1,
        contestId2=contest.id2, 
        contestId3=contest.id3,
        contestId4=contest.id4,
        index1=contest.index1,
        index2=contest.index2,
        index3=contest.index3,
        index4=contest.index4
    )

    db.add(new_contest)
    await db.commit()
    await db.refresh(new_contest)

    return new_contest


@router.post("/upsolve/{contest_id}")
async def upsolve_contest(
    slot: int,
    contest_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch the contest to be upsolved
    contest = await db.get(Contest, contest_id)
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    # Check if the current user is the owner of the contest
    if contest.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to upsolve this contest")
    
    if slot not in [1, 2, 3, 4]:
        raise HTTPException(status_code=400, detail="Invalid problem slot. Must be 1, 2, 3, or 4.")

    # Perform the upsolve operation (e.g., re-evaluate the contest)
    # ...
    # contest[f'T{slot}'] = -1  # Reset time for the specified problem slot
    if slot == 1:
        contest.T1 = -1
    elif slot == 2:
        contest.T2 = -1
    elif slot == 3:
        contest.T3 = -1
    elif slot == 4:
        contest.T4 = -1

    await db.commit()
    await db.refresh(contest)


    return {"message": "Contest upsolved successfully"}