from collections.abc import Iterable
from typing import Any

from fastapi.testclient import TestClient
from pytest import MonkeyPatch

from app.core.config import settings
from app.schemas.transport import TransportType


DEFAULT_PASSWORD = "StrongPass1"


def auth_headers(csrf_token: str) -> dict[str, str]:
    return {"X-CSRF-Token": csrf_token}


def register_user(
    client: TestClient,
    *,
    name: str,
    email: str,
    password: str = DEFAULT_PASSWORD,
) -> dict[str, Any]:
    response = client.post(
        "/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
            "confirmPassword": password,
        },
    )
    assert response.status_code == 201
    return response.json()


def login_user(
    client: TestClient,
    *,
    email: str,
    password: str = DEFAULT_PASSWORD,
) -> tuple[dict[str, Any], str]:
    response = client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    body = response.json()
    return body, body["csrfToken"]


def register_and_login(
    client: TestClient,
    *,
    name: str,
    email: str,
    password: str = DEFAULT_PASSWORD,
) -> tuple[dict[str, Any], str]:
    register_user(client, name=name, email=email, password=password)
    return login_user(client, email=email, password=password)


def create_post(
    client: TestClient,
    csrf_token: str,
    *,
    title: str = "Post title",
    content: str = "Post content",
    city: str = "Paris",
    transport: str = TransportType.PLANE.value,
    trip_date: str = "1999-02-23",
) -> dict[str, Any]:
    response = client.post(
        "/posts",
        json={
            "title": title,
            "content": content,
            "city": city,
            "transport": transport,
            "tripDate": trip_date,
        },
        headers=auth_headers(csrf_token),
    )
    assert response.status_code == 201
    return response.json()


def create_route(
    client: TestClient,
    csrf_token: str,
    *,
    title: str = "Route title",
    description: str = "Route description",
    duration_days: int = 3,
    transport: str = TransportType.TRAIN.value,
    origin_name: str = "Moscow",
    origin_lat: float = 55.7558,
    origin_lon: float = 37.6173,
    destination_name: str = "Tula",
    destination_lat: float = 54.1931,
    destination_lon: float = 37.6175,
    distance_km: float = 180.0,
    route_type: str = "real",
    waypoints: Iterable[dict[str, Any]] | None = None,
    route_geojson: dict[str, Any] | None = None,
) -> dict[str, Any]:
    response = client.post(
        "/routes",
        json={
            "title": title,
            "description": description,
            "durationDays": duration_days,
            "transport": transport,
            "note": "",
            "originName": origin_name,
            "originLat": origin_lat,
            "originLon": origin_lon,
            "destinationName": destination_name,
            "destinationLat": destination_lat,
            "destinationLon": destination_lon,
            "waypoints": list(waypoints or []),
            "routeGeojson": route_geojson,
            "distanceKm": distance_km,
            "routeType": route_type,
        },
        headers=auth_headers(csrf_token),
    )
    assert response.status_code == 201
    return response.json()


def login_admin(
    client: TestClient,
    monkeypatch: MonkeyPatch,
    *,
    login: str = "admin",
    password: str = "admin",
) -> tuple[dict[str, Any], str]:
    monkeypatch.setattr(settings, "env", "dev")
    monkeypatch.setattr(settings, "admin_login", login)
    monkeypatch.setattr(settings, "admin_password", password)

    response = client.post(
        "/api/admin/auth/login",
        json={"login": login, "password": password},
    )
    assert response.status_code == 200
    body = response.json()
    return body, body["csrfToken"]
