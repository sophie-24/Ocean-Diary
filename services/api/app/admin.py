"""Admin statistics endpoint — lightweight dashboard data for the app owner.

Auth: a static ADMIN_SECRET token passed as Bearer, separate from user auth.
"""

import base64
import binascii
import hashlib
import hmac
import io
import logging
import re
from datetime import date, datetime, timedelta, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from PIL import Image, ImageOps, UnidentifiedImageError
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import distinct, func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

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
    SpeciesArtwork,
)
from app.settings import settings
from app.species import MEDIA_PUBLIC_BASE_URL
from app.storage import storage_client

logger = logging.getLogger(__name__)

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


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------
def _iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def _like_pattern(q: str | None) -> str | None:
    """User search text -> ILIKE pattern with '!' as the escape character."""
    q = (q or "").strip()
    if not q:
        return None
    escaped = q.replace("!", "!!").replace("%", "!%").replace("_", "!_")
    return f"%{escaped}%"


# ---------------------------------------------------------------------------
# GET /v1/admin/users — 가입자 목록 / 상세
# 개인정보 최소화: 이메일·가입 방식·로그인 시각·활동 개수만. 일기 본문·사진은 내보내지 않는다.
# ---------------------------------------------------------------------------
@router.get("/users", dependencies=[Depends(_require_admin)])
def admin_users(
    q: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=30, ge=1, le=100),
    offset: int = Query(default=0, ge=0, le=100_000),
    session: Session = Depends(get_session),
):
    pattern = _like_pattern(q)
    where = "(CAST(:p AS text) IS NULL OR u.email ILIKE CAST(:p AS text) ESCAPE '!')"
    total = session.execute(text(f"SELECT count(*) FROM auth.users u WHERE {where}"), {"p": pattern}).scalar_one()
    rows = session.execute(
        text(
            f"""
            SELECT u.id, u.email, u.created_at, u.last_sign_in_at,
                   u.raw_app_meta_data->>'provider' AS provider,
                   COALESCE(u.raw_user_meta_data->>'nickname',
                            u.raw_user_meta_data->>'full_name',
                            u.raw_user_meta_data->>'name') AS nickname,
                   (SELECT count(*) FROM dive_logs d WHERE d.user_id = u.id AND d.deleted_at IS NULL) AS dive_logs,
                   (SELECT count(*) FROM observations o WHERE o.user_id = u.id AND o.deleted_at IS NULL) AS observations,
                   (SELECT count(*) FROM identification_jobs j WHERE j.user_id = u.id) AS identifications
            FROM auth.users u
            WHERE {where}
            ORDER BY u.created_at DESC
            LIMIT :limit OFFSET :offset
            """
        ),
        {"p": pattern, "limit": limit, "offset": offset},
    ).all()
    return {
        "total": total,
        "items": [
            {
                "id": str(r.id),
                "email": r.email,
                "nickname": r.nickname,
                "provider": r.provider,
                "created_at": _iso(r.created_at),
                "last_sign_in_at": _iso(r.last_sign_in_at),
                "dive_logs": r.dive_logs,
                "observations": r.observations,
                "identifications": r.identifications,
            }
            for r in rows
        ],
    }


@router.get("/users/{user_id}", dependencies=[Depends(_require_admin)])
def admin_user_detail(user_id: UUID, session: Session = Depends(get_session)):
    u = session.execute(
        text(
            """
            SELECT u.id, u.email, u.created_at, u.last_sign_in_at,
                   u.raw_app_meta_data->>'provider' AS provider,
                   COALESCE(u.raw_user_meta_data->>'nickname',
                            u.raw_user_meta_data->>'full_name',
                            u.raw_user_meta_data->>'name') AS nickname
            FROM auth.users u WHERE u.id = :id
            """
        ),
        {"id": user_id},
    ).first()
    if u is None:
        raise HTTPException(status_code=404, detail={"code": "USER_NOT_FOUND"})

    logs = session.execute(
        select(DiveLog)
        .where(DiveLog.user_id == user_id, DiveLog.deleted_at.is_(None))
        .order_by(DiveLog.created_at.desc())
        .limit(15)
    ).scalars().all()
    obs = session.execute(
        select(Observation, Species.common_name_ko)
        .outerjoin(Species, Observation.species_id == Species.id)
        .where(Observation.user_id == user_id, Observation.deleted_at.is_(None))
        .order_by(Observation.created_at.desc())
        .limit(15)
    ).all()
    jobs = session.execute(
        select(IdentificationJob)
        .where(IdentificationJob.user_id == user_id)
        .order_by(IdentificationJob.created_at.desc())
        .limit(15)
    ).scalars().all()
    return {
        "id": str(u.id),
        "email": u.email,
        "nickname": u.nickname,
        "provider": u.provider,
        "created_at": _iso(u.created_at),
        "last_sign_in_at": _iso(u.last_sign_in_at),
        "dive_logs": [
            {
                "kind": d.kind,
                "seq": d.seq,
                "dive_date": str(d.dive_date),
                "region": d.region_label,
                "point": d.point_label,
                "is_draft": d.is_draft,
                "created_at": _iso(d.created_at),
            }
            for d in logs
        ],
        "observations": [
            {
                "species": name,
                "identified_by": o.identified_by,
                "observed_at": _iso(o.observed_at),
                "region": o.region_label,
                "created_at": _iso(o.created_at),
            }
            for o, name in obs
        ],
        "identifications": [
            {
                "id": str(j.id),
                "status": j.status,
                "provider": j.provider,
                "error_code": j.error_code,
                "created_at": _iso(j.created_at),
            }
            for j in jobs
        ],
    }


