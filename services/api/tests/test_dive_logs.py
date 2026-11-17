from app.seed_species import site_id_for

from .conftest import headers

BASE = {"dive_date": "2026-11-01", "region_label": "필리핀 · 세부 말라파스쿠아", "point_label": "가토 섬"}


def create(client, kind="scuba", key="k1", user="user-a", **extra):
    return client.post("/v1/dive-logs", json={"kind": kind, **BASE, **extra}, headers=headers(user, key))


def test_create_numbers_each_kind_separately(client):
    a = create(client, key="a").json()
    b = create(client, key="b").json()
    s = create(client, kind="snorkel", key="c").json()
    f = create(client, kind="free", key="d").json()
    assert [a["label"], b["label"], s["label"], f["label"]] == ["#1", "#2", "S1", "F1"]


def test_only_three_fields_are_required(client):
    r = client.post("/v1/dive-logs", json={"kind": "snorkel", **BASE}, headers=headers(key="x"))
    assert r.status_code == 201
    missing = client.post("/v1/dive-logs", json={"kind": "scuba", "dive_date": "2026-11-01", "region_label": "a"}, headers=headers(key="y"))
    assert missing.status_code == 422
    blank = client.post("/v1/dive-logs", json={"kind": "scuba", **BASE, "point_label": "   "}, headers=headers(key="z"))
    assert blank.status_code == 422


def test_gps_coordinates_are_rejected(client):
    r = create(client, key="gps", details={"maxDepth": "18", "spot": {"lat": 11.3, "lng": 124.1}})
    assert r.status_code == 422


def test_idempotent_retry_returns_same_log(client):
    first = create(client, key="same").json()
    again = create(client, key="same")
    assert again.status_code == 201 and again.json()["id"] == first["id"]
    conflict = client.post("/v1/dive-logs", json={"kind": "free", **BASE}, headers=headers(key="same"))
    assert conflict.status_code == 409


def test_diary_limit_and_sticker_layout(client):
    log = create(client, key="d").json()
    ok = client.patch(
        f"/v1/dive-logs/{log['id']}",
        json={"diary_text": "가" * 500, "sticker_layout": [{"id": "1", "type": "sticker", "kind": "cave", "x": 10, "y": 20, "scale": 1.2, "rot": -5}]},
        headers=headers(),
    )
    assert ok.status_code == 200
    assert ok.json()["sticker_layout"][0]["kind"] == "cave"
    too_long = client.patch(f"/v1/dive-logs/{log['id']}", json={"diary_text": "가" * 501}, headers=headers())
    assert too_long.status_code == 422
    cleared = client.patch(f"/v1/dive-logs/{log['id']}", json={"point_label": None}, headers=headers())
    assert cleared.status_code == 422


def test_other_users_cannot_read_or_edit(client):
    log = create(client, key="mine").json()
    assert client.get(f"/v1/dive-logs/{log['id']}", headers=headers("user-b")).status_code == 404
    assert client.patch(f"/v1/dive-logs/{log['id']}", json={"title": "x"}, headers=headers("user-b")).status_code == 404
    assert client.delete(f"/v1/dive-logs/{log['id']}", headers=headers("user-b")).status_code == 404
    assert client.get("/v1/dive-logs", headers=headers("user-b")).json()["items"] == []


def test_list_filters_counts_and_paginates(client):
    for i in range(5):
        create(client, key=f"p{i}", dive_date=f"2026-11-0{i + 1}")
    create(client, kind="snorkel", key="s")
    page1 = client.get("/v1/dive-logs?kind=scuba&limit=2", headers=headers()).json()
    assert page1["counts"] == {"scuba": 5, "free": 0, "snorkel": 1}
    assert [x["dive_date"] for x in page1["items"]] == ["2026-11-05", "2026-11-04"]
    page2 = client.get(f"/v1/dive-logs?kind=scuba&limit=2&cursor={page1['next_cursor']}", headers=headers()).json()
    assert [x["dive_date"] for x in page2["items"]] == ["2026-11-03", "2026-11-02"]


def test_site_stamp_and_places_and_summary(client):
    gato = str(site_id_for("23"))  # 가토 섬 동굴
    log = create(client, key="st", site_id=gato).json()
    assert log["site"]["name_ko"] == "가토 섬 동굴"
    create(client, key="st2", site_id=gato, dive_date="2026-10-01")
    stamps = client.get("/v1/site-stamps", headers=headers()).json()
    assert len(stamps) == 1 and stamps[0]["stamped_on"] == "2026-10-01"
    places = client.get("/v1/places", headers=headers()).json()
    assert places[0]["region_label"] == BASE["region_label"] and places[0]["log_count"] == 2
    summary = client.get("/v1/me/summary", headers=headers()).json()
    assert summary["log_counts"]["scuba"] == 2 and summary["stamp_count"] == 1
    assert summary["total_species"] == 181 and summary["total_sites"] == 40


def test_delete_hides_log(client):
    log = create(client, key="del").json()
    assert client.delete(f"/v1/dive-logs/{log['id']}", headers=headers()).status_code == 204
    assert client.get(f"/v1/dive-logs/{log['id']}", headers=headers()).status_code == 404


def test_species_catalog_exposes_v3_fields(client):
    r = client.get("/v1/species?query=환도상어", headers=headers()).json()
    item = r["items"][0]
    assert item["catalog_no"] == "007" and item["art_key"] == "thresher" and item["group_ko"] == "상어"


def test_dive_sites_are_public(client):
    r = client.get("/v1/dive-sites?category=난파선")
    assert r.status_code == 200 and len(r.json()) == 14
