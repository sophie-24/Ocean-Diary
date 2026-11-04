"""v2 logbook API: dive logs (scuba / free / snorkel), picture diary, dive sites, stamps, places, summary."""

import base64
import binascii
import json
from collections import defaultdict
from datetime import date, datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response, status
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user_id
from app.database import get_session
from app.dive_log_schemas import (
    DiveLogCreateRequest,
    DiveLogListResponse,
    DiveLogPatchRequest,
    DiveLogResponse,
    DiveSiteResponse,
    LoggedSpecies,
    LogKind,
    PlaceResponse,
    SiteStampResponse,
    SummaryResponse,
)
from app.models import DiveLog, DiveSite, Observation, SiteStamp, Species

router = APIRouter(tags=["logbook"])

KINDS: tuple[LogKind, ...] = ("scuba", "free", "snorkel")
LABEL_PREFIX = {"scuba": "#", "free": "F", "snorkel": "S"}


def _label(kind: str, seq: int) -> str:
    return f"{LABEL_PREFIX[kind]}{seq}"


def _site_response(site: DiveSite) -> DiveSiteResponse:
    return DiveSiteResponse(
        id=site.id,
        catalog_no=site.catalog_no,
        category_ko=site.category_ko,
        name_ko=site.name_ko,
        name_en=site.name_en,
        country_ko=site.country_ko,
        region_ko=site.region_ko,
        note_ko=site.note_ko,
        depth_label=site.depth_label,
        level_label=site.level_label,
        art_key=site.art_key,
    )


def _species_by_log(session: Session, user_id: UUID, log_ids: list[UUID]) -> dict[UUID, list[LoggedSpecies]]:
    if not log_ids:
        return {}
    rows = session.execute(
        select(Observation.dive_log_id, Species)
        .join(Species, Species.id == Observation.species_id)
        .where(
            Observation.user_id == user_id,
            Observation.dive_log_id.in_(log_ids),
            Observation.deleted_at.is_(None),
        )
        .order_by(Observation.observed_at)
    ).all()
    result: dict[UUID, list[LoggedSpecies]] = defaultdict(list)
    seen: set[tuple[UUID, UUID]] = set()
    for log_id, species in rows:
        if (log_id, species.id) in seen:
            continue
        seen.add((log_id, species.id))
        result[log_id].append(
            LoggedSpecies(species_id=species.id, catalog_no=species.catalog_no, common_name_ko=species.common_name_ko, art_key=species.art_key)
        )
    return result


def _response(log: DiveLog, species: list[LoggedSpecies]) -> DiveLogResponse:
    return DiveLogResponse(
        id=log.id,
        kind=log.kind,  # type: ignore[arg-type]
        seq=log.seq,
        label=_label(log.kind, log.seq),
        dive_date=log.dive_date,
        region_label=log.region_label,
        point_label=log.point_label,
        title=log.title,
        details=log.details or {},
        diary_text=log.diary_text,
        sticker_layout=log.sticker_layout,
        is_draft=log.is_draft,
        site=_site_response(log.site) if log.site else None,
        species=species,
        created_at=log.created_at,
        updated_at=log.updated_at,
    )


def _get_owned_log(session: Session, user_id: UUID, log_id: UUID, for_update: bool = False) -> DiveLog:
    query = (
        select(DiveLog)
        .options(joinedload(DiveLog.site))
        .where(DiveLog.id == log_id, DiveLog.user_id == user_id, DiveLog.deleted_at.is_(None))
    )
    if for_update:
        query = query.with_for_update(of=DiveLog)
    log = session.scalar(query)
    if log is None:
        raise HTTPException(status_code=404, detail={"code": "DIVE_LOG_NOT_FOUND"})
    return log


def _require_site(session: Session, site_id: UUID | None) -> DiveSite | None:
    if site_id is None:
        return None
    site = session.get(DiveSite, site_id)
    if site is None or not site.is_active:
        raise HTTPException(status_code=404, detail={"code": "SITE_NOT_FOUND"})
    return site


def _stamp(session: Session, user_id: UUID, site: DiveSite | None, log: DiveLog) -> None:
    """Stamp the 명소 the first time a log names it. Later logs never move the first stamp."""
    if site is None:
        return
    existing = session.get(SiteStamp, {"user_id": user_id, "site_id": site.id})
    if existing is None:
        session.add(SiteStamp(user_id=user_id, site_id=site.id, dive_log_id=log.id, stamped_on=log.dive_date))
    elif log.dive_date < existing.stamped_on:
        existing.stamped_on = log.dive_date
        existing.dive_log_id = log.id


def _encode_cursor(d: date, created: datetime, log_id: UUID) -> str:
    raw = json.dumps([d.isoformat(), created.isoformat(), str(log_id)]).encode()
    return base64.urlsafe_b64encode(raw).decode().rstrip("=")