# ---------------------------------------------------------------------------
# GET /v1/admin/identifications — AI 식별 로그
# ---------------------------------------------------------------------------
@router.get("/identifications", dependencies=[Depends(_require_admin)])
def admin_identifications(
    status: str | None = Query(default=None, pattern=r"^[a-z_]{1,30}$"),
    limit: int = Query(default=30, ge=1, le=100),
    offset: int = Query(default=0, ge=0, le=100_000),
    session: Session = Depends(get_session),
):
    params = {"status": status, "limit": limit, "offset": offset}
    where = "(CAST(:status AS text) IS NULL OR j.status = CAST(:status AS text))"
    total = session.execute(
        text(f"SELECT count(*) FROM identification_jobs j WHERE {where}"), {"status": status}
    ).scalar_one()
    rows = session.execute(
        text(
            f"""
            SELECT j.id, j.user_id, u.email, j.status, j.provider, j.model_version, j.error_code,
                   j.created_at, j.started_at, j.completed_at,
                   c.score, c.confidence_band, c.label_raw, s.common_name_ko
            FROM identification_jobs j
            LEFT JOIN auth.users u ON u.id = j.user_id
            LEFT JOIN LATERAL (
                SELECT * FROM identification_candidates c WHERE c.job_id = j.id ORDER BY c.rank LIMIT 1
            ) c ON true
            LEFT JOIN species s ON s.id = c.species_id
            WHERE {where}
            ORDER BY j.created_at DESC
            LIMIT :limit OFFSET :offset
            """
        ),
        params,
    ).all()
    statuses = [
        r[0] for r in session.execute(text("SELECT DISTINCT status FROM identification_jobs ORDER BY 1")).all()
    ]
    return {
        "total": total,
        "statuses": statuses,
        "items": [
            {
                "id": str(r.id),
                "user_id": str(r.user_id),
                "email": r.email,
                "status": r.status,
                "provider": r.provider,
                "model_version": r.model_version,
                "error_code": r.error_code,
                "created_at": _iso(r.created_at),
                "duration_ms": (
                    int((r.completed_at - r.started_at).total_seconds() * 1000)
                    if r.completed_at and r.started_at
                    else None
                ),
                "top_species": r.common_name_ko or r.label_raw,
                "top_confidence": r.confidence_band,
                "top_score": r.score,
            }
            for r in rows
        ],
    }


# ---------------------------------------------------------------------------
# /v1/admin/species — 도감 종 추가 · 수정 · 삭제 (+ 이미지)
# ---------------------------------------------------------------------------
MAX_SPECIES_IMAGE_BYTES = 4 * 1024 * 1024
SPECIES_IMAGE_FORMATS = {"PNG", "JPEG", "WEBP"}


