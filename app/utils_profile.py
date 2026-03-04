import re
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import User

USERNAME_REGEX = re.compile(r"^[A-Za-z0-9_]{3,32}$")
HANDLE_REGEX = re.compile(r"^[A-Za-z0-9_]{3,32}$")


def normalize_username(value: str) -> str:
    normalized = value.strip()
    if not USERNAME_REGEX.fullmatch(normalized):
        raise ValueError("Username must be 3-32 chars and contain only latin letters, digits, and underscores")
    return normalized


def username_to_handle_base(username: str) -> str:
    base = re.sub(r"[^A-Za-z0-9_]", "", username.strip())
    if not base:
        base = "user"
    if len(base) < 3:
        base = f"{base}user"
    return base[:32]


def generate_unique_handle(db: Session, username: str, exclude_user_id: int | None = None) -> str:
    base = username_to_handle_base(username)
    for suffix in [""] + [str(i) for i in range(1, 10000)]:
        max_base_len = 32 - len(suffix)
        candidate = f"{base[:max_base_len]}{suffix}"
        if not HANDLE_REGEX.fullmatch(candidate):
            continue

        query = select(User.id).where(User.handle == candidate)
        if exclude_user_id is not None:
            query = query.where(User.id != exclude_user_id)

        taken = db.scalar(query)
        if not taken:
            return candidate

    raise ValueError("Could not generate unique handle")


def build_avatar_url(avatar_path: str | None) -> str:
    if not avatar_path:
        return "/media/avatars/default.svg"
    return f"/media/{avatar_path}"


def remove_avatar_file(media_root: str, avatar_path: str | None) -> None:
    if not avatar_path:
        return
    file_path = Path(media_root) / avatar_path
    if file_path.exists() and file_path.is_file():
        file_path.unlink()


def backfill_handles(db: Session) -> None:
    users = db.scalars(select(User).order_by(User.id)).all()
    for user in users:
        if not user.handle:
            user.handle = generate_unique_handle(db, user.username, exclude_user_id=user.id)
    db.commit()
