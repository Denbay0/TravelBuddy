from tests.helpers import create_post, create_route, register_and_login


def test_popular_users_returns_ranked_users(client) -> None:
    _, alice_csrf = register_and_login(
        client,
        name="AuroraAlice",
        email="alice-popular@example.com",
    )
    create_post(client, alice_csrf, title="Alice post one", city="Oslo")
    create_post(client, alice_csrf, title="Alice post two", city="Bergen")

    _, bob_csrf = register_and_login(
        client,
        name="AuroraBob",
        email="bob-popular@example.com",
    )
    create_post(client, bob_csrf, title="Bob post one", city="Tromso")

    response = client.get("/users/popular", params={"page": 1, "limit": 10})
    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["name"] == "AuroraAlice"
    assert items[0]["postsCount"] == 2
    assert items[1]["name"] == "AuroraBob"
    assert items[1]["postsCount"] == 1


def test_global_search_returns_routes_posts_and_users(client) -> None:
    _, csrf = register_and_login(
        client,
        name="AuroraSearch",
        email="aurora-search@example.com",
    )
    create_post(
        client,
        csrf,
        title="Aurora Post",
        content="Chasing aurora lights",
        city="Reykjavik",
    )
    create_route(
        client,
        csrf,
        title="Aurora Route",
        description="Best aurora route",
        origin_name="Reykjavik",
        destination_name="Akureyri",
    )

    response = client.get("/search", params={"q": "aurora", "limit": 10})
    assert response.status_code == 200
    body = response.json()
    assert body["query"] == "aurora"
    assert [item["title"] for item in body["posts"]] == ["Aurora Post"]
    assert [item["title"] for item in body["routes"]] == ["Aurora Route"]
    assert [item["name"] for item in body["users"]] == ["AuroraSearch"]


def test_reports_endpoints_return_example_and_pdf(client) -> None:
    example_response = client.get("/reports/example")
    assert example_response.status_code == 200
    assert example_response.json()["title"] == "TravelBuddy Demo Report"

    example_pdf_response = client.get("/reports/example/pdf")
    assert example_pdf_response.status_code == 200
    assert example_pdf_response.headers["content-type"] == "application/pdf"
    assert example_pdf_response.content.startswith(b"%PDF")

    _, csrf = register_and_login(
        client,
        name="ReportUser",
        email="report-user@example.com",
    )
    route = create_route(
        client,
        csrf,
        title="Report Route",
        origin_name="Rome",
        destination_name="Milan",
    )

    route_pdf_response = client.get(f"/reports/routes/{route['id']}/pdf")
    assert route_pdf_response.status_code == 200
    assert route_pdf_response.headers["content-type"] == "application/pdf"
    assert route_pdf_response.headers["content-disposition"] == f'attachment; filename="route-{route["id"]}-report.pdf"'
    assert route_pdf_response.content.startswith(b"%PDF")
