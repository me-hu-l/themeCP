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
    id: int
    username: str
    email: EmailStr
    codeforces_handle: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
