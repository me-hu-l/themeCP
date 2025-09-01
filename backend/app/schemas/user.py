from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    codeforces_handle: Optional[str] = None

class UserUpdate(BaseModel):
    username: str
    email: EmailStr
    password: str
    codeforces_handle: Optional[str] = None

class UserResponse(BaseModel):
    id: Optional[int]=None
    username: Optional[str]=None
    email: Optional[EmailStr]=None
    codeforces_handle: Optional[str]=None
    created_at: Optional[datetime]=None
    rating: Optional[int]=None
    max_rating: Optional[int]=None

    class Config:
        from_attributes = True
