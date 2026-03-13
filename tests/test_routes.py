from app.schemas.transport import TransportType
from tests.helpers import auth_headers, create_route, register_and_login


def test_route_crud_flow(client) -> None:
    _, csrf = register_and_login(
        client,
        name="RouteOwner",
        email="route-owner@example.com",
    )

    created_route = create_route(
        client,
        csrf,
        title="Golden Ring",
        description="Historic cities route",
        transport=TransportType.TRAIN.value,
        origin_name="Moscow",
        destination_name="Vladimir",
        waypoints=[{"name": "Suzdal", "lat": 56.4197, "lon": 40.4495}],
        route_geojson={"type": "Feature", "geometry": {"type": "LineString", "coordinates": [[37.6173, 55.7558], [40.4495, 56.4197], [40.4066, 56.1291]]}},
        distance_km=220.5,
    )

    assert created_route["title"] == "Golden Ring"
    assert created_route["transport"] == TransportType.TRAIN.value
    assert created_route["cities"] == ["Moscow", "Suzdal", "Vladimir"]

    route_id = created_route["id"]

    get_response = client.get(f"/routes/{route_id}")
    assert get_response.status_code == 200
    assert get_response.json()["title"] == "Golden Ring"

    list_response = client.get("/routes", params={"page": 1, "limit": 10, "q": "golden"})
    assert list_response.status_code == 200
    assert list_response.json()["total"] == 1
    assert list_response.json()["items"][0]["id"] == route_id

    update_response = client.patch(
        f"/routes/{route_id}",
        json={
            "title": "Golden Ring Updated",
            "transport": TransportType.PLANE.value,
            "distanceKm": 300.0,
            "waypoints": [{"name": "Yaroslavl", "lat": 57.6261, "lon": 39.8845}],
        },
        headers=auth_headers(csrf),
    )
    assert update_response.status_code == 200
    updated_route = update_response.json()
    assert updated_route["title"] == "Golden Ring Updated"
    assert updated_route["transport"] == TransportType.PLANE.value
    assert updated_route["distanceKm"] == 300.0
    assert updated_route["waypoints"][0]["name"] == "Yaroslavl"

    delete_response = client.delete(f"/routes/{route_id}", headers=auth_headers(csrf))
    assert delete_response.status_code == 200
    assert delete_response.json()["message"] == "Route deleted"

    missing_response = client.get(f"/routes/{route_id}")
    assert missing_response.status_code == 404


def test_route_save_and_trending_flow(client) -> None:
    _, owner_csrf = register_and_login(
        client,
        name="TrendingOwner",
        email="trending-owner@example.com",
    )
    first_route = create_route(client, owner_csrf, title="Saved First Route")
    second_route = create_route(client, owner_csrf, title="Plain Second Route", destination_name="Tver")

    _, saver_csrf = register_and_login(
        client,
        name="RouteSaver",
        email="route-saver@example.com",
    )

    save_response = client.post(
        f"/routes/{first_route['id']}/save",
        headers=auth_headers(saver_csrf),
    )
    assert save_response.status_code == 200
    assert save_response.json()["saved"] is True
    assert save_response.json()["saves"] == 1

    trending_response = client.get("/routes/trending", params={"page": 1, "limit": 10})
    assert trending_response.status_code == 200
    items = trending_response.json()["items"]
    assert items[0]["id"] == first_route["id"]
    assert items[0]["isSaved"] is True
    assert {item["id"] for item in items} == {first_route["id"], second_route["id"]}

    unsave_response = client.delete(
        f"/routes/{first_route['id']}/save",
        headers=auth_headers(saver_csrf),
    )
    assert unsave_response.status_code == 200
    assert unsave_response.json()["saved"] is False
    assert unsave_response.json()["saves"] == 0
