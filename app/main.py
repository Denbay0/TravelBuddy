from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.auth import router as auth_router
from app.db import models  # noqa: F401
from app.db.database import create_tables


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    yield


app = FastAPI(title="TravelBuddy Auth MVP", version="0.1.0", lifespan=lifespan)
app.include_router(auth_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "TravelBuddy auth service is running"}