class SpeciesInput(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    common_name_ko: str = Field(min_length=1, max_length=100)
    scientific_name: str = Field(min_length=1, max_length=200)
    description_ko: str = Field(default="", max_length=4000)
    common_name_en: str | None = Field(default=None, max_length=120)
    group_ko: str | None = Field(default=None, max_length=40)
    subgroup_ko: str | None = Field(default=None, max_length=40)
    catalog_no: str | None = Field(default=None, pattern=r"^\d{3}$")
    is_active: bool = True
    # base64 로 인코딩한 PNG/JPEG/WEBP. 비우면 이미지는 그대로 둔다.
    image_base64: str | None = Field(default=None, max_length=6_000_000)
    remove_image: bool = False


def _artwork_url(key: str | None) -> str | None:
    if not key:
        return None
    if MEDIA_PUBLIC_BASE_URL:
        return f"{MEDIA_PUBLIC_BASE_URL}/{key.lstrip('/')}"
    try:  # 공개 URL 이 없으면 로컬 개발용으로 1시간짜리 서명 URL
        return storage_client(public=True).generate_presigned_url(
            "get_object", Params={"Bucket": settings.s3_bucket_name, "Key": key}, ExpiresIn=3600
        )
    except Exception:  # noqa: BLE001 - 이미지 미리보기 실패가 목록 전체를 막으면 안 됨
        logger.warning("could not presign species artwork", exc_info=True)
        return None


def _species_item(sp: Species, observation_count: int = 0) -> dict:
    art = sp.artwork
    return {
        "id": str(sp.id),
        "slug": sp.slug,
        "catalog_no": sp.catalog_no,
        "common_name_ko": sp.common_name_ko,
        "common_name_en": sp.common_name_en,
        "scientific_name": sp.scientific_name,
        "group_ko": sp.group_ko,
        "subgroup_ko": sp.subgroup_ko,
        "description_ko": sp.description_ko,
        "is_active": sp.is_active,
        "art_key": sp.art_key,
        "image_url": _artwork_url(art.thumbnail_key or art.asset_key) if art else None,
        "observation_count": observation_count,
    }


def _process_species_image(b64: str) -> tuple[bytes, bytes]:
    """Validate + re-encode an uploaded image. Returns (main_png, thumbnail_png)."""
    bad = HTTPException(status_code=400, detail={"code": "INVALID_IMAGE"})
    try:
        raw = base64.b64decode(b64, validate=True)
    except (binascii.Error, ValueError):
        raise bad from None
    if not raw or len(raw) > MAX_SPECIES_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail={"code": "IMAGE_TOO_LARGE"})
    Image.MAX_IMAGE_PIXELS = 40_000_000
    try:
        with Image.open(io.BytesIO(raw)) as image:
            if image.format not in SPECIES_IMAGE_FORMATS:
                raise bad
            image = ImageOps.exif_transpose(image).convert("RGBA")
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise bad from None
    outputs = []
    for edge in (1024, 320):
        copy = image.copy()
        copy.thumbnail((edge, edge), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        copy.save(buf, format="PNG", optimize=True)
        outputs.append(buf.getvalue())
    return outputs[0], outputs[1]


def _put_species_image(species_id: UUID, b64: str) -> tuple[str, str]:
    main, thumb = _process_species_image(b64)
    token = uuid4().hex[:10]
    base = f"species-art/{species_id}/{token}"
    keys = (f"{base}.png", f"{base}-thumb.png")
    client = storage_client()
    try:
        for key, body in zip(keys, (main, thumb)):
            client.put_object(Bucket=settings.s3_bucket_name, Key=key, Body=body, ContentType="image/png")
    except Exception:  # noqa: BLE001
        logger.exception("species image upload failed")
        raise HTTPException(status_code=502, detail={"code": "STORAGE_ERROR"}) from None
    return keys


def _delete_objects(keys: list[str | None]) -> None:
    client = storage_client()
    for key in keys:
        if not key:
            continue
        try:
            client.delete_object(Bucket=settings.s3_bucket_name, Key=key)
        except Exception:  # noqa: BLE001 - 고아 파일이 남아도 요청은 성공시킨다
            logger.warning("could not delete storage object %s", key, exc_info=True)


def _slug_for(session: Session, scientific_name: str) -> str:
    base = re.sub(r"[^a-z0-9]+", "-", scientific_name.lower()).strip("-")[:80] or "species"
    slug, n = base, 2
    while session.execute(select(Species.id).where(Species.slug == slug)).first():
        slug = f"{base}-{n}"
        n += 1
    return slug


def _apply_image(session: Session, sp: Species, payload: SpeciesInput) -> list[str | None]:
    """Create/replace/remove the artwork row. Returns old storage keys to delete after commit."""
    old: list[str | None] = []
    if payload.image_base64:
        asset_key, thumb_key = _put_species_image(sp.id, payload.image_base64)
        if sp.artwork:
            old = [sp.artwork.asset_key, sp.artwork.thumbnail_key]
            sp.artwork.asset_key, sp.artwork.thumbnail_key = asset_key, thumb_key
            sp.artwork.license_source = "admin-upload"
        else:
            sp.artwork = SpeciesArtwork(
                asset_key=asset_key,
                thumbnail_key=thumb_key,
                style_name="storybook",
                license_source="admin-upload",
            )
    elif payload.remove_image and sp.artwork:
        old = [sp.artwork.asset_key, sp.artwork.thumbnail_key]
        session.delete(sp.artwork)
        sp.artwork = None
    return old


def _get_species_or_404(session: Session, species_id: UUID) -> Species:
    sp = session.execute(
        select(Species).options(joinedload(Species.artwork)).where(Species.id == species_id)
    ).scalar_one_or_none()
    if sp is None:
        raise HTTPException(status_code=404, detail={"code": "SPECIES_NOT_FOUND"})
    return sp


@router.get("/species", dependencies=[Depends(_require_admin)])
def admin_species_list(
    q: str | None = Query(default=None, max_length=100),
    group: str | None = Query(default=None, max_length=40),
    include_inactive: bool = True,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0, le=100_000),
    session: Session = Depends(get_session),
):
    stmt = select(Species)
    pattern = _like_pattern(q)
    if pattern:
        stmt = stmt.where(
            Species.common_name_ko.ilike(pattern, escape="!")
            | Species.scientific_name.ilike(pattern, escape="!")
            | Species.common_name_en.ilike(pattern, escape="!")
        )
    if group:
        stmt = stmt.where(Species.group_ko == group)
    if not include_inactive:
        stmt = stmt.where(Species.is_active.is_(True))
    total = session.execute(select(func.count()).select_from(stmt.subquery())).scalar_one()
    species = session.execute(
        stmt.options(joinedload(Species.artwork))
        .order_by(Species.catalog_no.asc().nulls_last(), Species.common_name_ko.asc())
        .limit(limit)
        .offset(offset)
    ).scalars().all()
    counts = dict(
        session.execute(
            select(Observation.species_id, func.count(Observation.id))
            .where(Observation.species_id.in_([s.id for s in species]), Observation.deleted_at.is_(None))
            .group_by(Observation.species_id)
        ).all()
    ) if species else {}
    groups = [r[0] for r in session.execute(
        select(Species.group_ko).where(Species.group_ko.isnot(None)).distinct().order_by(Species.group_ko)
    ).all()]
    return {
        "total": total,
        "groups": groups,
        "items": [_species_item(s, counts.get(s.id, 0)) for s in species],
    }


