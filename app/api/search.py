from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.posts import _serialize_post
from app.api.routes import _serialize_route
from app.db.database import get_db
from app.db.models import Post, Route, User
from app.schemas.search import SearchResponse, SearchUserOut

router = APIRouter(prefix="/search", tags=["search"])


@router.get("", response_model=SearchResponse)
def global_search(
    q: str = Query(min_length=1),
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SearchResponse:
    query = q.strip().lower()

    routes = db.execute(select(Route).order_by(Route.created_at.desc()).limit(100)).scalars().all()
    posts = db.execute(select(Post).order_by(Post.created_at.desc()).limit(100)).scalars().all()

    filtered_routes = [
        route
        for route in routes
        if query in route.title.lower() or query in (route.description or "").lower() or query in (route.cities or "").lower()
    ][:limit]
    filtered_posts = [
        post
        for post in posts
        if query in post.title.lower() or query in post.content.lower() or query in post.city.lower()
    ][:limit]

    users = db.execute(select(User).order_by(User.created_at.desc()).limit(100)).scalars().all()
    filtered_users = [
        user
        for user in users
        if query in user.username.lower() or query in user.handle.lower() or query in user.email.lower()
    ][:limit]

    return SearchResponse(
        query=q,
        routes=[_serialize_route(route, current_user.id) for route in filtered_routes],
        posts=[_serialize_post(post, current_user.id) for post in filtered_posts],
        users=[
            SearchUserOut(id=user.id, name=user.username, handle=f"@{user.handle}", avatar_url=user.avatar_url)
            for user in filtered_users
        ],
    )
