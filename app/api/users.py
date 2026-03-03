from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.database import get_db
from app.db.models import Post, User
from app.schemas.users import PopularUserOut, PopularUsersResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/popular", response_model=PopularUsersResponse)
def popular_users(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> PopularUsersResponse:
    total = db.scalar(select(func.count(User.id))) or 0

    rows = db.execute(
        select(User, func.count(Post.id).label("posts_count"))
        .outerjoin(Post, Post.owner_id == User.id)
        .group_by(User.id)
        .order_by(func.count(Post.id).desc(), User.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).all()

    items = [
        PopularUserOut(
            id=user.id,
            name=user.username,
            handle=f"@{user.handle}",
            posts_count=posts_count,
            followers_count=0,
        )
        for user, posts_count in rows
    ]
    return PopularUsersResponse(items=items, page=page, limit=limit, total=total)
