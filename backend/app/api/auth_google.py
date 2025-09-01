from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.config.dependencies import get_db
from app.models.user import User
from app.utils.jwt import create_access_token
from authlib.integrations.starlette_client import OAuth
import os

router = APIRouter(prefix="/api/auth", tags=["Google Auth"])

# Configure OAuth
oauth = OAuth()
oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    print("redirect_uri",redirect_uri)
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info:
        raise HTTPException(status_code=400, detail="Google login failed")

    google_id = user_info["sub"]
    email = user_info["email"]
    name = user_info.get("name")

    # Check if user exists
    result = await db.execute(select(User).where(User.google_id == google_id))
    user = result.scalars().first()

    if not user:
        # Create user if doesn't exist
        user = User(
            email=email,
            username=name,
            google_id=google_id,
            auth_provider="google"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Issue your normal JWT
    jwt_token = create_access_token({"sub": str(user.id)})

    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    resp = RedirectResponse(url=f"{frontend_url}/")

    resp.set_cookie(
        key="token",
        value=jwt_token,
        httponly=True,
        secure=False,   # True in production (HTTPS)
        samesite="lax", # or "none" with secure=True if cross-site
        max_age=60*60*24*7,
        path="/"
    )
    return resp

    # Redirect to frontend with JWT in query string
    return RedirectResponse(url=f"http://localhost:3000/oauth-callback?token={jwt_token}")
