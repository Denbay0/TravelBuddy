from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.models import User
from app.utils_profile import generate_unique_handle


def _is_strong_password(password: str) -> bool:
    return (
        len(password) >= 12
        and any(ch.islower() for ch in password)
        and any(ch.isupper() for ch in password)
        and any(ch.isdigit() for ch in password)
    )


def ensure_bootstrap_admin(db: Session) -> None:
    email = (settings.bootstrap_admin_email or "").strip().lower()
    password = settings.bootstrap_admin_password or ""
    username = settings.bootstrap_admin_username.strip() or "admin"

    if not email or not password:
        return

    if not _is_strong_password(password):
        raise ValueError("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 chars and include upper/lowercase letters and digits")

    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        if not existing.is_admin:
            existing.is_admin = True
            existing.password_hash = hash_password(password)
            db.add(existing)
            db.commit()
        return

    admin = User(
        username=username,
        email=email,
        handle=generate_unique_handle(db, username),
        password_hash=hash_password(password),
        is_admin=True,
    )
    db.add(admin)
    db.commit()
