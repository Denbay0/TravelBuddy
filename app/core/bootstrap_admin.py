from sqlalchemy import func, or_, select
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


def _ensure_admin_user(db: Session, *, email: str, username: str, password: str, enforce_strong_password: bool) -> None:
    if not email or not password:
        return

    if enforce_strong_password and not _is_strong_password(password):
        raise ValueError("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 chars and include upper/lowercase letters and digits")

    existing = db.scalar(select(User).where(or_(func.lower(User.email) == email.lower(), func.lower(User.username) == username.lower())))
    if existing:
        changed = False
        if not existing.is_admin:
            existing.is_admin = True
            changed = True
        if existing.email.lower() != email.lower():
            existing.email = email
            changed = True
        if existing.username.lower() != username.lower():
            existing.username = username
            changed = True
        existing.password_hash = hash_password(password)
        changed = True
        if changed:
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


def ensure_bootstrap_admin(db: Session) -> None:
    if settings.env == "dev":
        dev_login = (settings.admin_login or "admin").strip() or "admin"
        dev_password = settings.admin_password or "admin"
        dev_email = (settings.admin_email or "admin@travelbuddy.dev").strip().lower()
        _ensure_admin_user(
            db,
            email=dev_email,
            username=dev_login,
            password=dev_password,
            enforce_strong_password=False,
        )
        return

    email = (settings.bootstrap_admin_email or "").strip().lower()
    password = settings.bootstrap_admin_password or ""
    username = settings.bootstrap_admin_username.strip() or "admin"

    _ensure_admin_user(
        db,
        email=email,
        username=username,
        password=password,
        enforce_strong_password=True,
    )
