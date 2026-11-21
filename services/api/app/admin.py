"""Admin statistics endpoint — lightweight dashboard data for the app owner.

Auth: a static ADMIN_SECRET token passed as Bearer, separate from user auth.
"""

import hashlib
import hmac
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import distinct, func, select, text
from sqlalchemy.orm import Session

from app.database import get_session
from app.models import (
    ApiRateLimitEvent,
    DiveLog,
    DiveSite,
    IdentificationJob,
    MediaAsset,
    Observation,
    SiteStamp,
    Species,
)
from app.settings import settings

router = APIRouter(prefix="/v1/admin", tags=["admin"])
_admin_bearer = HTTPBearer(auto_error=False)


# Brute-force protection: after this many failed attempts from one address the admin API answers
# 429 for the rest of the window, even if the correct secret is then sent.
ADMIN_FAILURE_LIMIT = 5
ADMIN_FAILURE_WINDOW_SECONDS = 900


def _require_admin(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_admin_bearer),
    session: Session = Depends(get_session),
) -> None:
    secret = settings.admin_secret
    if not secret:
        raise HTTPException(status_code=503, detail={"code": "ADMIN_NOT_CONFIGURED"})

    client_host = request.client.host if request.client else "unknown"
    bucket_key = hashlib.sha256(f"admin-auth-failure:{client_host}".encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(seconds=ADMIN_FAILURE_WINDOW_SECONDS)
    failures, oldest = session.execute(
        select(func.count(ApiRateLimitEvent.id), func.min(ApiRateLimitEvent.occurred_at)).where(
            ApiRateLimitEvent.bucket_key == bucket_key,
            ApiRateLimitEvent.occurred_at > window_start,
        )
    ).one()
    if failures >= ADMIN_FAILURE_LIMIT and oldest is not None:
        retry_after = max(1, int((oldest + timedelta(seconds=ADMIN_FAILURE_WINDOW_SECONDS) - now).total_seconds()))
        raise HTTPException(
            status_code=429,
            detail={"code": "RATE_LIMITED"},
            headers={"Retry-After": str(retry_after)},
        )

    authorized = (
        credentials is not None
        and credentials.scheme.lower() == "bearer"
        # Constant-time comparison so response timing cannot reveal how much of a guess matched.
        and hmac.compare_digest(credentials.credentials.encode("utf-8"), secret.encode("utf-8"))
    )
    if not authorized:
        session.add(ApiRateLimitEvent(bucket_key=bucket_key, occurred_at=now))
        session.commit()
        raise HTTPException(status_code=401, detail={"code": "ADMIN_AUTH_REQUIRED"})


# ---------------------------------------------------------------------------
# GET /v1/admin/stats
# ---------------------------------------------------------------------------
@router.get("/stats", dependencies=[Depends(_require_admin)])
def admin_stats(session: Session = Depends(get_session)) -> dict:
    now = datetime.now(timezone.utc)
    today = now.date()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    # -- Users (from Supabase auth.users in the same Postgres cluster) --------
    try:
        total_users = session.execute(
            text("SELECT count(*) FROM auth.users")
        ).scalar() or 0
        users_today = session.execute(
            text("SELECT count(*) FROM auth.users WHERE created_at::date = :d"),
            {"d": today},
        ).scalar() or 0
        users_week = session.execute(
            text("SELECT count(*) FROM auth.users WHERE created_at >= :t"),
            {"t": week_ago},
        ).scalar() or 0
        users_month = session.execute(
            text("SELECT count(*) FROM auth.users WHERE created_at >= :t"),
            {"t": month_ago},
        ).scalar() or 0
    except Exception:
        # auth schema may not be accessible (e.g. local dev without Supabase)
        total_users = users_today = users_week = users_month = None

    # -- Observations ---------------------------------------------------------
    total_observations = session.execute(
        select(func.count(Observation.id)).where(Observation.deleted_at.is_(None))
    ).scalar() or 0
    observations_week = session.execute(
        select(func.count(Observation.id)).where(
            Observation.deleted_at.is_(None),
            Observation.created_at >= week_ago,
        )
    ).scalar() or 0
    unique_species_observed = session.execute(
        select(func.count(distinct(Observation.species_id))).where(
            Observation.deleted_at.is_(None),
            Observation.species_id.isnot(None),
        )
    ).scalar() or 0

    # -- Dive logs ------------------------------------------------------------
    total_dive_logs = session.execute(
        select(func.count(DiveLog.id)).where(DiveLog.deleted_at.is_(None))
    ).scalar() or 0
    dive_logs_week = session.execute(
        select(func.count(DiveLog.id)).where(
            DiveLog.deleted_at.is_(None),
            DiveLog.created_at >= week_ago,
        )
    ).scalar() or 0

    # -- Media assets ---------------------------------------------------------
    total_photos = session.execute(
        select(func.count(MediaAsset.id)).where(
            MediaAsset.status == "ready",
            MediaAsset.deleted_at.is_(None),
        )
    ).scalar() or 0

    # -- Identification jobs --------------------------------------------------
    total_id_jobs = session.execute(
        select(func.count(IdentificationJob.id))
    ).scalar() or 0
    succeeded_id_jobs = session.execute(
        select(func.count(IdentificationJob.id)).where(
            IdentificationJob.status == "succeeded"
        )
    ).scalar() or 0
    failed_id_jobs = session.execute(
        select(func.count(IdentificationJob.id)).where(
            IdentificationJob.status == "failed"
        )
    ).scalar() or 0

    # -- Top species ----------------------------------------------------------
    top_species_rows = session.execute(
        select(
            Species.common_name_ko,
            Species.scientific_name,
            func.count(Observation.id).label("cnt"),
        )
        .join(Species, Observation.species_id == Species.id)
        .where(Observation.deleted_at.is_(None), Observation.species_id.isnot(None))
        .group_by(Species.id, Species.common_name_ko, Species.scientific_name)
        .order_by(func.count(Observation.id).desc())
        .limit(10)
    ).all()

    # -- DAU (last 14 days) ---------------------------------------------------
    dau_rows = session.execute(
        text("""
            SELECT d::date AS day, count(DISTINCT user_id) AS dau
            FROM generate_series(
                (now() AT TIME ZONE 'UTC')::date - interval '13 days',
                (now() AT TIME ZONE 'UTC')::date,
                '1 day'
            ) AS d
            LEFT JOIN LATERAL (
                SELECT user_id, created_at FROM observations WHERE deleted_at IS NULL
                UNION ALL
                SELECT user_id, created_at FROM dive_logs WHERE deleted_at IS NULL
            ) AS activity ON activity.created_at::date = d::date
            GROUP BY d::date
            ORDER BY d::date
        """)
    ).all()

    # -- Active users (distinct users with any activity) ----------------------
    active_users_week = session.execute(
        text("""
            SELECT count(DISTINCT user_id) FROM (
                SELECT user_id FROM observations
                WHERE deleted_at IS NULL AND created_at >= :t
                UNION
                SELECT user_id FROM dive_logs
                WHERE deleted_at IS NULL AND created_at >= :t
            ) AS a
        """),
        {"t": week_ago},
    ).scalar() or 0

    # -- Dive sites visited ---------------------------------------------------
    total_site_stamps = session.execute(
        select(func.count(SiteStamp.site_id))
    ).scalar() or 0

    # -- Species catalog ------------------------------------------------------
    total_species = session.execute(
        select(func.count(Species.id)).where(Species.is_active.is_(True))
    ).scalar() or 0

    return {
        "generated_at": now.isoformat(),
        "users": {
            "total": total_users,
            "today": users_today,
            "last_7d": users_week,
            "last_30d": users_month,
        },
        "observations": {
            "total": total_observations,
            "last_7d": observations_week,
            "unique_species": unique_species_observed,
        },
        "dive_logs": {
            "total": total_dive_logs,
            "last_7d": dive_logs_week,
        },
        "photos": {
            "total": total_photos,
        },
        "identification": {
            "total": total_id_jobs,
            "succeeded": succeeded_id_jobs,
            "failed": failed_id_jobs,
            "success_rate": (
                round(succeeded_id_jobs / total_id_jobs * 100, 1)
                if total_id_jobs > 0
                else 0
            ),
        },
        "species_catalog": {
            "total_active": total_species,
        },
        "site_stamps": {
            "total": total_site_stamps,
        },
        "active_users": {
            "last_7d": active_users_week,
        },
        "top_species": [
            {
                "name_ko": row.common_name_ko,
                "scientific_name": row.scientific_name,
                "count": row.cnt,
            }
            for row in top_species_rows
        ],
        "dau_14d": [
            {"date": str(row.day), "dau": row.dau}
            for row in dau_rows
        ],
    }