def _decode_cursor(cursor: str) -> tuple[date, datetime, UUID]:
    try:
        d, c, i = json.loads(base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4)))
        return date.fromisoformat(d), datetime.fromisoformat(c), UUID(i)
    except (ValueError, TypeError, binascii.Error) as exc:
        raise HTTPException(status_code=400, detail={"code": "INVALID_CURSOR"}) from exc


def _counts(session: Session, user_id: UUID) -> dict[str, int]:
    rows = session.execute(
        select(DiveLog.kind, func.count(DiveLog.id))
        .where(DiveLog.user_id == user_id, DiveLog.deleted_at.is_(None))
        .group_by(DiveLog.kind)
    ).all()
    counts = {k: 0 for k in KINDS}
    counts.update({kind: n for kind, n in rows})
    return counts


@router.post("/v1/dive-logs", response_model=DiveLogResponse, status_code=status.HTTP_201_CREATED)
def create_dive_log(
    payload: DiveLogCreateRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    idempotency_key: str = Header(..., alias="Idempotency-Key", min_length=1, max_length=128),
) -> DiveLogResponse:
    if not idempotency_key.strip():
        raise HTTPException(status_code=400, detail={"code": "INVALID_IDEMPOTENCY_KEY"})

    previous = session.scalar(
        select(DiveLog).options(joinedload(DiveLog.site)).where(DiveLog.user_id == user_id, DiveLog.idempotency_key == idempotency_key)
    )
    if previous is not None:
        if previous.kind != payload.kind or previous.dive_date != payload.dive_date or previous.point_label != payload.point_label:
            raise HTTPException(status_code=409, detail={"code": "IDEMPOTENCY_KEY_REUSED"})
        return _response(previous, _species_by_log(session, user_id, [previous.id]).get(previous.id, []))

    site = _require_site(session, payload.site_id)
    # Serialize numbering per user and kind so concurrent saves never reuse a dive number.
    session.execute(
        text("SELECT pg_advisory_xact_lock(hashtextextended(:k, 0))"),
        {"k": f"ocean-diary:dive-log-seq:{user_id}:{payload.kind}"},
    )
    next_seq = (
        session.scalar(select(func.max(DiveLog.seq)).where(DiveLog.user_id == user_id, DiveLog.kind == payload.kind)) or 0
    ) + 1
    now = datetime.now(timezone.utc)
    log = DiveLog(
        id=uuid4(),
        user_id=user_id,
        kind=payload.kind,
        seq=next_seq,
        dive_date=payload.dive_date,
        region_label=payload.region_label,
        point_label=payload.point_label,
        title=(payload.title or "").strip() or None,
        details=payload.details,
        is_draft=payload.is_draft,
        site_id=site.id if site else None,
        idempotency_key=idempotency_key,
        created_at=now,
        updated_at=now,
    )
    session.add(log)
    session.flush()
    _stamp(session, user_id, site, log)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(status_code=409, detail={"code": "DIVE_LOG_CONFLICT"}) from exc
    log = _get_owned_log(session, user_id, log.id)
    return _response(log, [])


