from tests.helpers import auth_headers, create_post, create_route, login_admin, register_and_login


def test_admin_auth_flow(client, monkeypatch) -> None:
    admin_body, csrf = login_admin(client, monkeypatch, login="chief", password="chief")

    assert admin_body["message"] == "Admin login successful"
    assert admin_body["user"]["isAdmin"] is True

    me_response = client.get("/api/admin/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["name"] == "chief"
    assert me_response.json()["isAdmin"] is True

    logout_response = client.post("/api/admin/auth/logout", headers=auth_headers(csrf))
    assert logout_response.status_code == 200
    assert logout_response.json()["message"] == "Admin logged out successfully"

    unauthorized_me = client.get("/api/admin/auth/me")
    assert unauthorized_me.status_code == 401


def test_admin_dashboard_and_management_endpoints(client, monkeypatch) -> None:
    user_one_body, user_one_csrf = register_and_login(
        client,
        name="AliceUser",
        email="alice@example.com",
    )
    post = create_post(client, user_one_csrf, title="Admin Visible Post", city="Rome")
    create_route(client, user_one_csrf, title="Admin Visible Route", destination_name="Florence")
    user_two_body, _ = register_and_login(
        client,
        name="BobUser",
        email="bob@example.com",
    )

    admin_body, admin_csrf = login_admin(client, monkeypatch, login="boss", password="boss")
    admin_id = admin_body["user"]["id"]

    summary_response = client.get("/api/admin/dashboard/summary")
    assert summary_response.status_code == 200
    assert summary_response.json() == {
        "totalUsers": 3,
        "totalPosts": 1,
        "totalRoutes": 1,
        "adminUsers": 1,
    }

    users_response = client.get("/api/admin/users", params={"search": "alice"})
    assert users_response.status_code == 200
    assert [item["name"] for item in users_response.json()["items"]] == ["AliceUser"]

    posts_response = client.get("/api/admin/posts", params={"search": "rome"})
    assert posts_response.status_code == 200
    assert posts_response.json()["items"][0]["title"] == "Admin Visible Post"
    assert posts_response.json()["items"][0]["authorName"] == "AliceUser"

    admins_response = client.get("/api/admin/admins")
    assert admins_response.status_code == 200
    assert [item["name"] for item in admins_response.json()["items"]] == ["boss"]

    create_admin_response = client.post(
        "/api/admin/admins",
        json={
            "name": "SecondAdmin",
            "email": "second-admin@example.com",
            "password": "StrongPass1",
        },
        headers=auth_headers(admin_csrf),
    )
    assert create_admin_response.status_code == 201
    second_admin_id = create_admin_response.json()["id"]

    delete_post_response = client.delete(
        f"/api/admin/posts/{post['id']}",
        headers=auth_headers(admin_csrf),
    )
    assert delete_post_response.status_code == 204

    delete_user_response = client.delete(
        f"/api/admin/users/{user_two_body['user']['id']}",
        headers=auth_headers(admin_csrf),
    )
    assert delete_user_response.status_code == 204

    delete_admin_response = client.delete(
        f"/api/admin/admins/{second_admin_id}",
        headers=auth_headers(admin_csrf),
    )
    assert delete_admin_response.status_code == 204

    keep_self_admin = client.delete(
        f"/api/admin/admins/{admin_id}",
        headers=auth_headers(admin_csrf),
    )
    assert keep_self_admin.status_code == 400
    assert keep_self_admin.json()["detail"] == "Cannot delete current admin"

    keep_self_user = client.delete(
        f"/api/admin/users/{admin_id}",
        headers=auth_headers(admin_csrf),
    )
    assert keep_self_user.status_code == 400
    assert keep_self_user.json()["detail"] == "Cannot delete current admin"
