# app/api/friends.py
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
# from h11 import Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import insert
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.models.user import User
from app.models.friendships import Friendship, FriendshipStatus
from app.config.dependencies import get_db
from app.services import hashing
from fastapi.security import OAuth2PasswordRequestForm
from app.utils.jwt import create_access_token
from fastapi import Response
from app.schemas.token import Token
from app.services.auth import get_current_user
from app.models.contest import Contest

router = APIRouter(prefix="/api/friends", tags=["Friends"])


@router.post("/request/{user_id}")
async def send_friend_request(
    user_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot send a friend request to yourself."
        )

    result = await db.execute(select(User).where(User.id == user_id))
    receiver = result.scalars().first()

    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # Check if a friendship already exists
    friendship_query = select(Friendship).where(
        ((Friendship.requester_id == current_user.id) & (Friendship.receiver_id == user_id)) |
        ((Friendship.requester_id == user_id) & (Friendship.receiver_id == current_user.id))
    )
    existing_friendship = await db.execute(friendship_query)
    friendship = existing_friendship.scalars().first()

    if friendship:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Friend request already sent."
        )

    new_friendship = Friendship(
        requester_id=current_user.id,
        receiver_id=user_id
    )
    
    db.add(new_friendship)
    await db.commit()
    await db.refresh(new_friendship)

    return JSONResponse(status_code=status.HTTP_201_CREATED, content={"message": "Friend request sent."})


@router.post("/accept-request/{user_id}")
async def accept_friend_request(
    user_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot accept a friend request from yourself."
        )

    friendship_query = select(Friendship).where(
        Friendship.requester_id == user_id,
        Friendship.receiver_id == current_user.id,
        Friendship.status == FriendshipStatus.pending
    )
    
    friendship = await db.execute(friendship_query)
    friendship = friendship.scalars().first()

    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend request not found."
        )

    friendship.status = FriendshipStatus.accepted
    await db.commit()
    await db.refresh(friendship)

    return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "Friend request accepted."})


@router.post("/reject-request/{user_id}")
async def reject_friend_request(
    user_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot reject a friend request from yourself."
        )

    friendship_query = select(Friendship).where(
        Friendship.requester_id == user_id,
        Friendship.receiver_id == current_user.id,
        Friendship.status == FriendshipStatus.pending
    )
    
    friendship = await db.execute(friendship_query)
    friendship = friendship.scalars().first()

    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friend request not found."
        )

    await db.delete(friendship)
    await db.commit()

    return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "Friend request rejected."})


@router.get("/pending-requests/{user_id}", response_model=list[UserResponse])
async def get_pending_requests(
    user_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own pending requests."
        )

    friendship_query = select(Friendship).where(
        Friendship.receiver_id == user_id,
        Friendship.status == FriendshipStatus.pending
    )
    
    friendships = await db.execute(friendship_query)
    friendships = friendships.scalars().all()

    if not friendships:
        return []

    requester_ids = [f.requester_id for f in friendships]
    users_query = select(User).where(User.id.in_(requester_ids))
    users = await db.execute(users_query)

    response=[]

    for user in users.scalars().all():
        contests = await db.execute(select(Contest).where(Contest.user_id == user.id).order_by(Contest.contest_no.desc()))
        contests = contests.scalars().all()
        rating = contests[0].rating if contests else 0
        max_rating = max([c.rating for c in contests]) if contests else 0
        response.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "codeforces_handle": user.codeforces_handle,
            "created_at": user.created_at,
            "rating": rating,
            "max_rating": max_rating
        })

    return response

@router.post("/remove-friend/{user_id}")
async def remove_friend(
    user_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove yourself as a friend."
        )

    friendship_query = select(Friendship).where(
        ((Friendship.requester_id == current_user.id) & (Friendship.receiver_id == user_id)) |
        ((Friendship.requester_id == user_id) & (Friendship.receiver_id == current_user.id))
    )
    
    friendship = await db.execute(friendship_query)
    friendship = friendship.scalars().first()

    if not friendship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Friendship not found."
        )

    await db.delete(friendship)
    await db.commit()

    return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "Friend removed."})


@router.get("/list/{user_id}", response_model=list[UserResponse])
async def list_friends(
    user_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
#     if user_id != current_user.id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="You can only view your own friends."
#         )

    friendship_query = select(Friendship).where(
        (Friendship.requester_id == user_id) | (Friendship.receiver_id == user_id),
        Friendship.status == FriendshipStatus.accepted
    )
    
    friendships = await db.execute(friendship_query)
    friendships = friendships.scalars().all()

    if not friendships:
        return []

    friend_ids = [f.requester_id if f.requester_id != user_id else f.receiver_id for f in friendships]
    users_query = select(User).where(User.id.in_(friend_ids))
    users = await db.execute(users_query)

    response = []

    for user in users.scalars().all():
        contests = await db.execute(select(Contest).where(Contest.user_id == user.id).order_by(Contest.contest_no.desc()))
        contests = contests.scalars().all()
        rating = contests[0].rating if contests else 0
        max_rating = max([c.rating for c in contests]) if contests else 0
        response.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "codeforces_handle": user.codeforces_handle,
            "created_at": user.created_at,
            "rating": rating,
            "max_rating": max_rating
        })

    return response

@router.get("/status/{user_id}")
async def friendship_status(
    user_id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot check your own friendship status."
        )

    friendship_query = select(Friendship).where(
        ((Friendship.requester_id == current_user.id) & (Friendship.receiver_id == user_id)) |
        ((Friendship.requester_id == user_id) & (Friendship.receiver_id == current_user.id))
    )
    
    friendship = await db.execute(friendship_query)
    friendship = friendship.scalars().first()

    if not friendship:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"message": "No friendship found."})

    return JSONResponse(status_code=status.HTTP_200_OK, content={"status": friendship.status.value})