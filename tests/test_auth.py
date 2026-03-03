from fastapi.testclient import TestClient


def _register_user(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={
            "username": "Valid_User",
            "email": "USER@example.com",
            "password": "StrongPass1",
            "repeat_password": "StrongPass1",
        },
    )
    assert response.status_code == 201


def test_register_success(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={
            "username": "  test_user  ",
            "email": "  TEST@Example.com  ",
            "password": "StrongPass1",
            "repeat_password": "StrongPass1",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["user"]["username"] == "test_user"
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["handle"] == "@test_user"


def test_register_password_mismatch(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={
            "username": "test_user",
            "email": "test@example.com",
            "password": "StrongPass1",
            "repeat_password": "StrongPass2",
        },
    )

    assert response.status_code == 422


def test_register_weak_password(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={
            "username": "test_user",
            "email": "test@example.com",
            "password": "weakpass",
            "repeat_password": "weakpass",
        },
    )

    assert response.status_code == 422


def test_register_password_too_long(client: TestClient) -> None:
    long_password = "A" * 73 + "a1"
    response = client.post(
        "/auth/register",
        json={
            "username": "test_user",
            "email": "test@example.com",
            "password": long_password,
            "repeat_password": long_password,
        },
    )

    assert response.status_code == 422


def test_login_password_too_long(client: TestClient) -> None:
    _register_user(client)
    long_password = "A" * 73 + "a1"

    response = client.post(
        "/auth/login",
        json={"username_or_email": "Valid_User", "password": long_password},
    )

    assert response.status_code == 422


def test_register_invalid_username(client: TestClient) -> None:
    response = client.post(
        "/auth/register",
        json={
            "username": "bad name",
            "email": "test@example.com",
            "password": "StrongPass1",
            "repeat_password": "StrongPass1",
        },
    )

    assert response.status_code == 422


def test_login_success(client: TestClient) -> None:
    _register_user(client)

    response = client.post(
        "/auth/login",
        json={"username_or_email": "user@EXAMPLE.com", "password": "StrongPass1"},
    )

    assert response.status_code == 200
    assert response.json()["message"] == "Login successful"


def test_login_failure(client: TestClient) -> None:
    _register_user(client)

    response = client.post(
        "/auth/login",
        json={"username_or_email": "Valid_User", "password": "WrongPass1"},
    )

    assert response.status_code == 401


def test_me_authorized(client: TestClient) -> None:
    _register_user(client)
    login_response = client.post(
        "/auth/login",
        json={"username_or_email": "Valid_User", "password": "StrongPass1"},
    )

    assert login_response.status_code == 200

    response = client.get("/auth/me")
    assert response.status_code == 200
    assert response.json()["username"] == "Valid_User"
    assert response.json()["handle"] == "@valid_user"


def test_me_unauthorized(client: TestClient) -> None:
    response = client.get("/auth/me")

    assert response.status_code == 401


def test_logout_with_csrf(client: TestClient) -> None:
    _register_user(client)
    login_response = client.post(
        "/auth/login",
        json={"username_or_email": "Valid_User", "password": "StrongPass1"},
    )
    csrf_token = login_response.json()["csrf_token"]

    response = client.post("/auth/logout", headers={"X-CSRF-Token": csrf_token})

    assert response.status_code == 200
    assert response.json()["message"] == "Logged out successfully"


def test_logout_without_csrf(client: TestClient) -> None:
    _register_user(client)
    login_response = client.post(
        "/auth/login",
        json={"username_or_email": "Valid_User", "password": "StrongPass1"},
    )

    assert login_response.status_code == 200

    response = client.post("/auth/logout")

    assert response.status_code == 403
