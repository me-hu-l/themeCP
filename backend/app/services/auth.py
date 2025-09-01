from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
# from app.config.settings import settings
from app.config.dependencies import get_db
from fastapi.security import APIKeyHeader
from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/users/login")
api_key_scheme = APIKeyHeader(name="Authorization", auto_error=False)
# replace api_key_scheme with oauth2_scheme when using the OAuth2 provider

async def get_current_user(request: Request, token: str = Depends(api_key_scheme), db: AsyncSession = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials"
    )
    # print("helo")
    # Expect header like: Authorization: Bearer <token>
    if token and token.startswith("Bearer "):
        token = token[len("Bearer "):]
    else:
        # Fallback: Try to get token from cookie
        token = request.cookies.get("token")
        print("Cookies:", request.cookies)
        if not token:
            raise credentials_exception
    try:
        # print('hello in auth.py')
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # print('payload:', payload)
        user_id: int = payload.get("sub")
        user_id = int(user_id)
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    # print('user_id:', user_id)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    # print('user:', user)
    if user is None:
        raise credentials_exception

    return user
