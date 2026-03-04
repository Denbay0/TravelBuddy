import secrets

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, verify_csrf
from app.core.config import settings
from app.core.security import create_access_token, create_csrf_token, hash_password, verify_password
from app.db.database import get_db
from app.db.models import User
from app.schemas.admin import AdminLoginRequest
from app.schemas.auth import LoginResponse, MessageResponse
from app.schemas.user import UserOut
from app.utils_profile import build_avatar_url, generate_unique_handle

router = APIRouter(prefix="/api/admin/auth", tags=["admin-auth"])


def _cookie_options(max_age: int) -> dict[str, str | bool | int | None]:
    return {
        "secure": settings.cookie_secure,
        "samesite": settings.cookie_samesite,
        "path": settings.cookie_path,
        "domain": settings.cookie_domain,
        "max_age": max_age,
    }


def _set_auth_cookies(response: Response, jwt_token: str, csrf_token: str) -> None:
    max_age = settings.access_token_expire_minutes * 60
    cookie_opts = _cookie_options(max_age=max_age)
    response.set_cookie(key=settings.jwt_cookie_name, value=jwt_token, httponly=True, **cookie_opts)
    response.set_cookie(key=settings.csrf_cookie_name, value=csrf_token, httponly=False, **cookie_opts)


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key=settings.jwt_cookie_name, path=settings.cookie_path, domain=settings.cookie_domain)
    response.delete_cookie(key=settings.csrf_cookie_name, path=settings.cookie_path, domain=settings.cookie_domain)


def _serialize_user(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.username,
        email=user.email,
        handle=f"@{user.handle}",
        avatar_url=build_avatar_url(user.avatar_path),
        is_admin=user.is_admin,
        created_at=user.created_at,
    )


def _ensure_dev_admin(db: Session, login: str, password: str) -> User:
    user = db.scalar(select(User).where(func.lower(User.username) == login))
    synthetic_email = f"{login}@local-admin.dev"

    if user:
        changed = False
        if not user.is_admin:
            user.is_admin = True
            changed = True
        if user.email != synthetic_email:
            user.email = synthetic_email
            changed = True
        if not verify_password(password, user.password_hash):
            user.password_hash = hash_password(password)
            changed = True
        if changed:
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    admin = User(
        username=login,
        email=synthetic_email,
        handle=generate_unique_handle(db, login),
        password_hash=hash_password(password),
        is_admin=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@router.post("/login", response_model=LoginResponse)
def login(payload: AdminLoginRequest, response: Response, db: Session = Depends(get_db)) -> LoginResponse:
    login_value = payload.login.strip().lower()
    password = payload.password

    if settings.env == "dev" and settings.admin_login and settings.admin_password:
        env_login = settings.admin_login.strip().lower()
        env_password = settings.admin_password
        is_valid = secrets.compare_digest(login_value, env_login) and secrets.compare_digest(password, env_password)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")
        user = _ensure_dev_admin(db, login=env_login, password=env_password)
    else:
        user = db.scalar(select(User).where(or_(User.email == login_value, func.lower(User.username) == login_value)))
        if not user or not user.is_admin or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")

    jwt_token = create_access_token(subject=str(user.id))
    csrf_token = create_csrf_token()
    _set_auth_cookies(response, jwt_token=jwt_token, csrf_token=csrf_token)
    return LoginResponse(message="Admin login successful", user=_serialize_user(user), csrf_token=csrf_token)


@router.get("/me", response_model=UserOut)
def me(current_admin: User = Depends(get_current_admin)) -> UserOut:
    return _serialize_user(current_admin)


@router.post("/logout", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def logout(response: Response, _: User = Depends(get_current_admin)) -> MessageResponse:
    _clear_auth_cookies(response)
    return MessageResponse(message="Admin logged out successfully")
