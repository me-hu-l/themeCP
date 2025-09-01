from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, Literal, Dict, Any, List
from datetime import datetime
# from duel import DuelStatus
from enum import Enum
import re

from app.models.duel import DuelStatus

class DuelCreate(BaseModel):
    topic: Optional[str]=None  # 'mixed', 'dp', 'greedy', etc.
    duel_level: Optional[int]=None  # Duel level, e.g., 1, 2, 3, etc.
    opponent_id: Optional[int]  =None# Optional email for the duel opponent


class DuelState(BaseModel):
    id: int
    status: Optional[DuelStatus] = None
    # status: Literal(DuelStatus.enum_names)  # 'pending', 'active', 'finished', 'cancelled'
    # status: Literal['pending', 'active', 'finished', 'cancelled', 'rejected', 'expired']
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    server_time: Optional[datetime] = None


    problems: Dict[int, List[Dict[str,Any]]]  # List of problems with details

    class Config:
        orm_mode = True


class Submission(BaseModel):
    duel_id: Optional[int]  # ID of the duel
    user_id: Optional[int]  # ID of the user making the submission
    problem_slot: Optional[int]  # 1 to 4
    submission_id: int  # ID of the submission
    first_solved_at: Optional[datetime] = None  # Timestamp of first correct submission


class DuelResponse(BaseModel):
    id: int
    creator_id: int
    opponent_id: int
    topic: str
    duel_level: int
    status: Optional[DuelStatus] = None
    # status: Literal['pending', 'active', 'finished', 'cancelled', 'rejected', 'expired']
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    R1: Optional[int]=None
    R2: Optional[int]=None
    R3: Optional[int]=None
    R4: Optional[int]=None

    date: Optional[str]=None  # Readable date

    contestId1: Optional[int]=None
    contestId2: Optional[int]=None
    contestId3: Optional[int]=None
    contestId4: Optional[int]=None

    index1: Optional[str]=None
    index2: Optional[str]=None
    index3: Optional[str]=None
    index4: Optional[str]=None

    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True