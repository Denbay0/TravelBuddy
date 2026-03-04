from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin, verify_csrf
from app.core.security import hash_password
from app.db.database import get_db
from app.db.models import Post, Route, User
from app.schemas.admin import AdminDashboardSummary, AdminPostOut, AdminPostsResponse, AdminUserOut, AdminUsersResponse
from app.utils_profile import generate_unique_handle

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


class AdminCreateRequest(BaseModel):
    name: str = Field(min_length=3, max_length=32)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)


@router.get("/dashboard/summary", response_model=AdminDashboardSummary)
def dashboard_summary(db: Session = Depends(get_db)) -> AdminDashboardSummary:
    return AdminDashboardSummary(
        total_users=db.scalar(select(func.count(User.id))) or 0,
        total_posts=db.scalar(select(func.count(Post.id))) or 0,
        total_routes=db.scalar(select(func.count(Route.id))) or 0,
        admin_users=db.scalar(select(func.count(User.id)).where(User.is_admin.is_(True))) or 0,
    )


@router.get("/users", response_model=AdminUsersResponse)
def list_users(search: str | None = None, db: Session = Depends(get_db)) -> AdminUsersResponse:
    query = select(User).order_by(User.created_at.desc())
    if search and search.strip():
        needle = f"%{search.strip().lower()}%"
        query = query.where(
            or_(func.lower(User.username).like(needle), func.lower(User.email).like(needle), func.lower(User.handle).like(needle))
        )
    users = db.execute(query).scalars().all()
    return AdminUsersResponse(
        items=[AdminUserOut(id=u.id, name=u.username, email=u.email, is_admin=u.is_admin, created_at=u.created_at) for u in users]
    )


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(verify_csrf)])
def delete_user(user_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)) -> None:
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete current admin")
    db.delete(user)
    db.commit()


@router.get("/posts", response_model=AdminPostsResponse)
def list_posts(search: str | None = None, db: Session = Depends(get_db)) -> AdminPostsResponse:
    query = select(Post).order_by(Post.created_at.desc())
    if search and search.strip():
        needle = f"%{search.strip().lower()}%"
        query = query.where(or_(func.lower(Post.title).like(needle), func.lower(Post.content).like(needle), func.lower(Post.city).like(needle)))
    posts = db.execute(query).scalars().all()
    return AdminPostsResponse(
        items=[
            AdminPostOut(id=p.id, title=p.title, city=p.city, author_name=p.owner.username, created_at=p.created_at)
            for p in posts
        ]
    )


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(verify_csrf)])
def delete_post(post_id: int, db: Session = Depends(get_db)) -> None:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    db.delete(post)
    db.commit()


@router.get("/admins", response_model=AdminUsersResponse)
def list_admins(db: Session = Depends(get_db)) -> AdminUsersResponse:
    admins = db.execute(select(User).where(User.is_admin.is_(True)).order_by(User.created_at.desc())).scalars().all()
    return AdminUsersResponse(
        items=[AdminUserOut(id=u.id, name=u.username, email=u.email, is_admin=True, created_at=u.created_at) for u in admins]
    )


@router.post("/admins", response_model=AdminUserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_csrf)])
def create_admin(payload: AdminCreateRequest, db: Session = Depends(get_db)) -> AdminUserOut:
    user = User(
        username=payload.name.strip(),
        email=str(payload.email).strip().lower(),
        handle=generate_unique_handle(db, payload.name.strip()),
        password_hash=hash_password(payload.password),
        is_admin=True,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username or email already exists")
    db.refresh(user)
    return AdminUserOut(id=user.id, name=user.username, email=user.email, is_admin=True, created_at=user.created_at)


@router.delete("/admins/{admin_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(verify_csrf)])
def delete_admin(admin_id: int, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)) -> None:
    admin = db.scalar(select(User).where(User.id == admin_id, User.is_admin.is_(True)))
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    if admin.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete current admin")
    db.delete(admin)
    db.commit()
