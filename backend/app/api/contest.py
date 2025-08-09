from datetime import datetime, timedelta
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

@router.post("/create", response_model=ContestResponse)
async def create_contest(
    contest_req: ContestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Logic to create and store contest
    # 1. Check no active contest
    print(current_user.codeforces_handle)
    stmt = select(Contest).where(
        Contest.user_id == current_user.id,
        Contest.phase.in_(["not_started", "ongoing"])
    )
    result = await db.execute(stmt)
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have an active contest")

    # 2. Get difficulty range from level
    if contest_req.level not in LEVEL_RATING_MAP:
        raise HTTPException(status_code=400, detail="Invalid level")
    
    P=[None]*4 # difficulties of problems
    P[0] = LEVEL_RATING_MAP[contest_req.level]["P1 rating"]
    P[1] = LEVEL_RATING_MAP[contest_req.level]["P2 rating"]
    P[2] = LEVEL_RATING_MAP[contest_req.level]["P3 rating"]
    P[3] = LEVEL_RATING_MAP[contest_req.level]["P4 rating"]

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
        and (contest_req.topic == "mixed" or contest_req.topic in p.get("tags", []))
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
    
    # 4. Store in DB
    new_contest = Contest(
        user_id=current_user.id,
        topic=contest_req.topic,
        level=contest_req.level,
        phase="not_started",
        problem1_link=f"https://codeforces.com/problemset/problem/{selected[0]['contestId']}/{selected[0]['index']}",
        problem1_rating=selected[0]['rating'],
        problem2_link=f"https://codeforces.com/problemset/problem/{selected[1]['contestId']}/{selected[1]['index']}",
        problem2_rating=selected[1]['rating'],
        problem3_link=f"https://codeforces.com/problemset/problem/{selected[2]['contestId']}/{selected[2]['index']}",
        problem3_rating=selected[2]['rating'],
        problem4_link=f"https://codeforces.com/problemset/problem/{selected[3]['contestId']}/{selected[3]['index']}",
        problem4_rating=selected[3]['rating'],
    )
    db.add(new_contest)
    await db.commit()
    await db.refresh(new_contest)

    return new_contest


@router.patch("/{contest_id}/problem")
async def update_problem_slot(
    contest_id: int,
    payload: ProblemUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
    # 1. Fetch contest
    result = await db.execute(
        select(Contest).where(Contest.id == contest_id, Contest.user_id == current_user.id)
    )
    contest = result.scalar_one_or_none()
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    # 2. Prepare update dict
    slot_map = {
        "P1": ("problem1_link", "problem1_rating"),
        "P2": ("problem2_link", "problem2_rating"),
        "P3": ("problem3_link", "problem3_rating"),
        "P4": ("problem4_link", "problem4_rating"),
    }

    if payload.slot not in slot_map:
        raise HTTPException(status_code=400, detail="Invalid problem slot")

    link_field, rating_field = slot_map[payload.slot]
    new_link: Optional[str] = None
    rating = getattr(contest, rating_field)
    current_link = getattr(contest, link_field)
    # rating= contest[rating_field]
    new_rating= rating

    # 3. Custom problem provided
    if payload.custom_problem_url:
        new_link = str(payload.custom_problem_url)

    # 4. Reroll: Fetch random problem from Codeforces
    else:
        cf_url = "https://codeforces.com/api/problemset.problems"
        async with aiohttp.ClientSession() as session:
            async with session.get(cf_url) as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=502, detail="Failed to fetch from Codeforces")
                data = await resp.json()
        
        problems = data["result"]["problems"]

        # Determine desired rating
        # rating = 800 + (contest.level - 1) * 100
        topic = contest.topic

        # Filter problems
        filtered = [
            p for p in problems
            if "rating" in p
            and p["rating"] == rating
            and (current_link != f"https://codeforces.com/problemset/problem/{p['contestId']}/{p['index']}")
            and (
                topic == "mixed" or (topic in p.get("tags", []))
            )
        ]

        if not filtered:
            raise HTTPException(status_code=404, detail="No suitable problem found")

        problem = random.choice(filtered)
        new_link = f"https://codeforces.com/problemset/problem/{problem['contestId']}/{problem['index']}"
        new_rating = problem["rating"]

    # 5. Update contest row
    stmt = (
        update(Contest)
        .where(Contest.id == contest.id)
        .values({link_field: new_link, rating_field: new_rating})
    )
    await db.execute(stmt)
    await db.commit()

    return {"message": "Problem updated successfully", "link": new_link, "rating": new_rating}


@router.post("/{contest_id}/start")
async def start_contest(
    contest_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Contest).where(Contest.id == contest_id, Contest.user_id == current_user.id)
    )
    contest = result.scalar_one_or_none()

    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    if contest.phase != "not_started":
        raise HTTPException(status_code=400, detail="Contest already started or finished")
    
    duration_minutes = LEVEL_RATING_MAP[contest.level]['Duration']
    if duration_minutes is None:
        raise HTTPException(status_code=400, detail="Invalid level")
    
    now = datetime.utcnow()
    contest.start_time = now
    contest.end_time = now + timedelta(minutes=duration_minutes)
    contest.phase = "ongoing"

    await db.commit()
    await db.refresh(contest)

    return {
        "message": "Contest started",
        "start_time": contest.start_time,
        "end_time": contest.end_time,
        "phase": contest.phase
    }


