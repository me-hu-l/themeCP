from fastapi import FastAPI
from . import models
from .config.database import engine
from app.api import user
from app.api import contest

app = FastAPI()

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

