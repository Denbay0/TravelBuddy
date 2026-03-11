from fastapi.testclient import TestClient


def _register_and_login(client: TestClient) -> str:
    register_response = client.post(
        "/auth/register",
        json={
            "name": "Post_User",
            "email": "posts@example.com",
            "password": "StrongPass1",
            "confirmPassword": "StrongPass1",
        },
    )
    assert register_response.status_code == 201

    login_response = client.post(
        "/auth/login",
        json={"email": "posts@example.com", "password": "StrongPass1"},
    )
    assert login_response.status_code == 200
    return login_response.json()["csrfToken"]


def test_create_post_persists_transport_and_trip_date(client: TestClient) -> None:
    csrf = _register_and_login(client)

    create_response = client.post(
        "/posts",
        json={
            "title": "Flight to Paris",
            "content": "Testing post persistence",
            "city": "Paris",
            "transport": "РЎР°РјРѕР»С‘С‚",
            "tripDate": "1999-02-23",
        },
        headers={"X-CSRF-Token": csrf},
    )

    assert create_response.status_code == 201
    created_post = create_response.json()
    assert created_post["transport"] == "РЎР°РјРѕР»С‘С‚"
    assert created_post["tripDate"] == "1999-02-23"

    post_id = created_post["id"]
    get_response = client.get(f"/posts/{post_id}")
    assert get_response.status_code == 200
    assert get_response.json()["transport"] == "РЎР°РјРѕР»С‘С‚"
    assert get_response.json()["tripDate"] == "1999-02-23"
