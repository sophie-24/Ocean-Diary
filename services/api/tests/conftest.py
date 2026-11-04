"""Integration tests against a real PostgreSQL (migrated to head and seeded).

Run:  DATABASE_URL=postgresql+psycopg://ocean:ocean@localhost:5432/ocean_diary python -m pytest
The tests create two throw-away users and delete their rows afterwards.
"""

import os
from uuid import UUID

import pytest

os.environ.setdefault("APP_ENV", "development")

from fastapi.testclient import TestClient  # noqa: E402
from fastapi import HTTPException  # noqa: E402
from sqlalchemy import delete  # noqa: E402

import app.auth as auth  # noqa: E402
import app.main as main  # noqa: E402
from app.database import SessionLocal  # noqa: E402
from app.models import ApiRateLimitEvent, DiveLog, Observation, SiteStamp  # noqa: E402

USERS = {
    "user-a": UUID("aaaaaaaa-0000-4000-8000-00000000000a"),
    "user-b": UUID("bbbbbbbb-0000-4000-8000-00000000000b"),
}


def _fake_resolve(credentials):
    if credentials is None or credentials.credentials not in USERS:
        raise HTTPException(status_code=401, detail={"code": "INVALID_TOKEN"})
    return USERS[credentials.credentials]


def _cleanup():
    with SessionLocal.begin() as s:
        for uid in USERS.values():
            s.execute(delete(Observation).where(Observation.user_id == uid))
            s.execute(delete(SiteStamp).where(SiteStamp.user_id == uid))
            s.execute(delete(DiveLog).where(DiveLog.user_id == uid))
        s.execute(delete(ApiRateLimitEvent))


@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setattr(auth, "_resolve_current_user_id", _fake_resolve)
    monkeypatch.setattr(main, "_resolve_current_user_id", _fake_resolve)
    _cleanup()
    with TestClient(main.app) as c:
        yield c
    _cleanup()


def headers(user: str = "user-a", key: str | None = None) -> dict[str, str]:
    h = {"Authorization": f"Bearer {user}"}
    if key:
        h["Idempotency-Key"] = key
    return h
