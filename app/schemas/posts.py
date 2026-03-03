from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import PaginatedResponse


class PostCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    city: str = Field(min_length=1, max_length=128)


class PostUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    city: str | None = Field(default=None, min_length=1, max_length=128)


class CommentCreateRequest(BaseModel):
    content: str = Field(min_length=1)


class CommentOwner(BaseModel):
    id: int
    name: str
    handle: str


class PostCommentOut(BaseModel):
    id: int
    content: str
    owner: CommentOwner
    createdAt: datetime
    updatedAt: datetime


class PostOwner(BaseModel):
    id: int
    name: str
    handle: str


class PostOut(BaseModel):
    id: int
    title: str
    content: str
    city: str
    owner: PostOwner
    likesCount: int
    commentsCount: int
    savesCount: int
    isLiked: bool
    isSaved: bool
    createdAt: datetime
    updatedAt: datetime


class PostListResponse(PaginatedResponse[PostOut]):
    pass


class PostCommentsResponse(PaginatedResponse[PostCommentOut]):
    pass
