from datetime import date, datetime

from pydantic import Field

from app.schemas.common import CamelModel, PaginatedResponse
from app.schemas.transport import TransportType


class PostCreateRequest(CamelModel):
    title: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1)
    city: str = Field(min_length=1, max_length=128)
    transport: TransportType = TransportType.WALK
    trip_date: date | None = None


class PostUpdateRequest(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = Field(default=None, min_length=1)
    city: str | None = Field(default=None, min_length=1, max_length=128)
    transport: TransportType | None = None
    trip_date: date | None = None


class CommentCreateRequest(CamelModel):
    content: str = Field(min_length=1)


class CommentOwner(CamelModel):
    id: int
    name: str
    handle: str


class PostCommentOut(CamelModel):
    id: int
    content: str
    owner: CommentOwner
    created_at: datetime
    updated_at: datetime


class PostOwner(CamelModel):
    id: int
    name: str
    handle: str


class PostOut(CamelModel):
    id: int
    title: str
    content: str
    city: str
    transport: TransportType
    trip_date: date | None
    owner: PostOwner
    likes_count: int
    comments_count: int
    saves_count: int
    is_liked: bool
    is_saved: bool
    created_at: datetime
    updated_at: datetime


class PostReactionResponse(CamelModel):
    message: str
    liked: bool
    saved: bool
    is_saved: bool
    likes: int
    saves: int


class PostListResponse(PaginatedResponse[PostOut]):
    pass


class PostCommentsResponse(PaginatedResponse[PostCommentOut]):
    pass
