from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.api.auth import router as auth_router
from app.api.admin_auth import router as admin_auth_router
from app.api.admin import router as admin_router
from app.api.posts import router as posts_router
from app.api.profile import router as profile_router
from app.api.routes import router as routes_router
from app.api.search import router as search_router
from app.api.reports import router as reports_router
from app.api.maps import router as maps_router
from app.api.users import router as users_router
from app.core.config import settings
from app.db import models  # noqa: F401
from app.db.database import SessionLocal, create_tables
from app.core.redis import ping_redis
from app.core.bootstrap_admin import ensure_bootstrap_admin
from app.utils_profile import backfill_handles


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_tables()
    media_avatars_path = Path("media/avatars")
    media_avatars_path.mkdir(parents=True, exist_ok=True)

    ping_redis()

    db: Session = SessionLocal()
    try:
        backfill_handles(db)
        ensure_bootstrap_admin(db)
    finally:
        db.close()

    yield



app = FastAPI(title="TravelBuddy Auth MVP", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
app.mount("/media", StaticFiles(directory="media"), name="media")
app.include_router(auth_router)
app.include_router(admin_auth_router)
app.include_router(admin_router)
app.include_router(profile_router)
app.include_router(routes_router)
app.include_router(posts_router)
app.include_router(users_router)
app.include_router(search_router)
app.include_router(reports_router)
app.include_router(maps_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "TravelBuddy auth service is running"}
