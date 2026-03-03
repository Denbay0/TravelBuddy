from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, verify_csrf
from app.db.database import get_db
from app.db.models import Post, PostComment, PostLike, PostSave, User
from app.schemas.auth import MessageResponse
from app.schemas.posts import (
    CommentCreateRequest,
    CommentOwner,
    PostCommentOut,
    PostCommentsResponse,
    PostCreateRequest,
    PostListResponse,
    PostOut,
    PostOwner,
    PostUpdateRequest,
)

router = APIRouter(prefix="/posts", tags=["posts"])


def _serialize_post(post: Post, current_user_id: int | None = None) -> PostOut:
    return PostOut(
        id=post.id,
        title=post.title,
        content=post.content,
        city=post.city,
        owner=PostOwner(id=post.owner.id, name=post.owner.username, handle=f"@{post.owner.handle}"),
        likes_count=len(post.likes),
        comments_count=len(post.comments),
        saves_count=len(post.saves),
        is_liked=bool(current_user_id and any(like.user_id == current_user_id for like in post.likes)),
        is_saved=bool(current_user_id and any(save.user_id == current_user_id for save in post.saves)),
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


def _serialize_comment(comment: PostComment) -> PostCommentOut:
    return PostCommentOut(
        id=comment.id,
        content=comment.content,
        owner=CommentOwner(id=comment.owner.id, name=comment.owner.username, handle=f"@{comment.owner.handle}"),
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.get("", response_model=PostListResponse)
def list_posts(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostListResponse:
    total = db.scalar(select(func.count(Post.id))) or 0
    posts = (
        db.execute(select(Post).order_by(Post.created_at.desc()).offset((page - 1) * limit).limit(limit))
        .scalars()
        .all()
    )
    return PostListResponse(
        items=[_serialize_post(post, current_user.id) for post in posts], page=page, limit=limit, total=total
    )


@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_csrf)])
def create_post(
    payload: PostCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostOut:
    post = Post(owner_id=current_user.id, title=payload.title, content=payload.content, city=payload.city)
    db.add(post)
    db.commit()
    db.refresh(post)
    return _serialize_post(post, current_user.id)


@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> PostOut:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return _serialize_post(post, current_user.id)


@router.patch("/{post_id}", response_model=PostOut, dependencies=[Depends(verify_csrf)])
def update_post(
    post_id: int,
    payload: PostUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostOut:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can edit this post")

    updates = payload.model_dump(exclude_unset=True)
    for field in ("title", "content", "city"):
        if field in updates:
            setattr(post, field, updates[field])

    db.add(post)
    db.commit()
    db.refresh(post)
    return _serialize_post(post, current_user.id)


@router.delete("/{post_id}", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    if post.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can delete this post")

    db.delete(post)
    db.commit()
    return MessageResponse(message="Post deleted")


@router.post("/{post_id}/like", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def like_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> MessageResponse:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    existing = db.scalar(select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user.id))
    if not existing:
        db.add(PostLike(post_id=post_id, user_id=current_user.id))
        db.commit()
    return MessageResponse(message="Post liked")


@router.delete("/{post_id}/like", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def unlike_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> MessageResponse:
    existing = db.scalar(select(PostLike).where(PostLike.post_id == post_id, PostLike.user_id == current_user.id))
    if existing:
        db.delete(existing)
        db.commit()
    return MessageResponse(message="Post unliked")


@router.post("/{post_id}/save", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def save_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> MessageResponse:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    existing = db.scalar(select(PostSave).where(PostSave.post_id == post_id, PostSave.user_id == current_user.id))
    if not existing:
        db.add(PostSave(post_id=post_id, user_id=current_user.id))
        db.commit()
    return MessageResponse(message="Post saved")


@router.delete("/{post_id}/save", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def unsave_post(post_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> MessageResponse:
    existing = db.scalar(select(PostSave).where(PostSave.post_id == post_id, PostSave.user_id == current_user.id))
    if existing:
        db.delete(existing)
        db.commit()
    return MessageResponse(message="Post unsaved")


@router.get("/{post_id}/comments", response_model=PostCommentsResponse)
def list_comments(
    post_id: int,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> PostCommentsResponse:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    total = db.scalar(select(func.count(PostComment.id)).where(PostComment.post_id == post_id)) or 0
    comments = (
        db.execute(
            select(PostComment)
            .where(PostComment.post_id == post_id)
            .order_by(PostComment.created_at.asc())
            .offset((page - 1) * limit)
            .limit(limit)
        )
        .scalars()
        .all()
    )
    return PostCommentsResponse(
        items=[_serialize_comment(comment) for comment in comments], page=page, limit=limit, total=total
    )


@router.post("/{post_id}/comments", response_model=PostCommentOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_csrf)])
def create_comment(
    post_id: int,
    payload: CommentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PostCommentOut:
    post = db.scalar(select(Post).where(Post.id == post_id))
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    comment = PostComment(post_id=post_id, owner_id=current_user.id, content=payload.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return _serialize_comment(comment)


@router.delete("/comments/{comment_id}", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    comment = db.scalar(select(PostComment).where(PostComment.id == comment_id))
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if comment.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can delete this comment")

    db.delete(comment)
    db.commit()
    return MessageResponse(message="Comment deleted")
