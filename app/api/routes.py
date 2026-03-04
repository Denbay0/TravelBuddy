import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_current_user_optional, verify_csrf
from app.db.database import get_db
from app.db.models import Route, RouteSave, User
from app.schemas.auth import MessageResponse
from app.schemas.routes import RouteCreateRequest, RouteListResponse, RouteOut, RouteOwner, RoutePoint, RouteSaveResponse, RouteUpdateRequest

router = APIRouter(prefix="/routes", tags=["routes"])


def _parse_waypoints(raw: str | None) -> list[RoutePoint]:
    if not raw:
        return []
    try:
        data = json.loads(raw)
    except (TypeError, json.JSONDecodeError):
        return []
    if not isinstance(data, list):
        return []

    points: list[RoutePoint] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        try:
            points.append(RoutePoint(name=str(item.get("name", "Точка")), lat=float(item.get("lat")), lon=float(item.get("lon"))))
        except (TypeError, ValueError):
            continue
    return points


def _parse_route_data(raw_cities: str | None) -> tuple[list[str], list[RoutePoint], float, str]:
    if not raw_cities:
        return [], [], 0.0, ''
    try:
        parsed = json.loads(raw_cities)
    except (TypeError, json.JSONDecodeError):
        return [], [], 0.0, ''

    if isinstance(parsed, list):
        return [str(city) for city in parsed], [], 0.0, ''

    if isinstance(parsed, dict):
        cities = parsed.get('cities', [])
        safe_cities = [str(city) for city in cities] if isinstance(cities, list) else []
        points = _parse_waypoints(json.dumps(parsed.get('points', []), ensure_ascii=False))
        distance_km = float(parsed.get('distance_km') or 0)
        note = str(parsed.get('note') or '')
        return safe_cities, points, distance_km, note

    return [], [], 0.0, ''


def _legacy_cities(route: Route) -> list[str]:
    if route.origin_name and route.destination_name:
        return [route.origin_name, *[w.name for w in _parse_waypoints(route.waypoints_json)], route.destination_name]
    try:
        parsed = json.loads(route.cities)
    except (TypeError, json.JSONDecodeError):
        return []
    if isinstance(parsed, dict):
        cities = parsed.get("cities", [])
        return [str(city) for city in cities] if isinstance(cities, list) else []
    if isinstance(parsed, list):
        return [str(city) for city in parsed]
    return []


def _serialize_route(route: Route, current_user_id: int | None = None) -> RouteOut:
    waypoints = _parse_waypoints(route.waypoints_json)
    cities = _legacy_cities(route)
    origin_name = route.origin_name or (cities[0] if cities else "")
    destination_name = route.destination_name or (cities[-1] if len(cities) > 1 else "")

    geojson: dict | None = None
    if route.route_geojson:
        try:
            parsed_geojson = json.loads(route.route_geojson)
            if isinstance(parsed_geojson, dict):
                geojson = parsed_geojson
        except json.JSONDecodeError:
            geojson = None

    return RouteOut(
        id=route.id,
        title=route.title,
        description=route.description or "",
        duration_days=route.duration_days or 0,
        transport=route.transport,
        note="",
        cities=cities,
        origin_name=origin_name,
        origin_lat=route.origin_lat,
        origin_lon=route.origin_lon,
        destination_name=destination_name,
        destination_lat=route.destination_lat,
        destination_lon=route.destination_lon,
        waypoints=waypoints,
        route_geojson=geojson,
        distance_km=route.distance_km,
        route_type=("real" if route.route_type == "real" else "schematic"),
        saves_count=len(route.saves or []),
        owner=RouteOwner(id=route.owner.id, name=route.owner.username, handle=f"@{route.owner.handle}"),
        is_saved=bool(current_user_id and any(save.user_id == current_user_id for save in (route.saves or []))),
        created_at=route.created_at,
        updated_at=route.updated_at,
    )


@router.get("", response_model=RouteListResponse)
def list_routes(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> RouteListResponse:
    routes = db.execute(select(Route).order_by(Route.created_at.desc())).scalars().all()

    if q:
        search = q.lower().strip()
        routes = [route for route in routes if search in route.title.lower() or search in (route.description or "").lower() or search in " ".join(_legacy_cities(route)).lower()]

    total = len(routes)
    start = (page - 1) * limit
    paginated = routes[start : start + limit]
    return RouteListResponse(items=[_serialize_route(route, current_user.id if current_user else None) for route in paginated], page=page, limit=limit, total=total)


@router.post("", response_model=RouteOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(verify_csrf)])
def create_route(payload: RouteCreateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> RouteOut:
    route = Route(
        owner_id=current_user.id,
        title=payload.title,
        description=payload.description,
        cities=json.dumps([payload.origin_name, *[w.name for w in payload.waypoints], payload.destination_name], ensure_ascii=False),
        duration_days=payload.duration_days,
        transport=payload.transport,
        origin_name=payload.origin_name,
        origin_lat=payload.origin_lat,
        origin_lon=payload.origin_lon,
        destination_name=payload.destination_name,
        destination_lat=payload.destination_lat,
        destination_lon=payload.destination_lon,
        waypoints_json=json.dumps([point.model_dump() for point in payload.waypoints], ensure_ascii=False),
        route_geojson=json.dumps(payload.route_geojson, ensure_ascii=False) if payload.route_geojson else None,
        distance_km=payload.distance_km,
        route_type=payload.route_type,
    )
    db.add(route)
    db.commit()
    db.refresh(route)
    return _serialize_route(route, current_user.id if current_user else None)


@router.get("/trending", response_model=RouteListResponse)
def trending_routes(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
) -> RouteListResponse:
    all_routes = (
        db.execute(select(Route).outerjoin(RouteSave, RouteSave.route_id == Route.id).group_by(Route.id).order_by(func.count(RouteSave.id).desc(), Route.created_at.desc()))
        .scalars()
        .all()
    )
    total = len(all_routes)
    start = (page - 1) * limit
    routes = all_routes[start : start + limit]
    return RouteListResponse(items=[_serialize_route(route, current_user.id if current_user else None) for route in routes], page=page, limit=limit, total=total)


@router.get("/{route_id}", response_model=RouteOut)
def get_route(route_id: int, db: Session = Depends(get_db), current_user: User | None = Depends(get_current_user_optional)) -> RouteOut:
    route = db.scalar(select(Route).where(Route.id == route_id))
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
    return _serialize_route(route, current_user.id if current_user else None)


@router.patch("/{route_id}", response_model=RouteOut, dependencies=[Depends(verify_csrf)])
def update_route(route_id: int, payload: RouteUpdateRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> RouteOut:
    route = db.scalar(select(Route).where(Route.id == route_id))
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")
    if route.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only owner can edit this route")

    updates = payload.model_dump(exclude_unset=True)
    for field in ["title", "description", "duration_days", "transport", "origin_name", "origin_lat", "origin_lon", "destination_name", "destination_lat", "destination_lon", "distance_km", "route_type"]:
        if field in updates:
            setattr(route, field, updates[field])

    if "waypoints" in updates and isinstance(updates["waypoints"], list):
        route.waypoints_json = json.dumps(updates["waypoints"], ensure_ascii=False)
    if "route_geojson" in updates:
        route.route_geojson = json.dumps(updates["route_geojson"], ensure_ascii=False) if updates["route_geojson"] else None

    db.add(route)
    db.commit()
    db.refresh(route)
    return _serialize_route(route, current_user.id if current_user else None)


@router.delete("/{route_id}", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def delete_route(route_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> MessageResponse:
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