@router.get("/v1/dive-logs", response_model=DiveLogListResponse)
def list_dive_logs(
    kind: LogKind | None = None,
    limit: int = Query(default=20, ge=1, le=50),
    cursor: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> DiveLogListResponse:
    query = (
        select(DiveLog)
        .options(joinedload(DiveLog.site))
        .where(DiveLog.user_id == user_id, DiveLog.deleted_at.is_(None))
        .order_by(DiveLog.dive_date.desc(), DiveLog.created_at.desc(), DiveLog.id.desc())
    )
    if kind:
        query = query.where(DiveLog.kind == kind)
    if cursor:
        d, c, i = _decode_cursor(cursor)
        query = query.where(
            (DiveLog.dive_date < d)
            | ((DiveLog.dive_date == d) & (DiveLog.created_at < c))
            | ((DiveLog.dive_date == d) & (DiveLog.created_at == c) & (DiveLog.id < i))
        )
    logs = list(session.scalars(query.limit(limit + 1)).unique())
    page, more = logs[:limit], len(logs) > limit
    species = _species_by_log(session, user_id, [log.id for log in page])
    return DiveLogListResponse(
        items=[_response(log, species.get(log.id, [])) for log in page],
        next_cursor=_encode_cursor(page[-1].dive_date, page[-1].created_at, page[-1].id) if more and page else None,
        counts=_counts(session, user_id),  # type: ignore[arg-type]
    )


@router.get("/v1/dive-logs/{log_id}", response_model=DiveLogResponse)
def get_dive_log(
    log_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> DiveLogResponse:
    log = _get_owned_log(session, user_id, log_id)
    return _response(log, _species_by_log(session, user_id, [log.id]).get(log.id, []))


@router.patch("/v1/dive-logs/{log_id}", response_model=DiveLogResponse)
def patch_dive_log(
    log_id: UUID,
    payload: DiveLogPatchRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> DiveLogResponse:
    log = _get_owned_log(session, user_id, log_id, for_update=True)
    fields = payload.model_fields_set
    for name in ("dive_date", "region_label", "point_label", "details", "diary_text", "is_draft"):
        if name in fields:
            setattr(log, name, getattr(payload, name))
    if "title" in fields:
        log.title = (payload.title or "").strip() or None
    if "sticker_layout" in fields:
        log.sticker_layout = [item.model_dump(exclude_none=True) for item in payload.sticker_layout] if payload.sticker_layout is not None else None
    if "site_id" in fields:
        site = _require_site(session, payload.site_id)
        log.site_id = site.id if site else None
        _stamp(session, user_id, site, log)
    log.updated_at = datetime.now(timezone.utc)
    session.commit()
    log = _get_owned_log(session, user_id, log_id)
    return _response(log, _species_by_log(session, user_id, [log.id]).get(log.id, []))


@router.delete("/v1/dive-logs/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dive_log(
    log_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> Response:
    log = _get_owned_log(session, user_id, log_id, for_update=True)
    log.deleted_at = datetime.now(timezone.utc)
    # Observations stay in the species book; they just lose the link to this log.
    session.execute(
        Observation.__table__.update()
        .where(Observation.dive_log_id == log.id, Observation.user_id == user_id)
        .values(dive_log_id=None)
    )
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/v1/dive-sites", response_model=list[DiveSiteResponse])
def list_dive_sites(
    category: str | None = Query(default=None, max_length=40),
    session: Session = Depends(get_session),
) -> list[DiveSiteResponse]:
    query = select(DiveSite).where(DiveSite.is_active.is_(True)).order_by(DiveSite.catalog_no)
    if category:
        query = query.where(DiveSite.category_ko == category)
    return [_site_response(s) for s in session.scalars(query)]


@router.get("/v1/site-stamps", response_model=list[SiteStampResponse])
def list_site_stamps(
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> list[SiteStampResponse]:
    rows = session.scalars(
        select(SiteStamp).options(joinedload(SiteStamp.site)).where(SiteStamp.user_id == user_id).order_by(SiteStamp.stamped_on)
    )
    return [SiteStampResponse(site=_site_response(r.site), stamped_on=r.stamped_on, dive_log_id=r.dive_log_id) for r in rows]


@router.get("/v1/places", response_model=list[PlaceResponse])
def list_places(
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> list[PlaceResponse]:
    """Regions the diver has logged, with the species met there (drives the map and place tanks)."""
    logs = list(
        session.scalars(
            select(DiveLog).where(DiveLog.user_id == user_id, DiveLog.deleted_at.is_(None)).order_by(DiveLog.dive_date)
        )
    )
    species = _species_by_log(session, user_id, [log.id for log in logs])
    stamps = {
        s.dive_log_id for s in session.scalars(select(SiteStamp).where(SiteStamp.user_id == user_id)) if s.dive_log_id
    }
    grouped: dict[str, list[DiveLog]] = defaultdict(list)
    for log in logs:
        grouped[log.region_label].append(log)
    places = []
    for region, items in grouped.items():
        seen: dict[UUID, LoggedSpecies] = {}
        for log in items:
            for sp in species.get(log.id, []):
                seen.setdefault(sp.species_id, sp)
        places.append(
            PlaceResponse(
                region_label=region,
                first_date=items[0].dive_date,
                last_date=items[-1].dive_date,
                log_count=len(items),
                point_labels=sorted({log.point_label for log in items}),
                species=list(seen.values()),
                stamp_count=sum(1 for log in items if log.id in stamps),
            )
        )
    places.sort(key=lambda p: p.last_date, reverse=True)
    return places


@router.get("/v1/me/summary", response_model=SummaryResponse)
def get_summary(
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> SummaryResponse:
    collected = session.scalar(
        select(func.count(func.distinct(Observation.species_id))).where(
            Observation.user_id == user_id, Observation.species_id.is_not(None), Observation.deleted_at.is_(None)
        )
    )
    encounters = session.scalar(
        select(func.count(Observation.id)).where(Observation.user_id == user_id, Observation.deleted_at.is_(None))
    )
    total_species = session.scalar(
        select(func.count(Species.id)).where(Species.is_active.is_(True), Species.catalog_no.is_not(None))
    )
    stamp_count = session.scalar(select(func.count()).select_from(SiteStamp).where(SiteStamp.user_id == user_id))
    total_sites = session.scalar(select(func.count(DiveSite.id)).where(DiveSite.is_active.is_(True)))
    regions = session.scalar(
        select(func.count(func.distinct(DiveLog.region_label))).where(DiveLog.user_id == user_id, DiveLog.deleted_at.is_(None))
    )
    return SummaryResponse(
        collected_species=collected or 0,
        total_species=total_species or 0,
        encounter_count=encounters or 0,
        log_counts=_counts(session, user_id),  # type: ignore[arg-type]
        stamp_count=stamp_count or 0,
        total_sites=total_sites or 0,
        visited_regions=regions or 0,
    )