@router.patch("/{contest_id}/solve/{problem_slot}")
async def mark_problem_solved(
    contest_id: int,
    problem_slot: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate slot
    if problem_slot not in {1, 2, 3, 4}:
        raise HTTPException(status_code=400, detail="Invalid problem slot. Must be 1–4.")

    # Get contest
    result = await db.execute(
        select(Contest).where(Contest.id == contest_id, Contest.user_id == current_user.id)
    )
    contest = result.scalar_one_or_none()
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")

    if contest.phase != "ongoing":
        raise HTTPException(status_code=400, detail="Contest is not ongoing")

    now = datetime.utcnow()
    if contest.end_time and now > contest.end_time:
        raise HTTPException(status_code=400, detail="Contest has ended")

    # Check if already solved
    solved_field = f"problem{problem_slot}_solved_at"
    if getattr(contest, solved_field) is not None:
        return {"message": f"Problem {problem_slot} already marked as solved", "solved_at": getattr(contest, solved_field)}

    # Mark as solved
    setattr(contest, solved_field, now)

    await db.commit()
    await db.refresh(contest)

    return {
        "message": f"Problem {problem_slot} marked as solved",
        "solved_at": now,
    }


@router.post("/{contest_id}/end")
async def end_contest(
    contest_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Contest).where(Contest.id == contest_id, Contest.user_id == current_user.id)
    )
    contest: Optional[Contest] = result.scalar_one_or_none()

    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found.")

    if contest.phase != "ongoing":
        raise HTTPException(status_code=400, detail="Contest is not ongoing.")

    # Mark contest as finished
    contest.end_time = datetime.utcnow()
    contest.phase = "finished"

    # Step 1: Calculate performance (average of solved problem ratings)
    solved_ratings = []
    for i in range(1, 5):
        solved_time = getattr(contest, f"problem{i}_solved_at")
        if solved_time:
            rating = getattr(contest, f"problem{i}_rating")
            solved_ratings.append(rating)

    if not solved_ratings:
        performance = 0  # If nothing is solved, performance is 0
    else:
        performance = sum(solved_ratings) / len(solved_ratings)

    # Step 2: Update delta and local_rating
    K = 40  # Tuning parameter like ELO
    if contest.local_rating is None:
        delta = 0
        new_rating = performance
    else:
        delta = K * (performance - contest.local_rating) / 400
        new_rating = contest.local_rating + delta

    # Save values
    contest.performance = round(performance, 2)
    contest.delta = round(delta, 2)
    contest.local_rating = round(new_rating, 2)

    await db.commit()
    await db.refresh(contest)

    return {
        "message": "Contest ended successfully",
        "performance": contest.performance,
        "delta": contest.delta,
        "new_rating": contest.local_rating
    }


@router.put("/{contest_id}/update", response_model=ContestResponse)
async def update_contest(
    contest_id: int,
    update_data: ContestUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Logic to update contest data
    return ContestResponse()

@router.get("/{contest_id}/get", response_model=ContestResponse)
async def get_contest_by_id(
    contest_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Logic to return contest only if user owns it
    # Fetch the contest
    result = await db.execute(select(Contest).where(Contest.id == contest_id))
    contest = result.scalar_one_or_none()

    if not contest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contest not found")
    
    # Check if the current user owns the contest
    if contest.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this contest")

    return contest

@router.delete("/{contest_id}/delete")
async def delete_contest_by_id(
    contest_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    # Fetch the contest
    result = await db.execute(select(Contest).where(Contest.id == contest_id))
    contest = result.scalar_one_or_none()

    if not contest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contest not found")
    
    # Check if the current user owns the contest
    if contest.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this contest")

    # Delete the contest
    await db.execute(delete(Contest).where(Contest.id == contest_id))
    await db.commit()

    return {"message": "Contest deleted successfully"}
    

@router.get("/me", response_model=List[ContestResponse])
async def get_my_contests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(
        select(Contest).where(Contest.user_id == current_user.id).order_by(Contest.created_at.desc())
    )
    contests = result.scalars().all()
    return contests
