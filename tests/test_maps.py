import httpx

from app.api import maps as maps_api
from app.core.config import settings
from app.schemas.transport import TransportType


class DummyAsyncResponse:
    def __init__(self, payload: dict, *, status_code: int = 200, url: str = "https://example.test") -> None:
        self._payload = payload
        self.status_code = status_code
        self.request = httpx.Request("GET", url)

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise httpx.HTTPStatusError(
                "HTTP error",
                request=self.request,
                response=httpx.Response(self.status_code, request=self.request, json=self._payload),
            )

    def json(self) -> dict:
        return self._payload


class DummyAsyncClient:
    def __init__(self, response: DummyAsyncResponse, calls: list[tuple[str, dict | None]]) -> None:
        self._response = response
        self._calls = calls

    async def __aenter__(self) -> "DummyAsyncClient":
        return self

    async def __aexit__(self, *_args) -> None:
        return None

    async def get(self, url: str, params: dict | None = None) -> DummyAsyncResponse:
        self._calls.append((url, params))
        return self._response


def _install_async_client_stub(monkeypatch, response: DummyAsyncResponse, calls: list[tuple[str, dict | None]]) -> None:
    monkeypatch.setattr(
        maps_api.httpx,
        "AsyncClient",
        lambda *args, **kwargs: DummyAsyncClient(response, calls),
    )


def test_geocode_suggest_success_and_cache(client, monkeypatch) -> None:
    monkeypatch.setattr(settings, "geoapify_api_key", "test-key")
    maps_api._geocode_cache.clear()
    calls: list[tuple[str, dict | None]] = []
    response = DummyAsyncResponse(
        {
            "features": [
                {
                    "properties": {
                        "formatted": "Moscow, Russia",
                        "country": "Russia",
                        "city": "Moscow",
                    },
                    "geometry": {"coordinates": [37.6173, 55.7558]},
                }
            ]
        },
        url=maps_api.GEOCODE_ENDPOINT,
    )
    _install_async_client_stub(monkeypatch, response, calls)

    first_response = client.get("/maps/geocode/suggest", params={"q": "Moscow"})
    assert first_response.status_code == 200
    assert first_response.json()["items"][0]["label"] == "Moscow, Russia"
    assert len(calls) == 1

    cached_response = client.get("/maps/geocode/suggest", params={"q": "Moscow"})
    assert cached_response.status_code == 200
    assert cached_response.json()["items"][0]["city"] == "Moscow"
    assert len(calls) == 1


def test_route_preview_schematic_for_plane(client) -> None:
    response = client.post(
        "/maps/route-preview",
        json={
            "transport": TransportType.PLANE.value,
            "origin": {"name": "Moscow", "lat": 55.7558, "lon": 37.6173},
            "destination": {"name": "Paris", "lat": 48.8566, "lon": 2.3522},
            "waypoints": [],
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["routeType"] == "schematic"
    assert body["distanceKm"] > 0
    assert body["warnings"]


def test_route_preview_real_route_with_provider_response(client, monkeypatch) -> None:
    monkeypatch.setattr(settings, "geoapify_api_key", "test-key")
    calls: list[tuple[str, dict | None]] = []
    response = DummyAsyncResponse(
        {
            "features": [
                {
                    "properties": {"distance": 12345, "time": 3600},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [37.6173, 55.7558],
                            [37.8, 55.7],
                            [38.0, 55.6],
                        ],
                    },
                }
            ]
        },
        url=maps_api.ROUTING_ENDPOINT,
    )
    _install_async_client_stub(monkeypatch, response, calls)

    route_response = client.post(
        "/maps/route-preview",
        json={
            "transport": TransportType.WALK.value,
            "origin": {"name": "Moscow", "lat": 55.7558, "lon": 37.6173},
            "destination": {"name": "Park", "lat": 55.6, "lon": 38.0},
            "waypoints": [],
        },
    )

    assert route_response.status_code == 200
    body = route_response.json()
    assert body["routeType"] == "real"
    assert body["distanceKm"] == 12.35
    assert body["durationMinutes"] == 60.0
    assert body["warnings"] == []
    assert len(calls) == 1
