from io import BytesIO

from fastapi.testclient import TestClient


def _register_and_login(client: TestClient) -> str:
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Valid_User",
            "email": "user@example.com",
            "password": "StrongPass1",
            "confirmPassword": "StrongPass1",
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "StrongPass1"},
    )
    assert login_response.status_code == 200
    return login_response.json()["csrfToken"]


def test_profile_me(client: TestClient) -> None:
    _register_and_login(client)
    response = client.get("/profile/me")

    assert response.status_code == 200
    body = response.json()
    assert body["handle"] == "@Valid_User"
    assert body["avatarUrl"] == "/media/avatars/default.svg"
    assert body["travelTagline"] == ""
    assert body["bio"] == ""
    assert body["homeCity"] == ""
    assert body["visitedCities"] == []
    assert body["stats"] == {"trips": 0, "posts": 0, "savedRoutes": 0, "favoriteTransport": "Пешком"}
    assert body["favoriteRoutes"] == []


def test_profile_update_fields(client: TestClient) -> None:
    csrf = _register_and_login(client)

    response = client.patch(
        "/profile/me",
        json={
            "name": "New_Name",
            "travelTagline": "Wander more",
            "bio": "Travel addict",
            "homeCity": "Rome",
        },
        headers={"X-CSRF-Token": csrf},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["message"] == "Profile updated successfully"
    assert body["profile"]["name"] == "New_Name"
    assert body["profile"]["travelTagline"] == "Wander more"
    assert body["profile"]["bio"] == "Travel addict"
    assert body["profile"]["homeCity"] == "Rome"
    assert body["profile"]["handle"] == "@New_Name"


def test_upload_and_reset_avatar(client: TestClient) -> None:
    csrf = _register_and_login(client)

    upload_response = client.post(
        "/profile/avatar",
        files={"file": ("avatar.png", BytesIO(b"\x89PNG\r\n\x1a\nsmall"), "image/png")},
        headers={"X-CSRF-Token": csrf},
    )

    assert upload_response.status_code == 200
    assert upload_response.json()["avatarUrl"].startswith("/media/avatars/user_")

    delete_response = client.delete("/profile/avatar", headers={"X-CSRF-Token": csrf})
    assert delete_response.status_code == 200
    assert delete_response.json() == {"message": "Avatar reset to default"}


def test_profile_related_lists_are_paginated_and_not_null(client: TestClient) -> None:
    _register_and_login(client)

    posts_response = client.get("/profile/me/posts", params={"page": 2, "limit": 5})
    assert posts_response.status_code == 200
    assert posts_response.json() == {"page": 2, "limit": 5, "total": 0, "items": []}

    routes_response = client.get("/profile/me/favorite-routes", params={"page": 3, "limit": 2})
    assert routes_response.status_code == 200
    assert routes_response.json() == {"page": 3, "limit": 2, "total": 0, "items": []}
