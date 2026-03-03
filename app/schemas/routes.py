from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import PaginatedResponse


class RouteCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    cities: list[str] = Field(default_factory=list)
    durationDays: int = Field(default=1, ge=1)


class RouteUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    cities: list[str] | None = None
    durationDays: int | None = Field(default=None, ge=1)


class RouteOwner(BaseModel):
    id: int
    name: str
    handle: str


class RouteOut(BaseModel):
    id: int
    title: str
    description: str
    cities: list[str]
    durationDays: int
    savesCount: int
    owner: RouteOwner
    isSaved: bool
    createdAt: datetime
    updatedAt: datetime


class RouteListResponse(PaginatedResponse[RouteOut]):
    pass
