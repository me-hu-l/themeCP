from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import insert
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.models.user import User
from app.config.dependencies import get_db
from app.services import hashing
from fastapi.security import OAuth2PasswordRequestForm
from app.utils.jwt import create_access_token
from fastapi import Response
from app.schemas.token import Token
from app.services.auth import get_current_user
from app.config.levels import LEVEL_RATING_MAP

router = APIRouter(tags=["Levels"])


@router.get("/api/levels")
async def get_levels():
    return LEVEL_RATING_MAP
    
