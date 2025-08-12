from fastapi import FastAPI
from . import models
from .config.database import engine
from app.api import user
from app.api import contest
from app.api import auth_google
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from starlette.middleware.sessions import SessionMiddleware

load_dotenv()
app = FastAPI()

# CORS settings
origins = [
    "http://localhost:3000",  # Local frontend
    # Add your production frontend URL here when you deploy:
    # "https://your-frontend-domain.com",
]

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET_KEY", "super-secret-session-key")  # use a real secret
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Async function to create tables
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)

@app.get("/")
async def read_root():
    # print("hello world")
    return {"message": "ThemeCP backend is running!"}


app.include_router(user.router)
app.include_router(contest.router)
app.include_router(auth_google.router)
