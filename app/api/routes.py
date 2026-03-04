import json
import math

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, verify_csrf
from app.db.database import get_db
from app.db.models import Route, RouteSave, User
from app.schemas.auth import MessageResponse
from app.schemas.routes import (
    RouteCreateRequest,
    RouteListResponse,
    RouteOut,
    RouteOwner,
    RoutePoint,
    RoutePreviewRequest,
    RoutePreviewResponse,
    RouteSaveResponse,
    RouteUpdateRequest,
)

router = APIRouter(prefix="/routes", tags=["routes"])


def _haversine_km(a: RoutePoint, b: RoutePoint) -> float:
    r = 6371.0
    d_lat = math.radians(b.lat - a.lat)
    d_lon = math.radians(b.lon - a.lon)
    lat1 = math.radians(a.lat)
    lat2 = math.radians(b.lat)
    x = math.sin(d_lat / 2) ** 2 + math.sin(d_lon / 2) ** 2 * math.cos(lat1) * math.cos(lat2)
    return r * (2 * math.atan2(math.sqrt(x), math.sqrt(1 - x)))


def _compute_distance_km(points: list[RoutePoint]) -> float:
    if len(points) < 2:
        return 0
    total = 0.0
    for idx in range(1, len(points)):
        total += _haversine_km(points[idx - 1], points[idx])
    return round(total, 2)


def _extract_locations(cities: list[str], payload: dict) -> tuple[str, str, list[str]]:
    start_location = str(payload.get("start_location") or "").strip() if isinstance(payload, dict) else ""
    end_location = str(payload.get("end_location") or "").strip() if isinstance(payload, dict) else ""

    raw_stops = payload.get("stops", []) if isinstance(payload, dict) else []
    stops = [str(stop).strip() for stop in raw_stops if str(stop).strip()] if isinstance(raw_stops, list) else []

    if not start_location and cities:
        start_location = cities[0]
    if not end_location and len(cities) > 1:
        end_location = cities[-1]
    if not stops and len(cities) > 2:
        stops = cities[1:-1]

    return start_location, end_location, stops


def _parse_route_data(raw_cities: str | None) -> tuple[str, str, list[str], list[str], list[RoutePoint], float, str]:
    if not raw_cities:
        return "", "", [], [], [], 0.0, ""

    try:
        parsed = json.loads(raw_cities)
    except (TypeError, json.JSONDecodeError):
        return "", "", [], [], [], 0.0, ""

    if isinstance(parsed, list):
        cities = [str(city) for city in parsed]
        start_location, end_location, stops = _extract_locations(cities, {})
        return start_location, end_location, stops, cities, [], 0.0, ""

    if isinstance(parsed, dict):
        points: list[RoutePoint] = []
        raw_points = parsed.get("points", [])
        if isinstance(raw_points, list):
            for item in raw_points:
                if not isinstance(item, dict):
                    continue
                try:
                    points.append(
                        RoutePoint(name=str(item.get("name", "")), lat=float(item.get("lat")), lon=float(item.get("lon")))
                    )
                except (TypeError, ValueError):
                    continue

        cities = parsed.get("cities", [])
        safe_cities = [str(city) for city in cities] if isinstance(cities, list) else []
        start_location, end_location, stops = _extract_locations(safe_cities, parsed)
        distance_km = parsed.get("distance_km")
        note = parsed.get("note")
        return (
            start_location,
            end_location,
            stops,
            safe_cities,
            points,
            float(distance_km) if isinstance(distance_km, (int, float)) else _compute_distance_km(points),
            str(note) if isinstance(note, str) else "",
        )

    return "", "", [], [], [], 0.0, ""


def _pack_route_data(start_location: str, end_location: str, stops: list[str], points: list[RoutePoint], note: str) -> str:
    cities = [start_location, *stops, end_location]
    return json.dumps(
        {
            "start_location": start_location,
            "end_location": end_location,
            "stops": stops,
            "cities": cities,
            "points": [point.model_dump() for point in points],
            "distance_km": _compute_distance_km(points),
            "note": note,
        },
        ensure_ascii=False,
    )


def _serialize_route(route: Route, current_user_id: int | None = None) -> RouteOut:
    start_location, end_location, stops, cities, points, distance_km, note = _parse_route_data(route.cities)
    return RouteOut(
        id=route.id,
        title=route.title,
        description=route.description or "",
        start_location=start_location,
        end_location=end_location,
        stops=stops,
        cities=cities,
        duration_days=route.duration_days or 0,
        transport=route.transport,
        note=note,
        points=points,
        distance_km=distance_km,
        saves_count=len(route.saves or []),
        owner=RouteOwner(id=route.owner.id, name=route.owner.username, handle=f"@{route.owner.handle}"),
        is_saved=bool(current_user_id and any(save.user_id == current_user_id for save in (route.saves or []))),
        created_at=route.created_at,
        updated_at=route.updated_at,
    )


