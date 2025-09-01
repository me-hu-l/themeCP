from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, Literal
from datetime import datetime
from enum import Enum
import re


class ContestCreate(BaseModel):
    contest_no: Optional[int]=None
    date: Optional[str]=None  # Readable date
    topic: Optional[str]=None  # 'mixed', 'dp', 'greedy', etc.
    level: Optional[int]=None  # Contest level, e.g., 1, 2, 3, etc.
    duration: Optional[int] =None # Duration in minutes
    handle: Optional[str]  =None# Optional handle for the contest
    user_email: Optional[str]  =None# Optional email for the contest creator
    
    R1: Optional[int]=None
    R2: Optional[int]=None
    R3: Optional[int]=None
    R4: Optional[int]=None
    
    T1: Optional[float]=None
    T2: Optional[float]=None
    T3: Optional[float]=None
    T4: Optional[float]=None

    performance: Optional[float]=None  # maybe 'success' or 'fail'
    rating: Optional[float]=None  # rating after this contest
    delta: Optional[float]=None  # rating change
    
    id1: Optional[int]=None
    id2: Optional[int]=None
    id3: Optional[int]=None
    id4: Optional[int]=None
    
    index1: Optional[str]=None
    index2: Optional[str]=None
    index3: Optional[str]=None
    index4: Optional[str]=None


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


# class ContestResponse(BaseModel):
#     id: int
#     topic: str
#     level: int

#     start_time: Optional[datetime]
#     end_time: Optional[datetime]
#     phase: str

#     problem1_link: Optional[str]
#     problem1_rating: Optional[int]
#     problem1_solved_at: Optional[datetime]

#     problem2_link: Optional[str]
#     problem2_rating: Optional[int]
#     problem2_solved_at: Optional[datetime]

#     problem3_link: Optional[str]
#     problem3_rating: Optional[int]
#     problem3_solved_at: Optional[datetime]

#     problem4_link: Optional[str]
#     problem4_rating: Optional[int]
#     problem4_solved_at: Optional[datetime]

#     performance: Optional[float]
#     local_rating: Optional[float]
#     delta: Optional[float]
#     created_at: datetime

#     class Config:
#         from_attributes = True


class ContestResponse(BaseModel):
    id: int
    contest_no: int
    date: Optional[str]=None  # Readable date
    topic: str
    contest_level: int
    
    R1: Optional[int]=None
    R2: Optional[int]=None
    R3: Optional[int]=None
    R4: Optional[int]=None
    
    T1: Optional[float]=None
    T2: Optional[float]=None
    T3: Optional[float]=None
    T4: Optional[float]=None

    performance: Optional[float]=None
    rating: Optional[float]=None
    delta: Optional[float]=None
    
    contestId1: Optional[int]=None
    contestId2: Optional[int]=None
    contestId3: Optional[int]=None
    contestId4: Optional[int]=None
    
    index1: Optional[str]=None
    index2: Optional[str]=None
    index3: Optional[str]=None
    index4: Optional[str]=None

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
