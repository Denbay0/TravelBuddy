from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, verify_csrf
from app.core.config import settings
from app.core.security import create_access_token, create_csrf_token, hash_password, verify_password
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import CsrfResponse, LoginRequest, LoginResponse, MessageResponse
from app.schemas.user import RegisterResponse, UserCreate, UserOut
from app.utils_profile import build_avatar_url, generate_unique_handle

router = APIRouter(prefix="/auth", tags=["auth"])


def _serialize_user(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        name=user.username,
        email=user.email,
        handle=f"@{user.handle}",
        avatar_url=build_avatar_url(user.avatar_path),
        created_at=user.created_at,
    )


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

    response.set_cookie(
        key=settings.jwt_cookie_name,
        value=jwt_token,
        httponly=True,
        **cookie_opts,
    )
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf_token,
        httponly=False,
        **cookie_opts,
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(
        key=settings.jwt_cookie_name,
        path=settings.cookie_path,
        domain=settings.cookie_domain,
    )
    response.delete_cookie(
        key=settings.csrf_cookie_name,
        path=settings.cookie_path,
        domain=settings.cookie_domain,
    )


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, response: Response, db: Session = Depends(get_db)) -> RegisterResponse:
    existing_user = db.scalar(
        select(User).where(or_(User.username == payload.name, User.email == payload.email))
    )
    if existing_user:
        if existing_user.username == payload.name:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username is already taken")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    user = User(
        username=payload.name,
        email=payload.email,
        handle=generate_unique_handle(db, payload.name),
        password_hash=hash_password(payload.password),
    )
    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email is already registered",
        )

    db.refresh(user)
    jwt_token = create_access_token(subject=str(user.id))
    csrf_token = create_csrf_token()
    _set_auth_cookies(response, jwt_token=jwt_token, csrf_token=csrf_token)

    return RegisterResponse(message="User registered successfully", user=_serialize_user(user), csrf_token=csrf_token)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)) -> LoginResponse:
    user = db.scalar(select(User).where(User.email == payload.email))

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    jwt_token = create_access_token(subject=str(user.id))
    csrf_token = create_csrf_token()
    _set_auth_cookies(response, jwt_token=jwt_token, csrf_token=csrf_token)

    return LoginResponse(message="Login successful", user=_serialize_user(user), csrf_token=csrf_token)


@router.post("/logout", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def logout(response: Response, _: User = Depends(get_current_user)) -> MessageResponse:
    _clear_auth_cookies(response)
    return MessageResponse(message="Logged out successfully")


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)) -> UserOut:
    return _serialize_user(current_user)


@router.get("/csrf", response_model=CsrfResponse)
def get_csrf_token(response: Response) -> CsrfResponse:
    csrf_token = create_csrf_token()
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf_token,
        httponly=False,
        **_cookie_options(max_age=settings.access_token_expire_minutes * 60),
    )
    return CsrfResponse(csrf_token=csrf_token)
