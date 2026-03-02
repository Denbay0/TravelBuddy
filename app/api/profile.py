from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, verify_csrf
from app.core.config import settings
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import MessageResponse
from app.schemas.user import ProfileUpdateRequest, UserOut
from app.utils_profile import build_avatar_url, generate_unique_handle, remove_avatar_file

router = APIRouter(prefix="/profile", tags=["profile"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024


def _serialize_user(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        username=user.username,
        email=user.email,
        handle=f"@{user.handle}",
        avatar_url=build_avatar_url(user.avatar_path),
        created_at=user.created_at,
    )


@router.get("/me", response_model=UserOut)
def get_my_profile(current_user: User = Depends(get_current_user)) -> UserOut:
    return _serialize_user(current_user)


@router.patch("/me", response_model=UserOut, dependencies=[Depends(verify_csrf)])
def update_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserOut:
    if payload.username != current_user.username:
        existing = db.scalar(select(User).where(User.username == payload.username, User.id != current_user.id))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username is already taken")
        current_user.username = payload.username
        current_user.handle = generate_unique_handle(db, payload.username, exclude_user_id=current_user.id)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return _serialize_user(current_user)


@router.post("/avatar", response_model=UserOut, dependencies=[Depends(verify_csrf)])
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserOut:
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
    return _serialize_user(current_user)


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