@router.get("/species/{species_id}", dependencies=[Depends(_require_admin)])
def admin_species_get(species_id: UUID, session: Session = Depends(get_session)):
    sp = _get_species_or_404(session, species_id)
    count = session.execute(
        select(func.count(Observation.id)).where(Observation.species_id == sp.id, Observation.deleted_at.is_(None))
    ).scalar_one()
    return _species_item(sp, count)


@router.post("/species", status_code=201, dependencies=[Depends(_require_admin)])
def admin_species_create(payload: SpeciesInput, session: Session = Depends(get_session)):
    sp = Species(
        id=uuid4(),
        slug=_slug_for(session, payload.scientific_name),
        common_name_ko=payload.common_name_ko,
        scientific_name=payload.scientific_name,
        description_ko=payload.description_ko,
        common_name_en=payload.common_name_en,
        group_ko=payload.group_ko,
        subgroup_ko=payload.subgroup_ko,
        catalog_no=payload.catalog_no,
        is_active=payload.is_active,
    )
    session.add(sp)
    try:
        session.flush()
        _apply_image(session, sp, payload)
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409, detail={"code": "SPECIES_CONFLICT"}) from None
    session.refresh(sp)
    return _species_item(sp)


@router.put("/species/{species_id}", dependencies=[Depends(_require_admin)])
def admin_species_update(species_id: UUID, payload: SpeciesInput, session: Session = Depends(get_session)):
    sp = _get_species_or_404(session, species_id)
    sp.common_name_ko = payload.common_name_ko
    sp.scientific_name = payload.scientific_name
    sp.description_ko = payload.description_ko
    sp.common_name_en = payload.common_name_en
    sp.group_ko = payload.group_ko
    sp.subgroup_ko = payload.subgroup_ko
    sp.catalog_no = payload.catalog_no
    sp.is_active = payload.is_active
    try:
        old_keys = _apply_image(session, sp, payload)
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=409, detail={"code": "SPECIES_CONFLICT"}) from None
    _delete_objects(old_keys)
    session.refresh(sp)
    return _species_item(sp)


