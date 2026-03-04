from fastapi.testclient import TestClient


def create_user(client: TestClient, username: str, email: str, password: str = "StrongPass1"):
    response = client.post(
        "/auth/register",
        json={
            "username": username,
            "email": email,
            "password": password,
            "repeat_password": password,
        },
    )
    assert response.status_code == 201


def test_admin_login_requires_admin_flag(client: TestClient):
    create_user(client, "user1", "user1@example.com")

    response = client.post("/api/admin/auth/login", json={"login": "user1@example.com", "password": "StrongPass1"})
    assert response.status_code == 401


def test_admin_me_and_admin_routes_forbid_non_admin(client: TestClient):
    create_user(client, "user2", "user2@example.com")
    login = client.post("/auth/login", json={"username_or_email": "user2@example.com", "password": "StrongPass1"})
    assert login.status_code == 200

    me = client.get('/api/admin/auth/me')
    assert me.status_code == 403

    summary = client.get('/api/admin/dashboard/summary')
    assert summary.status_code == 403
