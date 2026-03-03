from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelModel, PaginatedResponse
from app.schemas.transport import TransportType


class RouteCreateRequest(CamelModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    cities: list[str] = Field(default_factory=list)
    duration_days: int = Field(default=1, ge=1)
    transport: TransportType = TransportType.WALK


class RouteUpdateRequest(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    cities: list[str] | None = None
    duration_days: int | None = Field(default=None, ge=1)
    transport: TransportType | None = None


class RouteOwner(CamelModel):
    id: int
    name: str
    handle: str


class RouteOut(CamelModel):
    id: int
    title: str
    description: str
    cities: list[str]
    duration_days: int
    transport: TransportType
    saves_count: int
    owner: RouteOwner
    is_saved: bool
    created_at: datetime
    updated_at: datetime


class RouteSaveResponse(CamelModel):
    message: str
    saved: bool
    is_saved: bool
    saves: int


class RouteListResponse(PaginatedResponse[RouteOut]):
    pass
