def test_csrf_endpoint_returns_token_and_sets_cookie(client) -> None:
    response = client.get("/auth/csrf")

    assert response.status_code == 200
    assert response.json()["csrfToken"]
    assert "csrf_token=" in response.headers.get("set-cookie", "")