@router.post("/preview", response_model=RoutePreviewResponse)
def preview_route(payload: RoutePreviewRequest) -> RoutePreviewResponse:
    return RoutePreviewResponse(distance_km=_compute_distance_km(payload.points))


@router.get("", response_model=RouteListResponse)
def list_routes(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RouteListResponse:
    routes_query = select(Route).order_by(Route.created_at.desc())
    routes = db.execute(routes_query).scalars().all()

    if q and q.strip():
        search = q.strip().lower()
        routes = [
            route
            for route in routes
            if search in route.title.lower() or search in (route.description or "").lower() or search in (route.cities or "").lower()
        ]

    total = len(routes)
    start = (page - 1) * limit
    paginated = routes[start : start + limit]
    return RouteListResponse(
        items=[_serialize_route(route, current_user.id) for route in paginated], page=page, limit=limit, total=total
    )


@router.post("", response_model=RouteOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_csrf)])
def create_route(
    payload: RouteCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RouteOut:
    route = Route(
        owner_id=current_user.id,
        title=payload.title,
        description=payload.description,
        cities=_pack_route_data(payload.start_location, payload.end_location, payload.stops, payload.points, payload.note),
        duration_days=payload.duration_days,
        transport=payload.transport,
    )
    db.add(route)
    db.commit()
    db.refresh(route)
    return _serialize_route(route, current_user.id)


@router.get("/trending", response_model=RouteListResponse)
def trending_routes(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RouteListResponse:
    all_routes = (
        db.execute(
            select(Route)
            .outerjoin(RouteSave, RouteSave.route_id == Route.id)
            .group_by(Route.id)
            .order_by(func.count(RouteSave.id).desc(), Route.created_at.desc())
        )
        .scalars()
        .all()
    )

    total = len(all_routes)
    start = (page - 1) * limit
    routes = all_routes[start : start + limit]
    return RouteListResponse(
        items=[_serialize_route(route, current_user.id) for route in routes], page=page, limit=limit, total=total
    )


@router.get("/{route_id}", response_model=RouteOut)
def get_route(route_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> RouteOut:
    route = db.scalar(select(Route).where(Route.id == route_id))
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
    return _serialize_route(route, current_user.id)


@router.patch("/{route_id}", response_model=RouteOut, dependencies=[Depends(verify_csrf)])
def update_route(
    route_id: int,
    payload: RouteUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RouteOut:
    route = db.scalar(select(Route).where(Route.id == route_id))
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
    if route.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can edit this route")

    updates = payload.model_dump(exclude_unset=True)
    if "title" in updates:
        route.title = updates["title"]
    if "description" in updates:
        route.description = updates["description"]
    if "duration_days" in updates:
        route.duration_days = updates["duration_days"]
    if "transport" in updates:
        route.transport = updates["transport"]

    start_location, end_location, stops, _, points, _, note = _parse_route_data(route.cities)
    next_start_location = updates.get("start_location", start_location)
    next_end_location = updates.get("end_location", end_location)
    next_stops = updates.get("stops", stops)
    next_points = updates.get("points", points)
    next_note = updates.get("note", note)
    route.cities = _pack_route_data(next_start_location, next_end_location, next_stops, next_points, next_note)

    db.add(route)
    db.commit()
    db.refresh(route)
    return _serialize_route(route, current_user.id)


@router.delete("/{route_id}", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def delete_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    route = db.scalar(select(Route).where(Route.id == route_id))
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
    if route.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can delete this route")

    db.delete(route)
    db.commit()
    return MessageResponse(message="Route deleted")


@router.post("/{route_id}/save", response_model=RouteSaveResponse, dependencies=[Depends(verify_csrf)])
def save_route(route_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> RouteSaveResponse:
    route = db.scalar(select(Route).where(Route.id == route_id))
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")

    existing = db.scalar(select(RouteSave).where(RouteSave.route_id == route_id, RouteSave.user_id == current_user.id))
    if not existing:
        db.add(RouteSave(route_id=route_id, user_id=current_user.id))
        db.commit()

    saves = db.scalar(select(func.count(RouteSave.id)).where(RouteSave.route_id == route_id)) or 0
    return RouteSaveResponse(message="Route saved", saved=True, is_saved=True, saves=saves)


@router.delete("/{route_id}/save", response_model=RouteSaveResponse, dependencies=[Depends(verify_csrf)])
def unsave_route(route_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> RouteSaveResponse:
    existing = db.scalar(select(RouteSave).where(RouteSave.route_id == route_id, RouteSave.user_id == current_user.id))
    if existing:
        db.delete(existing)
        db.commit()

    saves = db.scalar(select(func.count(RouteSave.id)).where(RouteSave.route_id == route_id)) or 0
    return RouteSaveResponse(message="Route unsaved", saved=False, is_saved=False, saves=saves)
