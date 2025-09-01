# app/api/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
# from h11 import Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import insert
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.models.user import User
from app.models.contest import Contest
from app.config.dependencies import get_db
from app.services import hashing
from fastapi.security import OAuth2PasswordRequestForm
from app.utils.jwt import create_access_token
from fastapi import Response
from app.schemas.token import Token
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.post("/signup", response_model=UserResponse)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if the username is already taken
    result = await db.execute(select(User).where(User.username == user.username))
    existing_username = result.scalars().first()

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    hashed_pw = hashing.hash_password(user.password)

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pw,
        codeforces_handle=user.codeforces_handle
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    return db_user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_db)
):
    # form_data.username will hold the email
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()

    if not user or not hashing.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": str(user.id)})
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout():
    resp = JSONResponse(content={"message": "Logged out"})
    resp.delete_cookie(
        key="token",
        path="/"
    )
    return resp


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user),
                 db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Contest).where(Contest.user_id == current_user.id).order_by(Contest.contest_no.desc()))
    contests = result.scalars().all()
    latest_contest = contests[0] if contests else None
    # print('latest contest:', latest_contest)
    rating = latest_contest.rating if latest_contest else 0
    max_rating = max([c.rating for c in contests]) if contests else 0

    response = {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "codeforces_handle": current_user.codeforces_handle,
        "created_at": current_user.created_at,
        "rating": rating,
        "max_rating": max_rating
    }

    return response


@router.get("/profile/{user_id}", response_model=UserResponse)
async def get_user_profile(
    user_id: int, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    result = await db.execute(select(Contest).where(Contest.user_id == user_id).order_by(Contest.contest_no.desc()))
    contests = result.scalars().all()
    latest_contest = contests[0] if contests else None
    # print('latest contest:', latest_contest)
    rating = latest_contest.rating if latest_contest else 0
    max_rating = max([c.rating for c in contests]) if contests else 0

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    response = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "codeforces_handle": user.codeforces_handle,
        "created_at": user.created_at,
        "rating": rating,
        "max_rating": max_rating
    }


    return response


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,  # You may want a separate schema for update
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.username = user_update.username
    current_user.codeforces_handle = user_update.codeforces_handle
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.delete("/me")
async def delete_me(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await db.delete(current_user)
    await db.commit()
    return {"message": "Account deleted"}



@router.post("/addHandle")
async def add_handle(
    handle: str,  # Accepting handle as the body parameter
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # print('helo')
    # Check if the user already has a codeforces handle
    if current_user.codeforces_handle:
        raise HTTPException(status_code=400, detail="Codeforces handle already exists")

    if not handle:
        raise HTTPException(status_code=400, detail="Codeforces handle is required")

    # Here you can add logic to validate the handle if needed (e.g., check if the handle is valid on Codeforces API)
        # Check if the handle is already taken by another user
    result = await db.execute(select(User).where(User.codeforces_handle == handle.strip()))
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(status_code=400, detail="handle already taken by another user")

    # Update the current user's codeforces handle
    current_user.codeforces_handle = handle.strip()
    
    # Commit the update to the database
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    return {"message": "Codeforces handle added successfully", "handle": current_user.codeforces_handle}



@router.get("/search")
async def search_users(
    q: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User)
        .where(User.codeforces_handle.ilike(f"%{q}%"))
        .limit(10)
    )
    users = result.scalars().all()
    return [{"id": u.id, "codeforces_handle": u.codeforces_handle} for u in users]

