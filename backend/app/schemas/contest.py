from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, Literal
from datetime import datetime
from enum import Enum


class ContestCreate(BaseModel):
    # topic: str
    topic: Literal["mixed", "dp", "greedy", "math", "graphs","random","bruteforce",
                   "strings", "constructive algorithms", "binary search", "bitmasks", "data structures",
                   "implementation", "trees", "number theory", "combinatorics", "shortest paths",
                   "probabilities", "sortings"]  # 'mixed', 'dp', etc.
    level: int  # 1 to 109


class ContestUpdate(BaseModel):
    problem1_solved_at: Optional[datetime] = None
    problem2_solved_at: Optional[datetime] = None
    problem3_solved_at: Optional[datetime] = None
    problem4_solved_at: Optional[datetime] = None
    performance: Optional[float] = None  # 'success' / 'fail'
    local_rating: Optional[float] = None
    delta: Optional[float] = None
    phase: Optional[Literal["ongoing", "finished"]] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None


class ContestResponse(BaseModel):
    id: int
    topic: str
    level: int

    start_time: Optional[datetime]
    end_time: Optional[datetime]
    phase: str

    problem1_link: Optional[str]
    problem1_rating: Optional[int]
    problem1_solved_at: Optional[datetime]

    problem2_link: Optional[str]
    problem2_rating: Optional[int]
    problem2_solved_at: Optional[datetime]

    problem3_link: Optional[str]
    problem3_rating: Optional[int]
    problem3_solved_at: Optional[datetime]

    problem4_link: Optional[str]
    problem4_rating: Optional[int]
    problem4_solved_at: Optional[datetime]

    performance: Optional[float]
    local_rating: Optional[float]
    delta: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class ContestPhase(str, Enum):
    NOT_STARTED = "not_started"
    ONGOING = "ongoing"
    FINISHED = "finished"


class ProblemUpdateRequest(BaseModel):
    slot: Literal["P1", "P2", "P3", "P4"]
    custom_problem_url: Optional[HttpUrl] = Field(
        None, description="Set this to manually assign a problem. If not provided, a new problem will be rerolled."
    )
