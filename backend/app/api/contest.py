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

    num_contests = len(contests)
    current_date = datetime.now().strftime("%Y-%m-%d")

    # Calculate average problem rating (for expected performance)
    problem_ratings = [r for r in [contest.R1, contest.R2, contest.R3, contest.R4] if r is not None]
    avg_problem_rating = float(sum(problem_ratings) / len(problem_ratings)) if problem_ratings else 0.0

    # Calculate performance
    solved_ratings = []
    for i in range(1, 5):
        t = getattr(contest, f"T{i}", None)
        r = getattr(contest, f"R{i}", None)
        if t is not None and t != 0 and r is not None:
            solved_ratings.append(r)
    performance = float(sum(solved_ratings) / len(solved_ratings)) if solved_ratings else 0.0

    # Calculate rating and delta
    if num_contests == 0:
        rating = int(performance)
        delta = 0
    else:
        prev_contest = contests[0]  # contests are ordered by contest_no desc
        prev_rating = prev_contest.rating if prev_contest.rating is not None else 0
        # Elo-like delta calculation
        k = 40  # You can tune this
        expected = 1 / (1 + math.pow(10, (avg_problem_rating - prev_rating) / 400))
        actual = 1 if performance >= avg_problem_rating else (performance / avg_problem_rating if avg_problem_rating > 0 else 0)
        delta = k * (actual - expected)
        delta = int(delta)
        rating = prev_rating + delta

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