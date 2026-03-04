import math
from collections import OrderedDict

import httpx
from fastapi import APIRouter, HTTPException, Query, status

from app.core.config import settings
from app.schemas.maps import GeocodeSuggestItem, GeocodeSuggestResponse, RoutePreviewRequest, RoutePreviewResponse
from app.schemas.routes import RoutePoint
from app.schemas.transport import TransportType

router = APIRouter(prefix="/maps", tags=["maps"])

GEOCODE_ENDPOINT = "https://api.geoapify.com/v1/geocode/autocomplete"
ROUTING_ENDPOINT = "https://api.geoapify.com/v1/routing"

_geocode_cache: OrderedDict[str, list[GeocodeSuggestItem]] = OrderedDict()
_GEOCODE_CACHE_LIMIT = 200


def _distance_km(a: RoutePoint, b: RoutePoint) -> float:
    r = 6371.0
    d_lat = math.radians(b.lat - a.lat)
    d_lon = math.radians(b.lon - a.lon)
    lat1 = math.radians(a.lat)
    lat2 = math.radians(b.lat)
    x = math.sin(d_lat / 2) ** 2 + math.sin(d_lon / 2) ** 2 * math.cos(lat1) * math.cos(lat2)
    return r * (2 * math.atan2(math.sqrt(x), math.sqrt(1 - x)))


def _compute_bounds(points: list[RoutePoint]) -> list[list[float]]:
    lats = [point.lat for point in points]
    lons = [point.lon for point in points]
    return [[min(lats), min(lons)], [max(lats), max(lons)]]


def _cache_get(query: str) -> list[GeocodeSuggestItem] | None:
    if query not in _geocode_cache:
        return None
    _geocode_cache.move_to_end(query)
    return _geocode_cache[query]


def _cache_set(query: str, items: list[GeocodeSuggestItem]) -> None:
    _geocode_cache[query] = items
    _geocode_cache.move_to_end(query)
    if len(_geocode_cache) > _GEOCODE_CACHE_LIMIT:
        _geocode_cache.popitem(last=False)


@router.get("/geocode/suggest", response_model=GeocodeSuggestResponse)
async def geocode_suggest(q: str = Query(min_length=2, max_length=200)) -> GeocodeSuggestResponse:
    if not settings.geoapify_api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Geoapify API key is not configured")

    query = q.strip()
    if not query:
        return GeocodeSuggestResponse(items=[])

    cached = _cache_get(query.lower())
    if cached is not None:
        return GeocodeSuggestResponse(items=cached)

    params = {"text": query, "apiKey": settings.geoapify_api_key, "limit": 7, "lang": "ru"}
    async with httpx.AsyncClient(timeout=12) as client:
        try:
            response = await client.get(GEOCODE_ENDPOINT, params=params)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            message = "Провайдер геокодинга временно недоступен"
            raise HTTPException(status_code=exc.response.status_code, detail=message) from exc
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Не удалось получить подсказки геокодера") from exc

    payload = response.json()
    features = payload.get("features", []) if isinstance(payload, dict) else []
    items: list[GeocodeSuggestItem] = []
    for feature in features:
        props = feature.get("properties", {})
        coords = feature.get("geometry", {}).get("coordinates", [None, None])
        lon, lat = coords[0], coords[1]
        if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
            continue
        items.append(
            GeocodeSuggestItem(
                label=props.get("formatted") or props.get("address_line1") or "Без названия",
                lat=float(lat),
                lon=float(lon),
                country=props.get("country"),
                city=props.get("city") or props.get("state") or props.get("county"),
                raw={"provider": "geoapify", "properties": props},
            )
        )

    _cache_set(query.lower(), items)
    return GeocodeSuggestResponse(items=items)


@router.post("/route-preview", response_model=RoutePreviewResponse)
async def route_preview(payload: RoutePreviewRequest) -> RoutePreviewResponse:
    points = [payload.origin, *payload.waypoints, payload.destination]
    if len(points) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Недостаточно данных для построения")

    if payload.transport in {TransportType.TRAIN, TransportType.PLANE}:
        distance = 0.0
        for idx in range(1, len(points)):
            distance += _distance_km(points[idx - 1], points[idx])
        return RoutePreviewResponse(
            mode=payload.transport,
            route_type="schematic",
            distance_km=round(distance, 2),
            duration_minutes=None,
            bounds=_compute_bounds(points),
            points=points,
            geojson={
                "type": "Feature",
                "geometry": {"type": "LineString", "coordinates": [[p.lon, p.lat] for p in points]},
                "properties": {"mode": payload.transport.value, "schematic": True},
            },
            warnings=["Схематичный маршрут"],
        )

    if not settings.geoapify_api_key:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Geoapify API key is not configured")

    waypoints = "|".join(f"{point.lon},{point.lat}" for point in points)
    mode = "walk" if payload.transport == TransportType.WALK else "drive"
    params = {"waypoints": waypoints, "mode": mode, "apiKey": settings.geoapify_api_key, "details": "route_details"}

    async with httpx.AsyncClient(timeout=15) as client:
        try:
            response = await client.get(ROUTING_ENDPOINT, params=params)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=exc.response.status_code, detail="Не удалось построить маршрут по выбранным точкам") from exc
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Ошибка связи с сервисом маршрутизации") from exc

    data = response.json()
    features = data.get("features", []) if isinstance(data, dict) else []
    if not features:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Нет совпадений по точкам")

    feature = features[0]
    props = feature.get("properties", {})
    distance_m = props.get("distance", 0)
    time_s = props.get("time")

    try:
        distance_km = round(float(distance_m) / 1000, 2)
    except (TypeError, ValueError):
        distance_km = 0.0

    duration_minutes = None
    if isinstance(time_s, (int, float)):
        duration_minutes = round(float(time_s) / 60, 1)

    geometry = feature.get("geometry", {})
    coordinates = geometry.get("coordinates", []) if isinstance(geometry, dict) else []
    if not isinstance(coordinates, list) or len(coordinates) < 2:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Нет совпадений по точкам")

    line_points: list[RoutePoint] = []
    for idx, coord in enumerate(coordinates):
        if not isinstance(coord, list) or len(coord) != 2:
            continue
        lon, lat = coord[0], coord[1]
        if isinstance(lat, (int, float)) and isinstance(lon, (int, float)):
            line_points.append(RoutePoint(name=f"point-{idx + 1}", lat=float(lat), lon=float(lon)))

    if len(line_points) < 2:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Нет совпадений по точкам")

    return RoutePreviewResponse(
        mode=payload.transport,
        route_type="real",
        distance_km=distance_km,
        duration_minutes=duration_minutes,
        bounds=_compute_bounds(line_points),
        points=points,
        geojson={"type": "Feature", "geometry": geometry, "properties": {"mode": payload.transport.value}},
        warnings=[],
    )
