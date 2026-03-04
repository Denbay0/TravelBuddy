from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas.common import CamelModel, PaginatedResponse
from app.schemas.transport import TransportType


class RoutePoint(CamelModel):
    name: str = Field(min_length=1, max_length=255)
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)


class RouteCreateRequest(CamelModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = ""
    duration_days: int = Field(default=1, ge=1)
    transport: TransportType = TransportType.WALK
    note: str = ""

    origin_name: str = Field(min_length=1, max_length=255)
    origin_lat: float = Field(ge=-90, le=90)
    origin_lon: float = Field(ge=-180, le=180)
    destination_name: str = Field(min_length=1, max_length=255)
    destination_lat: float = Field(ge=-90, le=90)
    destination_lon: float = Field(ge=-180, le=180)

    waypoints: list[RoutePoint] = Field(default_factory=list)
    route_geojson: dict | None = None
    distance_km: float = Field(default=0, ge=0)
    route_type: Literal["real", "schematic"] = "schematic"


class RouteUpdateRequest(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    duration_days: int | None = Field(default=None, ge=1)
    transport: TransportType | None = None
    note: str | None = None

    origin_name: str | None = Field(default=None, min_length=1, max_length=255)
    origin_lat: float | None = Field(default=None, ge=-90, le=90)
    origin_lon: float | None = Field(default=None, ge=-180, le=180)
    destination_name: str | None = Field(default=None, min_length=1, max_length=255)
    destination_lat: float | None = Field(default=None, ge=-90, le=90)
    destination_lon: float | None = Field(default=None, ge=-180, le=180)

    waypoints: list[RoutePoint] | None = None
    route_geojson: dict | None = None
    distance_km: float | None = Field(default=None, ge=0)
    route_type: Literal["real", "schematic"] | None = None


class RouteOwner(CamelModel):
    id: int
    name: str
    handle: str


class RouteOut(CamelModel):
    id: int
    title: str
    description: str
    duration_days: int
    transport: TransportType
    note: str
    cities: list[str]

    origin_name: str
    origin_lat: float
    origin_lon: float
    destination_name: str
    destination_lat: float
    destination_lon: float
    waypoints: list[RoutePoint]
    route_geojson: dict | None
    distance_km: float
    route_type: Literal["real", "schematic"]

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
