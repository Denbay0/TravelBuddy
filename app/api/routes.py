import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, verify_csrf
from app.db.database import get_db
from app.db.models import Route, RouteSave, User
from app.schemas.auth import MessageResponse
from app.schemas.routes import RouteCreateRequest, RouteListResponse, RouteOut, RouteOwner, RouteUpdateRequest

router = APIRouter(prefix="/routes", tags=["routes"])


def _serialize_route(route: Route, current_user_id: int | None = None) -> RouteOut:
    return RouteOut(
        id=route.id,
        title=route.title,
        description=route.description,
        cities=json.loads(route.cities) if route.cities else [],
        duration_days=route.duration_days,
        saves_count=len(route.saves),
        owner=RouteOwner(id=route.owner.id, name=route.owner.username, handle=f"@{route.owner.handle}"),
        is_saved=bool(current_user_id and any(save.user_id == current_user_id for save in route.saves)),
        created_at=route.created_at,
        updated_at=route.updated_at,
    )


@router.get("", response_model=RouteListResponse)
def list_routes(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RouteListResponse:
    total = db.scalar(select(func.count(Route.id))) or 0
    routes = (
        db.execute(select(Route).order_by(Route.created_at.desc()).offset((page - 1) * limit).limit(limit))
        .scalars()
        .all()
    )
    return RouteListResponse(
        items=[_serialize_route(route, current_user.id) for route in routes], page=page, limit=limit, total=total
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
        cities=json.dumps(payload.cities),
        duration_days=payload.duration_days,
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
    total = db.scalar(select(func.count(Route.id))) or 0
    routes = (
        db.execute(
            select(Route)
            .outerjoin(RouteSave, RouteSave.route_id == Route.id)
            .group_by(Route.id)
            .order_by(func.count(RouteSave.id).desc(), Route.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )
        .scalars()
        .all()
    )
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
    if "cities" in updates:
        route.cities = json.dumps(updates["cities"])
    if "duration_days" in updates:
        route.duration_days = updates["duration_days"]

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


@router.post("/{route_id}/save", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def save_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    route = db.scalar(select(Route).where(Route.id == route_id))
    if not route:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Route not found")

    existing = db.scalar(select(RouteSave).where(RouteSave.route_id == route_id, RouteSave.user_id == current_user.id))
    if not existing:
        db.add(RouteSave(route_id=route_id, user_id=current_user.id))
        db.commit()
    return MessageResponse(message="Route saved")


@router.delete("/{route_id}/save", response_model=MessageResponse, dependencies=[Depends(verify_csrf)])
def unsave_route(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    existing = db.scalar(select(RouteSave).where(RouteSave.route_id == route_id, RouteSave.user_id == current_user.id))
    if existing:
        db.delete(existing)
        db.commit()
    return MessageResponse(message="Route unsaved")
