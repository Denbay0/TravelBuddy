from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, verify_csrf
from app.core.config import settings
from app.core.security import create_access_token, create_csrf_token, hash_password, verify_password
from app.db.database import get_db
from app.db.models import User
from app.schemas.auth import CsrfResponse, LoginRequest, LoginResponse, MessageResponse
from app.schemas.user import RegisterResponse, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookies(response: Response, jwt_token: str, csrf_token: str) -> None:
    response.set_cookie(
        key=settings.jwt_cookie_name,
        value=jwt_token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=settings.access_token_expire_minutes * 60,
    )
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf_token,
        httponly=False,
        samesite="lax",
        secure=False,
        max_age=settings.access_token_expire_minutes * 60,
    )


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if payload.password != payload.repeat_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")

    existing_user = db.scalar(
        select(User).where(or_(User.username == payload.username, User.email == payload.email))
    )
    if existing_user:
        if existing_user.username == payload.username:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username is already taken")
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered")

    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return RegisterResponse(message="User registered successfully", user=user)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).where(
            or_(User.username == payload.username_or_email, User.email == payload.username_or_email)
        )
    )

    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password",
        )

    jwt_token = create_access_token(subject=str(user.id))
    csrf_token = create_csrf_token()
    _set_auth_cookies(response, jwt_token=jwt_token, csrf_token=csrf_token)

    return LoginResponse(message="Login successful", csrf_token=csrf_token)


@router.post("/logout", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def logout(response: Response, _: User = Depends(get_current_user)):
    response.delete_cookie(key=settings.jwt_cookie_name)
    response.delete_cookie(key=settings.csrf_cookie_name)
    return MessageResponse(message="Logged out successfully")


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/csrf", response_model=CsrfResponse)
def get_csrf_token(response: Response, _: User = Depends(get_current_user)):
    csrf_token = create_csrf_token()
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf_token,
        httponly=False,
        samesite="lax",
        secure=False,
        max_age=settings.access_token_expire_minutes * 60,
    )
    return CsrfResponse(csrf_token=csrf_token)
