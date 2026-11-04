import base64
import binascii
import json
from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response, status
from sqlalchemy import func, select, tuple_, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.auth import get_current_user_id
from app.database import get_session
from app.models import (
    IdentificationCandidate,
    IdentificationJob,
    MediaAsset,
    Observation,
    Species,
)
from app.observation_schemas import (
    CollectionResponse,
    CollectionSpeciesResponse,
    ObservationCreateRequest,
    ObservationCreateResponse,
    ObservationListResponse,
    ObservationPatchRequest,
    ObservationResponse,
)
from app.schemas import SpeciesResponse
from app.species import species_response
from app.settings import settings
from app.storage import storage_client

router = APIRouter(tags=["observations"])


def _encode_cursor(observed_at: datetime, observation_id: UUID) -> str:
    payload = json.dumps([observed_at.isoformat(), str(observation_id)]).encode("utf-8")
    return base64.urlsafe_b64encode(payload).decode("ascii").rstrip("=")


def _decode_cursor(cursor: str) -> tuple[datetime, UUID]:
    try:
        decoded = base64.urlsafe_b64decode(cursor + "=" * (-len(cursor) % 4))
        timestamp, observation_id = json.loads(decoded)
        observed_at = datetime.fromisoformat(timestamp)
        if observed_at.tzinfo is None:
            observed_at = observed_at.replace(tzinfo=timezone.utc)
        return observed_at, UUID(observation_id)
    except (ValueError, TypeError, KeyError, binascii.Error) as exc:
        raise HTTPException(status_code=400, detail={"code": "INVALID_CURSOR"}) from exc


def _photo_url(media: MediaAsset) -> str:
    return storage_client(public=True).generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.s3_bucket_name, "Key": media.storage_key},
        ExpiresIn=600,
    )


def _observation_response(observation: Observation) -> ObservationResponse:
    species = observation.species
    return ObservationResponse(
        id=observation.id,
        species_id=observation.species_id,
        media_id=observation.media_asset_id,
        identification_job_id=observation.identification_job_id,
        identified_by=observation.identified_by,
        observed_at=observation.observed_at,
        region_label=observation.region_label,
        created_at=observation.created_at,
        photo_url=_photo_url(observation.media_asset),
        species=(
            SpeciesResponse.model_validate(species_response(species))
            if species is not None and species.is_active
            else None
        ),
    )


def _load_observation(
    session: Session, observation_id: UUID, user_id: UUID
) -> Observation | None:
    return session.scalar(
        select(Observation)
        .options(
            joinedload(Observation.media_asset),
            joinedload(Observation.species).joinedload(Species.artwork),
        )
        .where(
            Observation.id == observation_id,
            Observation.user_id == user_id,
            Observation.deleted_at.is_(None),
        )
    )


def _validate_idempotency_replay(
    previous: Observation,
    payload: ObservationCreateRequest,
    normalized_region: str | None,
) -> None:
    if (
        previous.media_asset_id != payload.media_id
        or previous.species_id != payload.species_id
        or previous.identified_by != payload.identified_by
        or previous.identification_job_id != payload.identification_job_id
        or previous.region_label != normalized_region
        or previous.observed_at != payload.observed_at
        or previous.deleted_at is not None
    ):
        raise HTTPException(status_code=409, detail={"code": "IDEMPOTENCY_KEY_REUSED"})


def _create_response_for_observation(
    session: Session,
    observation_id: UUID,
    user_id: UUID,
    species_id: UUID | None,
) -> ObservationCreateResponse:
    saved = _load_observation(session, observation_id, user_id)
    if saved is None:
        raise HTTPException(status_code=404, detail={"code": "OBSERVATION_NOT_FOUND"})
    discovery_count = (
        session.scalar(
            select(func.count(Observation.id)).where(
                Observation.user_id == user_id,
                Observation.species_id == species_id,
                Observation.deleted_at.is_(None),
            )
        )
        if species_id is not None
        else None
    )
    return ObservationCreateResponse(
        observation=_observation_response(saved),
        species_summary=(
            {
                "discovery_count": discovery_count or 0,
                "is_new_species_for_user": discovery_count == 1,
            }
            if species_id is not None
            else None
        ),
    )


def _validate_job(
    session: Session,
    job_id: UUID | None,
    media_id: UUID,
    user_id: UUID,
    species_id: UUID | None,
    identified_by: str,
) -> IdentificationJob | None:
    if job_id is None:
        return None
    job = session.scalar(
        select(IdentificationJob).where(
            IdentificationJob.id == job_id,
            IdentificationJob.user_id == user_id,
            IdentificationJob.media_asset_id == media_id,
        )
    )
    if job is None:
        raise HTTPException(status_code=404, detail={"code": "JOB_NOT_FOUND"})
    if identified_by == "ai_confirmed":
        if job.status != "succeeded" or species_id is None:
            raise HTTPException(status_code=409, detail={"code": "AI_CANDIDATE_NOT_CONFIRMED"})
        candidate = session.scalar(
            select(IdentificationCandidate.id).where(
                IdentificationCandidate.job_id == job.id,
                IdentificationCandidate.species_id == species_id,
            )
        )
        if candidate is None:
            raise HTTPException(status_code=422, detail={"code": "SPECIES_NOT_IN_CANDIDATES"})
    return job


