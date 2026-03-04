from datetime import datetime

from pydantic import Field

from app.schemas.common import CamelModel, PaginatedResponse
from app.schemas.transport import TransportType


class RoutePoint(CamelModel):
    name: str = Field(min_length=1, max_length=128)
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)


class RouteCreateRequest(CamelModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    start_location: str = Field(min_length=1, max_length=128)
    end_location: str = Field(min_length=1, max_length=128)
    stops: list[str] = Field(default_factory=list)
    duration_days: int = Field(default=1, ge=1)
    transport: TransportType = TransportType.WALK
    note: str = ""
    points: list[RoutePoint] = Field(min_length=2)


class RouteUpdateRequest(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    start_location: str | None = Field(default=None, min_length=1, max_length=128)
    end_location: str | None = Field(default=None, min_length=1, max_length=128)
    stops: list[str] | None = None
    duration_days: int | None = Field(default=None, ge=1)
    transport: TransportType | None = None
    note: str | None = None
    points: list[RoutePoint] | None = None


class RouteOwner(CamelModel):
    id: int
    name: str
    handle: str


class RouteOut(CamelModel):
    id: int
    title: str
    description: str
    start_location: str
    end_location: str
    stops: list[str]
    cities: list[str]
    duration_days: int
    transport: TransportType
    note: str
    points: list[RoutePoint]
    distance_km: float
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


class RoutePreviewRequest(CamelModel):
    points: list[RoutePoint] = Field(min_length=2)


class RoutePreviewResponse(CamelModel):
    distance_km: float
