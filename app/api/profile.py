import json
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, verify_csrf
from app.core.config import settings
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import MessageResponse
from app.schemas.user import (
    ProfileAvatarUploadResponse,
    ProfileFavoriteRoutesPageResponse,
    ProfileMeResponse,
    ProfilePostsPageResponse,
    ProfileStats,
    ProfileUpdateRequest,
    ProfileUpdateResponse,
)
from app.utils_profile import build_avatar_url, generate_unique_handle, remove_avatar_file

router = APIRouter(prefix="/profile", tags=["profile"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024


def _parse_visited_cities(raw_value: str | None) -> list[str]:
    if not raw_value:
        return []

    try:
        parsed = json.loads(raw_value)
    except (TypeError, json.JSONDecodeError):
        return []

    if isinstance(parsed, list):
        return [str(city) for city in parsed]
    return []


def _serialize_profile(user: User) -> ProfileMeResponse:
    return ProfileMeResponse(
        id=user.id,
        name=user.username,
        email=user.email,
        handle=f"@{user.handle}",
        avatar_url=build_avatar_url(user.avatar_path),
        travel_tagline=user.travel_tagline or "",
        bio=user.bio or "",
        home_city=user.home_city or "",
        visited_cities=_parse_visited_cities(user.visited_cities),
        stats=ProfileStats(trips=0, posts=0, saved_routes=0),
        favorite_routes=[],
        created_at=user.created_at,
    )


@router.get("/me", response_model=ProfileMeResponse)
def get_my_profile(current_user: User = Depends(get_current_user)) -> ProfileMeResponse:
    return _serialize_profile(current_user)


@router.patch("/me", response_model=ProfileUpdateResponse, dependencies=[Depends(verify_csrf)])
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileUpdateResponse:
    if payload.name is not None and payload.name != current_user.username:
        existing = db.scalar(select(User).where(User.username == payload.name, User.id != current_user.id))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username is already taken")
        current_user.username = payload.name
        current_user.handle = generate_unique_handle(db, payload.name, exclude_user_id=current_user.id)

    if payload.travel_tagline is not None:
        current_user.travel_tagline = payload.travel_tagline
    if payload.bio is not None:
        current_user.bio = payload.bio
    if payload.home_city is not None:
        current_user.home_city = payload.home_city

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return ProfileUpdateResponse(message="Profile updated successfully", profile=_serialize_profile(current_user))


@router.post("/avatar", response_model=ProfileAvatarUploadResponse, dependencies=[Depends(verify_csrf)])
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileAvatarUploadResponse:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .jpg, .jpeg, .png, .webp are allowed")

    content = await file.read()
    if len(content) > MAX_AVATAR_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Avatar size must be <= 2MB")

    avatars_dir = Path(settings.media_root) / "avatars"
    avatars_dir.mkdir(parents=True, exist_ok=True)
    filename = f"user_{current_user.id}_{uuid4().hex}{extension}"
    relative_path = f"avatars/{filename}"
    absolute_path = Path(settings.media_root) / relative_path
    absolute_path.write_bytes(content)

    remove_avatar_file(settings.media_root, current_user.avatar_path)
    current_user.avatar_path = relative_path
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return ProfileAvatarUploadResponse(
        message="Avatar uploaded successfully",
        avatar_url=build_avatar_url(current_user.avatar_path),
    )


@router.delete("/avatar", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def reset_avatar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    remove_avatar_file(settings.media_root, current_user.avatar_path)
    current_user.avatar_path = None
    db.add(current_user)
    db.commit()
    return MessageResponse(message="Avatar reset to default")


@router.get("/me/posts", response_model=ProfilePostsPageResponse)
def get_my_posts(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    _: User = Depends(get_current_user),
) -> ProfilePostsPageResponse:
    return ProfilePostsPageResponse(page=page, limit=limit, total=0, items=[])


@router.get("/me/favorite-routes", response_model=ProfileFavoriteRoutesPageResponse)
def get_my_favorite_routes(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    _: User = Depends(get_current_user),
) -> ProfileFavoriteRoutesPageResponse:
    return ProfileFavoriteRoutesPageResponse(page=page, limit=limit, total=0, items=[])