@router.delete("/species/{species_id}", dependencies=[Depends(_require_admin)])
def admin_species_delete(species_id: UUID, session: Session = Depends(get_session)):
    """기록(observations)이 참조 중이면 삭제 대신 비활성화(앱 도감에서 숨김). 아니면 완전 삭제."""
    sp = _get_species_or_404(session, species_id)
    refs = session.execute(
        select(func.count(Observation.id)).where(Observation.species_id == sp.id)
    ).scalar_one()
    if refs:
        sp.is_active = False
        session.commit()
        return {"result": "deactivated", "observation_count": refs}
    old_keys = [sp.artwork.asset_key, sp.artwork.thumbnail_key] if sp.artwork else []
    session.delete(sp)
    session.commit()
    _delete_objects(old_keys)
    return {"result": "deleted", "observation_count": 0}


# ---------------------------------------------------------------------------
# /v1/admin/signups — 사전등록 이메일 목록 (Supabase pre_launch_signups)
# ---------------------------------------------------------------------------

_SIGNUPS_TABLE_ENSURED = False

_SIGNUPS_DDL = """
CREATE TABLE IF NOT EXISTS pre_launch_signups (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email        text NOT NULL,
  source       text NOT NULL DEFAULT 'mola.app',
  signed_up_at timestamptz NOT NULL DEFAULT now(),
  notified_at  timestamptz,
  CONSTRAINT email_unique UNIQUE (email)
);
CREATE INDEX IF NOT EXISTS idx_signups_not_notified
  ON pre_launch_signups (signed_up_at)
  WHERE notified_at IS NULL;
ALTER TABLE pre_launch_signups ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pre_launch_signups' AND policyname = 'service_role_all'
  ) THEN
    CREATE POLICY "service_role_all" ON pre_launch_signups
      FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;
END $$;
"""


def _ensure_signups_table(session: Session) -> None:
    global _SIGNUPS_TABLE_ENSURED
    if _SIGNUPS_TABLE_ENSURED:
        return
    try:
        session.execute(text(_SIGNUPS_DDL))
        session.commit()
        _SIGNUPS_TABLE_ENSURED = True
        logger.info("pre_launch_signups table ensured")
    except Exception:
        session.rollback()
        logger.warning("could not ensure pre_launch_signups table", exc_info=True)
        raise HTTPException(status_code=500, detail={"code": "TABLE_INIT_FAILED"})


@router.get("/signups", dependencies=[Depends(_require_admin)])
def admin_signups(
    q: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0, le=100_000),
    session: Session = Depends(get_session),
):
    _ensure_signups_table(session)

    pattern = _like_pattern(q)
    where = "(CAST(:p AS text) IS NULL OR s.email ILIKE CAST(:p AS text) ESCAPE '!')"

    total = session.execute(
        text(f"SELECT count(*) FROM pre_launch_signups s WHERE {where}"),
        {"p": pattern},
    ).scalar_one()

    rows = session.execute(
        text(
            f"""
            SELECT s.id, s.email, s.source, s.signed_up_at, s.notified_at
            FROM pre_launch_signups s
            WHERE {where}
            ORDER BY s.signed_up_at DESC
            LIMIT :limit OFFSET :offset
            """
        ),
        {"p": pattern, "limit": limit, "offset": offset},
    ).all()

    not_notified = session.execute(
        text("SELECT count(*) FROM pre_launch_signups WHERE notified_at IS NULL")
    ).scalar_one()

    return {
        "total": total,
        "not_notified": not_notified,
        "items": [
            {
                "id": str(r.id),
                "email": r.email,
                "source": r.source,
                "signed_up_at": _iso(r.signed_up_at),
                "notified_at": _iso(r.notified_at),
            }
            for r in rows
        ],
    }


@router.get("/signups/export", dependencies=[Depends(_require_admin)])
def admin_signups_export(
    session: Session = Depends(get_session),
):
    """미발송 이메일 목록을 CSV 형식으로 내보내기."""
    _ensure_signups_table(session)

    from fastapi.responses import Response as RawResponse

    rows = session.execute(
        text(
            """
            SELECT email, source, signed_up_at
            FROM pre_launch_signups
            WHERE notified_at IS NULL
            ORDER BY signed_up_at ASC
            """
        )
    ).all()

    lines = ["email,source,signed_up_at"]
    for r in rows:
        lines.append(f"{r.email},{r.source},{r.signed_up_at.isoformat() if r.signed_up_at else ''}")

    return RawResponse(
        content="\n".join(lines),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=mola_signups.csv"},
    )
