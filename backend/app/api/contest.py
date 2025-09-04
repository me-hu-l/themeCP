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

    problem_ratings = [r for r in [contest.R1, contest.R2, contest.R3, contest.R4] if r is not None]
    avg_problem_rating = float(sum(problem_ratings) / len(problem_ratings)) if problem_ratings else 0.0

    # ---- Performance calculation ----
    solved = []
    total_weight = 0
    for i in range(1, 5):
        r = getattr(contest, f"R{i}", None)
        t = getattr(contest, f"T{i}", None)
        if r is not None and t is not None and t > 0:  # solved
            speed_bonus = (duration - t) / duration   # assuming duration minutes total
            weight = 1 + 0.3 * speed_bonus
            solved.append(r * weight)
            total_weight += weight

    performance = int(sum(solved) / total_weight) if solved else 0

    # ---- Elo-like rating calculation ----
    if num_contests == 0:
        rating = performance
        delta = 0
    else:
        prev_rating = contests[0].rating or 0
        total_rating_sum = sum(problem_ratings)
        solved_rating_sum = sum([getattr(contest, f"R{i}", 0) for i in range(1, 5) if getattr(contest, f"T{i}", None)])

        actual = solved_rating_sum / total_rating_sum if total_rating_sum > 0 else 0
        expected = 1 / (1 + math.pow(10, (avg_problem_rating - prev_rating) / 400))

        k = 40
        delta = int(k * (actual - expected))
        rating = max(0, prev_rating + delta)

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