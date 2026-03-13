from fastapi.testclient import TestClient

from app.schemas.transport import TransportType
from tests.helpers import auth_headers


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


def _create_post(client: TestClient, csrf: str, *, transport: str, trip_date: str) -> dict:
    response = client.post(
        "/posts",
        json={
            "title": "Flight to Paris",
            "content": "Testing post persistence",
            "city": "Paris",
            "transport": transport,
            "tripDate": trip_date,
        },
        headers={"X-CSRF-Token": csrf},
    )
    assert response.status_code == 201
    return response.json()


def test_create_post_persists_transport_and_trip_date(client: TestClient) -> None:
    csrf = _register_and_login(client)
    created_post = _create_post(
        client,
        csrf,
        transport=TransportType.PLANE.value,
        trip_date="1999-02-23",
    )

    assert created_post["transport"] == TransportType.PLANE.value
    assert created_post["tripDate"] == "1999-02-23"

    post_id = created_post["id"]
    get_response = client.get(f"/posts/{post_id}")
    assert get_response.status_code == 200
    assert get_response.json()["transport"] == TransportType.PLANE.value
    assert get_response.json()["tripDate"] == "1999-02-23"

    list_response = client.get("/posts", params={"page": 1, "limit": 10})
    assert list_response.status_code == 200
    assert list_response.json()["items"][0]["transport"] == TransportType.PLANE.value
    assert list_response.json()["items"][0]["tripDate"] == "1999-02-23"


def test_update_post_persists_transport_and_trip_date(client: TestClient) -> None:
    csrf = _register_and_login(client)
    created_post = _create_post(
        client,
        csrf,
        transport=TransportType.TRAIN.value,
        trip_date="2025-01-10",
    )

    response = client.patch(
        f"/posts/{created_post['id']}",
        json={
            "transport": TransportType.PLANE.value,
            "tripDate": "2026-05-14",
        },
        headers={"X-CSRF-Token": csrf},
    )

    assert response.status_code == 200
    updated_post = response.json()
    assert updated_post["transport"] == TransportType.PLANE.value
    assert updated_post["tripDate"] == "2026-05-14"


def test_create_comment_returns_comment_and_list_contains_it(client: TestClient) -> None:
    csrf = _register_and_login(client)
    created_post = _create_post(
        client,
        csrf,
        transport=TransportType.PLANE.value,
        trip_date="1999-02-23",
    )

    create_comment_response = client.post(
        f"/posts/{created_post['id']}/comments",
        json={"content": "Backend comment should be returned and listed."},
        headers={"X-CSRF-Token": csrf},
    )

    assert create_comment_response.status_code == 201
    created_comment = create_comment_response.json()
    assert created_comment["content"] == "Backend comment should be returned and listed."
    assert created_comment["owner"]["name"] == "Post_User"

    list_comments_response = client.get(
        f"/posts/{created_post['id']}/comments",
        params={"page": 1, "limit": 10},
    )
    assert list_comments_response.status_code == 200
    comments = list_comments_response.json()["items"]
    assert len(comments) == 1
    assert comments[0]["content"] == "Backend comment should be returned and listed."
    assert comments[0]["owner"]["name"] == "Post_User"


def test_post_reactions_comment_delete_and_post_delete_flow(client: TestClient) -> None:
    csrf = _register_and_login(client)
    created_post = _create_post(
        client,
        csrf,
        transport=TransportType.PLANE.value,
        trip_date="1999-02-23",
    )
    post_id = created_post["id"]

    like_response = client.post(f"/posts/{post_id}/like", headers=auth_headers(csrf))
    assert like_response.status_code == 200
    assert like_response.json()["liked"] is True
    assert like_response.json()["likes"] == 1

    save_response = client.post(f"/posts/{post_id}/save", headers=auth_headers(csrf))
    assert save_response.status_code == 200
    assert save_response.json()["saved"] is True
    assert save_response.json()["isSaved"] is True

    create_comment_response = client.post(
        f"/posts/{post_id}/comments",
        json={"content": "Comment to remove"},
        headers=auth_headers(csrf),
    )
    assert create_comment_response.status_code == 201
    comment_id = create_comment_response.json()["id"]

    delete_comment_response = client.delete(
        f"/posts/{post_id}/comments/{comment_id}",
        headers=auth_headers(csrf),
    )
    assert delete_comment_response.status_code == 200
    assert delete_comment_response.json()["message"] == "Comment deleted"

    comments_after_delete = client.get(
        f"/posts/{post_id}/comments",
        params={"page": 1, "limit": 10},
    )
    assert comments_after_delete.status_code == 200
    assert comments_after_delete.json()["items"] == []

    unlike_response = client.delete(f"/posts/{post_id}/like", headers=auth_headers(csrf))
    assert unlike_response.status_code == 200
    assert unlike_response.json()["liked"] is False
    assert unlike_response.json()["likes"] == 0

    unsave_response = client.delete(f"/posts/{post_id}/save", headers=auth_headers(csrf))
    assert unsave_response.status_code == 200
    assert unsave_response.json()["saved"] is False
    assert unsave_response.json()["isSaved"] is False

    delete_post_response = client.delete(f"/posts/{post_id}", headers=auth_headers(csrf))
    assert delete_post_response.status_code == 200
    assert delete_post_response.json()["message"] == "Post deleted"

    missing_post_response = client.get(f"/posts/{post_id}")
    assert missing_post_response.status_code == 404
