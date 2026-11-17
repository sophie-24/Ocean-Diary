from datetime import datetime, timedelta, timezone
from uuid import uuid4

from app.database import SessionLocal
from app.models import MediaAsset, Observation
from app.seed_species import species_id_for

from .conftest import USERS, headers


def _observe(user: str, species_no: str | None, days_ago: int, dive_log_id=None):
    now = datetime.now(timezone.utc)
    with SessionLocal.begin() as s:
        media = MediaAsset(
            owner_user_id=USERS[user],
            storage_key=f"test/{uuid4()}.jpg",
            mime_type="image/jpeg",
            byte_size=10,
            status="ready",
            expires_at=now + timedelta(days=1),
        )
        s.add(media)
        s.flush()
        s.add(
            Observation(
                user_id=USERS[user],
                species_id=species_id_for(species_no) if species_no else None,
                media_asset_id=media.id,
                identified_by="user_selected" if species_no else "unidentified",
                observed_at=now - timedelta(days=days_ago),
                region_label="말라파스쿠아",
                dive_log_id=dive_log_id,
                idempotency_key=f"test-{uuid4()}",
            )
        )


def test_observations_filter_by_species(client):
    log = client.post(
        "/v1/dive-logs",
        json={"kind": "scuba", "dive_date": "2026-11-01", "region_label": "말라파스쿠아", "point_label": "모나드 숄"},
        headers=headers(key="obs-log"),
    ).json()
    _observe("user-a", "007", 3, log["id"])
    _observe("user-a", "007", 1)
    _observe("user-a", "026", 2)
    _observe("user-b", "007", 1)

    thresher = str(species_id_for("007"))
    items = client.get(f"/v1/observations?species_id={thresher}", headers=headers()).json()["items"]
    assert len(items) == 2
    assert {i["species_id"] for i in items} == {thresher}
    assert sorted(i["dive_log_id"] is not None for i in items) == [False, True]

    everything = client.get("/v1/observations", headers=headers()).json()["items"]
    assert len(everything) == 3

    collection = client.get("/v1/collection", headers=headers()).json()["items"]
    counts = {c["species"]["catalog_no"]: c["discovery_count"] for c in collection}
    assert counts == {"007": 2, "026": 1}
