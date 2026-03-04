from typing import Literal

from pydantic import Field, model_validator

from app.schemas.common import CamelModel
from app.schemas.routes import RoutePoint
from app.schemas.transport import TransportType


class GeocodeSuggestItem(CamelModel):
    label: str
    lat: float
    lon: float
    country: str | None = None
    city: str | None = None
    raw: dict | None = None


class GeocodeSuggestResponse(CamelModel):
    items: list[GeocodeSuggestItem] = Field(default_factory=list)


class RoutePreviewRequest(CamelModel):
    transport: TransportType
    origin: RoutePoint
    destination: RoutePoint
    waypoints: list[RoutePoint] = Field(default_factory=list)


class RoutePreviewResponse(CamelModel):
    mode: TransportType
    route_type: Literal["real", "schematic"]
    distance_km: float
    duration_minutes: float | None = None
    bounds: list[list[float]]
    points: list[RoutePoint]
    geojson: dict | None = None
    warnings: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def ensure_bounds(self) -> "RoutePreviewResponse":
        if len(self.bounds) != 2:
            raise ValueError("Bounds should include southwest and northeast points")
        return self
