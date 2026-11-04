from datetime import datetime, timedelta, timezone
from math import ceil
from uuid import UUID, uuid4
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import func, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload, selectinload

from app.ai_circuit_breaker import provider_retry_after
from app.auth import get_current_user_id
from app.database import get_session
from app.identification_schemas import (
    IdentificationCandidateResponse,
    IdentificationJobCreateRequest,
    IdentificationJobResponse,
)
from app.models import IdentificationCandidate, IdentificationJob, MediaAsset, Species
from app.settings import EXTERNAL_AI_DISCLOSURE_VERSION, settings
from app.schemas import SpeciesResponse
from app.species import species_response

router = APIRouter(prefix="/v1/identification-jobs", tags=["identification"])
KOREA_TIMEZONE = ZoneInfo("Asia/Seoul")


def _job_response(job: IdentificationJob) -> IdentificationJobResponse:
    candidates = []
    for candidate in job.candidates:
        if candidate.species is None or not candidate.species.is_active:
            continue
        candidates.append(
            IdentificationCandidateResponse(
                rank=candidate.rank,
                confidence_band=candidate.confidence_band,
                species=SpeciesResponse.model_validate(species_response(candidate.species)),
            )
        )
    return IdentificationJobResponse(
        job_id=job.id,
        status=job.status,
        candidates=candidates,
        error_code=job.error_code,
    )


def _load_job(session: Session, job_id: UUID, user_id: UUID) -> IdentificationJob | None:
    return session.scalar(
        select(IdentificationJob)
        .options(
            selectinload(IdentificationJob.candidates)
            .joinedload(IdentificationCandidate.species)
            .joinedload(Species.artwork)
        )
        .where(IdentificationJob.id == job_id, IdentificationJob.user_id == user_id)
    )


@router.post("", response_model=IdentificationJobResponse, status_code=status.HTTP_202_ACCEPTED)
def create_identification_job(
    payload: IdentificationJobCreateRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key", max_length=128),
) -> IdentificationJobResponse:
    media_id = payload.media_id
    if idempotency_key is not None:
        idempotency_key = idempotency_key.strip() or None

    media = session.scalar(
        select(MediaAsset)
        .where(MediaAsset.id == media_id, MediaAsset.owner_user_id == user_id)
        .with_for_update()
    )
    if media is None or media.status in {"deleted", "rejected"}:
        raise HTTPException(status_code=404, detail={"code": "MEDIA_NOT_FOUND"})
    if media.status != "ready":
        raise HTTPException(status_code=409, detail={"code": "MEDIA_NOT_READY"})

    if idempotency_key:
        existing = session.scalar(
            select(IdentificationJob).where(
                IdentificationJob.user_id == user_id,
                IdentificationJob.idempotency_key == idempotency_key,
            )
        )
        if existing:
            if existing.media_asset_id != media_id:
                raise HTTPException(status_code=409, detail={"code": "IDEMPOTENCY_KEY_REUSED"})
            existing_id = existing.id
            session.rollback()
            existing_job = _load_job(session, existing_id, user_id)
            if existing_job is not None:
                return _job_response(existing_job)

    in_progress = session.scalar(
        select(IdentificationJob).where(
            IdentificationJob.user_id == user_id,
            IdentificationJob.media_asset_id == media_id,
            IdentificationJob.status.in_(["queued", "running"]),
        )
    )
    if in_progress:
        in_progress_id = in_progress.id
        session.rollback()
        existing_job = _load_job(session, in_progress_id, user_id)
        if existing_job is not None:
            return _job_response(existing_job)

    provider = settings.identification_provider.strip().lower()
    if provider != "mock":
        if (
            media.external_ai_consent_provider != provider
            or media.external_ai_consent_version != EXTERNAL_AI_DISCLOSURE_VERSION
        ):
            session.rollback()
            raise HTTPException(
                status_code=409,
                detail={"code": "EXTERNAL_AI_CONSENT_REQUIRED"},
            )
        circuit_retry_after = provider_retry_after(session, provider)
        if circuit_retry_after:
            session.rollback()
            raise HTTPException(
                status_code=503,
                detail={"code": "AI_PROVIDER_CIRCUIT_OPEN"},
                headers={"Retry-After": str(circuit_retry_after)},
            )
        # Serialize the per-user daily quota decision so simultaneous requests
        # cannot exceed the configured provider-cost limit.
        session.execute(
            text("SELECT pg_advisory_xact_lock(hashtextextended(:quota_key, 0))"),
            {"quota_key": f"ocean-diary:identification-daily:{user_id}"},
        )
        now_local = datetime.now(KOREA_TIMEZONE)
        day_start_local = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end_local = day_start_local + timedelta(days=1)
        daily_count = session.scalar(
            select(func.count(IdentificationJob.id)).where(
                IdentificationJob.user_id == user_id,
                IdentificationJob.created_at >= day_start_local.astimezone(timezone.utc),
                IdentificationJob.created_at < day_end_local.astimezone(timezone.utc),
            )
        ) or 0
        if daily_count >= settings.max_identification_jobs_per_user_per_day:
            retry_after = max(1, ceil((day_end_local - now_local).total_seconds()))
            session.rollback()
            raise HTTPException(
                status_code=429,
                detail={"code": "IDENTIFICATION_DAILY_LIMIT"},
                headers={"Retry-After": str(retry_after)},
            )

    job = IdentificationJob(
        id=uuid4(),
        user_id=user_id,
        media_asset_id=media.id,
        status="queued",
        provider="pending",
        idempotency_key=idempotency_key,
        created_at=datetime.now(timezone.utc),
    )
    session.add(job)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        if idempotency_key is None:
            raise
        previous = session.scalar(
            select(IdentificationJob).where(
                IdentificationJob.user_id == user_id,
                IdentificationJob.idempotency_key == idempotency_key,
            )
        )
        if previous is None:
            raise
        if previous.media_asset_id != media_id:
            raise HTTPException(
                status_code=409,
                detail={"code": "IDEMPOTENCY_KEY_REUSED"},
            ) from exc
        previous_id = previous.id
        session.rollback()
        existing_job = _load_job(session, previous_id, user_id)
        if existing_job is not None:
            return _job_response(existing_job)
        raise HTTPException(status_code=500, detail={"code": "JOB_CREATE_FAILED"}) from exc
    session.refresh(job)
    saved_job = _load_job(session, job.id, user_id)
    if saved_job is None:
        raise HTTPException(status_code=500, detail={"code": "JOB_CREATE_FAILED"})
    return _job_response(saved_job)


@router.get("/{job_id}", response_model=IdentificationJobResponse)
def get_identification_job(
    job_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> IdentificationJobResponse:
    job = _load_job(session, job_id, user_id)
    if job is None:
        raise HTTPException(status_code=404, detail={"code": "JOB_NOT_FOUND"})
    return _job_response(job)
