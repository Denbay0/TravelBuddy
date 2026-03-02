from io import BytesIO

from fastapi.testclient import TestClient


def _register_and_login(client: TestClient) -> str:
    register_response = client.post(
        "/auth/register",
        json={
            "username": "valid_user",
            "email": "user@example.com",
            "password": "StrongPass1",
            "repeat_password": "StrongPass1",
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={"username_or_email": "valid_user", "password": "StrongPass1"},
    )
    assert login_response.status_code == 200
    return login_response.json()["csrf_token"]


def test_profile_me(client: TestClient) -> None:
    _register_and_login(client)
    response = client.get("/profile/me")

    assert response.status_code == 200
    assert response.json()["handle"] == "@valid_user"
    assert response.json()["avatar_url"] == "/media/avatars/default.svg"


def test_profile_update_username_recalculates_handle(client: TestClient) -> None:
    csrf = _register_and_login(client)

    response = client.patch(
        "/profile/me",
        json={"username": "new_name"},
        headers={"X-CSRF-Token": csrf},
    )

    assert response.status_code == 200
    assert response.json()["username"] == "new_name"
    assert response.json()["handle"] == "@new_name"

    login_with_old = client.post(
        "/auth/login",
        json={"username_or_email": "valid_user", "password": "StrongPass1"},
    )
    assert login_with_old.status_code == 401

    login_with_new = client.post(
        "/auth/login",
        json={"username_or_email": "new_name", "password": "StrongPass1"},
    )
    assert login_with_new.status_code == 200


def test_upload_and_reset_avatar(client: TestClient) -> None:
    csrf = _register_and_login(client)

    upload_response = client.post(
        "/profile/avatar",
        files={"file": ("avatar.png", BytesIO(b"\x89PNG\r\n\x1a\nsmall"), "image/png")},
        headers={"X-CSRF-Token": csrf},
    )

    assert upload_response.status_code == 200
    assert upload_response.json()["avatar_url"].startswith("/media/avatars/user_")

    delete_response = client.delete("/profile/avatar", headers={"X-CSRF-Token": csrf})
    assert delete_response.status_code == 200

    profile_response = client.get("/profile/me")
    assert profile_response.json()["avatar_url"] == "/media/avatars/default.svg"