@router.post(
    "/v1/observations",
    response_model=ObservationCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_observation(
    payload: ObservationCreateRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    idempotency_key: str = Header(
        ..., alias="Idempotency-Key", min_length=1, max_length=128
    ),
) -> ObservationCreateResponse:
    media = session.scalar(
        select(MediaAsset)
        .where(MediaAsset.id == payload.media_id, MediaAsset.owner_user_id == user_id)
        .with_for_update()
    )
    if media is None or media.status in {"deleted", "rejected"}:
        raise HTTPException(status_code=404, detail={"code": "MEDIA_NOT_FOUND"})
    if media.status != "ready":
        raise HTTPException(status_code=409, detail={"code": "MEDIA_NOT_READY"})

    normalized_region = (payload.region_label.strip() or None) if payload.region_label else None

    previous = session.scalar(
        select(Observation).where(
            Observation.user_id == user_id,
            Observation.idempotency_key == idempotency_key,
        )
    )
    if previous:
        _validate_idempotency_replay(previous, payload, normalized_region)
        previous_id = previous.id
        session.rollback()
        return _create_response_for_observation(
            session, previous_id, user_id, payload.species_id
        )

    species = None
    if payload.species_id is not None:
        species = session.scalar(
            select(Species)
            .options(joinedload(Species.artwork))
            .where(Species.id == payload.species_id, Species.is_active.is_(True))
        )
        if species is None:
            raise HTTPException(status_code=404, detail={"code": "SPECIES_NOT_FOUND"})

    _validate_job(
        session,
        payload.identification_job_id,
        payload.media_id,
        user_id,
        payload.species_id,
        payload.identified_by,
    )

    observation = Observation(
        id=uuid4(),
        user_id=user_id,
        species_id=payload.species_id,
        media_asset_id=payload.media_id,
        identification_job_id=payload.identification_job_id,
        identified_by=payload.identified_by,
        region_label=normalized_region,
        observed_at=payload.observed_at,
        idempotency_key=idempotency_key,
        created_at=datetime.now(timezone.utc),
    )
    session.add(observation)
    try:
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        previous = session.scalar(
            select(Observation).where(
                Observation.user_id == user_id,
                Observation.idempotency_key == idempotency_key,
            )
        )
        if previous is None:
            raise
        try:
            _validate_idempotency_replay(previous, payload, normalized_region)
        except HTTPException as conflict:
            raise conflict from exc
        previous_id = previous.id
        session.rollback()
        return _create_response_for_observation(
            session, previous_id, user_id, payload.species_id
        )
    return _create_response_for_observation(session, observation.id, user_id, payload.species_id)


@router.get("/v1/observations", response_model=ObservationListResponse)
def list_observations(
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    limit: int = Query(default=20, ge=1, le=50),
    cursor: str | None = None,
    unidentified_only: bool = Query(default=False),
) -> ObservationListResponse:
    statement = (
        select(Observation)
        .options(
            joinedload(Observation.media_asset),
            joinedload(Observation.species).joinedload(Species.artwork),
        )
        .where(Observation.user_id == user_id, Observation.deleted_at.is_(None))
    )
    if unidentified_only:
        statement = statement.where(Observation.species_id.is_(None))
    if cursor:
        last_seen_at, last_id = _decode_cursor(cursor)
        statement = statement.where(tuple_(Observation.observed_at, Observation.id) < (last_seen_at, last_id))
    rows = list(session.scalars(statement.order_by(Observation.observed_at.desc(), Observation.id.desc()).limit(limit + 1)))
    has_more = len(rows) > limit
    rows = rows[:limit]
    next_cursor = _encode_cursor(rows[-1].observed_at, rows[-1].id) if has_more and rows else None
    return ObservationListResponse(
        items=[_observation_response(row) for row in rows],
        next_cursor=next_cursor,
    )


@router.get("/v1/observations/{observation_id}", response_model=ObservationResponse)
def get_observation(
    observation_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> ObservationResponse:
    observation = _load_observation(session, observation_id, user_id)
    if observation is None:
        raise HTTPException(status_code=404, detail={"code": "OBSERVATION_NOT_FOUND"})
    return _observation_response(observation)


@router.patch("/v1/observations/{observation_id}", response_model=ObservationResponse)
def update_observation(
    observation_id: UUID,
    payload: ObservationPatchRequest,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> ObservationResponse:
    observation = session.scalar(
        select(Observation)
        .where(
            Observation.id == observation_id,
            Observation.user_id == user_id,
            Observation.deleted_at.is_(None),
        )
        .with_for_update()
    )
    if observation is None:
        raise HTTPException(status_code=404, detail={"code": "OBSERVATION_NOT_FOUND"})

    fields = payload.model_fields_set
    if "species_id" in fields:
        if payload.species_id is None:
            observation.species_id = None
            observation.identified_by = "unidentified"
            observation.identification_job_id = None
        else:
            species = session.scalar(
                select(Species).where(Species.id == payload.species_id, Species.is_active.is_(True))
            )
            if species is None:
                raise HTTPException(status_code=404, detail={"code": "SPECIES_NOT_FOUND"})
            observation.species_id = payload.species_id
            observation.identified_by = "user_selected"
            observation.identification_job_id = None
    if "identified_by" in fields and payload.identified_by:
        if payload.identified_by == "unidentified":
            observation.species_id = None
            observation.identification_job_id = None
        elif payload.identified_by == "user_selected":
            if observation.species_id is None:
                raise HTTPException(status_code=422, detail={"code": "SPECIES_REQUIRED"})
            observation.identification_job_id = None
        else:
            if observation.species_id is None or observation.identification_job_id is None:
                raise HTTPException(
                    status_code=422,
                    detail={"code": "AI_CONFIRMATION_CANNOT_BE_ASSIGNED_BY_EDIT"},
                )
            _validate_job(
                session,
                observation.identification_job_id,
                observation.media_asset_id,
                user_id,
                observation.species_id,
                "ai_confirmed",
            )
        observation.identified_by = payload.identified_by
    if "region_label" in fields:
        observation.region_label = (
            (payload.region_label.strip() or None) if payload.region_label else None
        )
    if payload.observed_at is not None:
        observation.observed_at = payload.observed_at
    observation.updated_at = datetime.now(timezone.utc)
    session.commit()
    updated = _load_observation(session, observation_id, user_id)
    return _observation_response(updated)


@router.delete("/v1/observations/{observation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_observation(
    observation_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> Response:
    observation = session.scalar(
        select(Observation)
        .where(
            Observation.id == observation_id,
            Observation.user_id == user_id,
        )
        .with_for_update()
    )
    if observation is None:
        raise HTTPException(status_code=404, detail={"code": "OBSERVATION_NOT_FOUND"})
    if observation.deleted_at is not None:
        session.rollback()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    media = session.scalar(
        select(MediaAsset).where(MediaAsset.id == observation.media_asset_id).with_for_update()
    )
    media_id = observation.media_asset_id
    deleted_at = datetime.now(timezone.utc)
    observation.deleted_at = deleted_at
    observation.updated_at = deleted_at
    session.flush()
    active_observations = session.scalar(
        select(func.count(Observation.id)).where(
            Observation.media_asset_id == media_id,
            Observation.deleted_at.is_(None),
        )
    )
    if active_observations == 0:
        if media is None:
            session.rollback()
            raise HTTPException(status_code=404, detail={"code": "MEDIA_NOT_FOUND"})
        session.execute(
            update(IdentificationJob)
            .where(
                IdentificationJob.media_asset_id == media_id,
                IdentificationJob.status.in_(["queued", "running"]),
            )
            .values(
                status="failed",
                error_code="MEDIA_DELETED",
                completed_at=deleted_at,
            )
        )
        media.status = "deleted"
        media.deleted_at = deleted_at
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/v1/collection", response_model=CollectionResponse)
def get_collection(
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> CollectionResponse:
    aggregates = session.execute(
        select(
            Observation.species_id,
            func.count(Observation.id),
            func.min(Observation.observed_at),
            func.max(Observation.observed_at),
        )
        .where(
            Observation.user_id == user_id,
            Observation.species_id.is_not(None),
            Observation.deleted_at.is_(None),
        )
        .group_by(Observation.species_id)
        .order_by(func.max(Observation.observed_at).desc())
    ).all()
    species_ids = [species_id for species_id, _, _, _ in aggregates]
    species_rows = session.scalars(
        select(Species)
        .options(joinedload(Species.artwork))
        .where(Species.id.in_(species_ids), Species.is_active.is_(True))
    ).unique()
    species_by_id = {species.id: species for species in species_rows}
    unidentified_count = session.scalar(
        select(func.count(Observation.id)).where(
            Observation.user_id == user_id,
            Observation.species_id.is_(None),
            Observation.deleted_at.is_(None),
        )
    )
    items = [
        CollectionSpeciesResponse(
            species=SpeciesResponse.model_validate(species_response(species)),
            discovery_count=count,
            first_seen_at=first_seen,
            latest_seen_at=latest_seen,
        )
        for species_id, count, first_seen, latest_seen in aggregates
        if (species := species_by_id.get(species_id)) is not None
    ]
    return CollectionResponse(
        items=items,
        unidentified_count=unidentified_count or 0,
        total_species=len(items),
    )
