def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_generate_default(client):
    res = client.post("/api/generate", json={})
    assert res.status_code == 200
    body = res.json()
    assert len(body["password"]) == 16
    assert body["strength"]["label"] in {"Strong", "Very Strong"}
    assert body["saved_id"] is not None


def test_generate_custom(client):
    res = client.post("/api/generate", json={
        "length": 24,
        "use_lowercase": True,
        "use_uppercase": False,
        "use_digits": True,
        "use_symbols": False,
        "save": False,
    })
    assert res.status_code == 200
    body = res.json()
    assert len(body["password"]) == 24
    assert all(c.islower() or c.isdigit() for c in body["password"])
    assert body["saved_id"] is None


def test_generate_validation_error(client):
    res = client.post("/api/generate", json={"length": 4})
    assert res.status_code == 422  # pydantic validation


def test_generate_at_least_one_class(client):
    res = client.post("/api/generate", json={
        "length": 12,
        "use_lowercase": False,
        "use_uppercase": False,
        "use_digits": False,
        "use_symbols": False,
    })
    assert res.status_code == 400


def test_check_password(client):
    res = client.post("/api/check", json={"password": "M7K5r;JM!q3X8aB#"})
    assert res.status_code == 200
    body = res.json()
    assert body["label"] == "Very Strong"
    assert body["entropy_bits"] > 0


def test_history_lifecycle(client):
    for _ in range(3):
        client.post("/api/generate", json={"length": 16, "save": True})
    res = client.get("/api/history")
    body = res.json()
    assert body["total"] == 3
    assert len(body["items"]) == 3

    item_id = body["items"][0]["id"]
    delete = client.delete(f"/api/history/{item_id}")
    assert delete.status_code == 200

    res = client.get("/api/history")
    assert res.json()["total"] == 2

    clear = client.delete("/api/history")
    assert clear.status_code == 200
    res = client.get("/api/history")
    assert res.json()["total"] == 0


def test_pages_render(client):
    for path in ("/", "/history"):
        r = client.get(path)
        assert r.status_code == 200
        assert "PassGen" in r.text
