"""PostgreSQL-backed identification worker."""

import logging
import time
from datetime import datetime, timedelta, timezone
from uuid import UUID

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException
from sqlalchemy import and_, delete, not_, or_, select, text, update

from app.ai_circuit_breaker import (
    clear_provider_failures,
    provider_retry_after,
    record_provider_failure,
)
from app.account import finish_account_deletion
from app.auth import user_lifecycle_lock_key
from app.database import SessionLocal
from app.identification_providers import (
    IdentificationProviderError,
    SpeciesLabel,
    identify_with_configured_provider,
)
from app.models import (
    AccountDeletionTombstone,
    IdentificationCandidate,
    IdentificationJob,
    MediaAsset,
    Observation,
    Species,
)
from app.settings import EXTERNAL_AI_DISCLOSURE_VERSION, settings
from app.storage import storage_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("ocean-diary.worker")
MAX_UPLOAD_BYTES = 15 * 1024 * 1024


def cleanup_orphaned_media() -> int:
    """Retry requested object deletions and delete expired or unreferenced media."""
    now = datetime.now(timezone.utc)
    safe_cutoff = now - timedelta(minutes=15)
    ready_media_cutoff = now - timedelta(days=7)
    deleted_count = 0
    with SessionLocal() as session:
        rows = list(
            session.scalars(
                select(MediaAsset)
                .where(
                    or_(
                        and_(
                            MediaAsset.status == "pending_upload",
                            MediaAsset.expires_at < safe_cutoff,
                        ),
                        and_(
                            MediaAsset.status == "rejected",
                            MediaAsset.expires_at < safe_cutoff,
                        ),
                        and_(
                            MediaAsset.status == "deleted",
                            or_(
                                and_(
                                    MediaAsset.storage_deleted_at.is_(None),
                                    or_(
                                        MediaAsset.upload_storage_key.is_(None),
                                        MediaAsset.expires_at < safe_cutoff,
                                    ),
                                ),
                                and_(
                                    MediaAsset.storage_deleted_at.is_not(None),
                                    MediaAsset.upload_storage_key.is_not(None),
                                    MediaAsset.expires_at < safe_cutoff,
                                ),
                            ),
                        ),
                        and_(
                            MediaAsset.status == "ready",
                            MediaAsset.upload_storage_key.is_not(None),
                            MediaAsset.expires_at < safe_cutoff,
                        ),
                        and_(
                            MediaAsset.status == "ready",
                            MediaAsset.created_at < ready_media_cutoff,
                            ~select(Observation.id)
                            .where(
                                Observation.media_asset_id == MediaAsset.id,
                                Observation.deleted_at.is_(None),
                            )
                            .exists(),
                            ~select(IdentificationJob.id)
                            .where(
                                IdentificationJob.media_asset_id == MediaAsset.id,
                                IdentificationJob.status.in_(["queued", "running"]),
                            )
                            .exists(),
                        ),
                    )
                )
                .order_by(MediaAsset.expires_at)
                .with_for_update(skip_locked=True)
                .limit(100)
            )
        )
        if not rows:
            session.rollback()
            return 0
        client = storage_client()
        for media in rows:
            stale_upload_only = (
                media.status == "ready"
                and media.upload_storage_key is not None
                and media.expires_at < safe_cutoff
            )
            deleted_upload_retry_only = (
                media.status == "deleted"
                and media.storage_deleted_at is not None
                and media.upload_storage_key is not None
                and media.expires_at < safe_cutoff
            )
            try:
                keys = (
                    {media.upload_storage_key}
                    if stale_upload_only or deleted_upload_retry_only
                    else {
                        media.storage_key,
                        media.upload_storage_key,
                    }
                )
                for key in keys - {None}:
                    client.delete_object(Bucket=settings.s3_bucket_name, Key=key)
            except (BotoCoreError, ClientError):
                logger.warning("media object cleanup will retry media_id=%s", media.id)
                continue
            if stale_upload_only:
                media.upload_storage_key = None
                continue
            if deleted_upload_retry_only:
                media.upload_storage_key = None
                continue
            media.status = "deleted"
            media.deleted_at = media.deleted_at or now
            media.storage_deleted_at = now
            # Do not finalize deletion until the presigned upload URL has
            # expired (plus the cleanup grace period). Once both objects were
            # successfully removed, no late signed PUT can recreate the
            # upload object, so the key no longer needs another cleanup pass.
            media.upload_storage_key = None
            deleted_count += 1
        session.commit()
    if deleted_count:
        logger.info("media object cleanup deleted=%s", deleted_count)
    return deleted_count


def cleanup_expired_account_tombstones() -> int:
    """Forget deletion markers after every allowed access token must have expired."""
    now = datetime.now(timezone.utc)
    with SessionLocal() as session:
        result = session.execute(
            delete(AccountDeletionTombstone).where(
                AccountDeletionTombstone.status == "complete",
                AccountDeletionTombstone.block_expires_at <= now,
            )
        )
        session.commit()
        return result.rowcount or 0


def cleanup_deleted_observations(limit: int = 100) -> tuple[int, int]:
    """Purge soft-deleted records after their bounded idempotency recovery window."""
    cutoff = datetime.now(timezone.utc) - timedelta(
        days=settings.deleted_observation_retention_days
    )
    with SessionLocal() as session:
        observation_ids = list(
            session.scalars(
                select(Observation.id)
                .where(Observation.deleted_at < cutoff)
                .order_by(Observation.deleted_at)
                .with_for_update(skip_locked=True)
                .limit(limit)
            )
        )
        if observation_ids:
            session.execute(delete(Observation).where(Observation.id.in_(observation_ids)))

        media_ids = list(
            session.scalars(
                select(MediaAsset.id)
                .where(
                    MediaAsset.status == "deleted",
                    MediaAsset.deleted_at < cutoff,
                    MediaAsset.storage_deleted_at.is_not(None),
                    MediaAsset.upload_storage_key.is_(None),
                    ~select(Observation.id)
                    .where(Observation.media_asset_id == MediaAsset.id)
                    .exists(),
                    ~select(IdentificationJob.id)
                    .where(
                        IdentificationJob.media_asset_id == MediaAsset.id,
                        IdentificationJob.status.in_(["queued", "running"]),
                    )
                    .exists(),
                )
                .order_by(MediaAsset.deleted_at)
                .with_for_update(skip_locked=True)
                .limit(limit)
            )
        )
        if media_ids:
            session.execute(delete(MediaAsset).where(MediaAsset.id.in_(media_ids)))
        session.commit()
        return len(observation_ids), len(media_ids)


def cleanup_pending_account_deletions(limit: int = 10) -> int:
    """Resume interrupted account deletion while keeping the tombstone active."""
    completed = 0
    attempted_user_ids: set[UUID] = set()
    safe_upload_cutoff = datetime.now(timezone.utc) - timedelta(minutes=15)
    for _ in range(limit):
        with SessionLocal() as session:
            active_upload = (
                select(MediaAsset.id)
                .where(
                    MediaAsset.owner_user_id == AccountDeletionTombstone.user_id,
                    MediaAsset.upload_storage_key.is_not(None),
                    MediaAsset.expires_at >= safe_upload_cutoff,
                )
                .exists()
            )
            pending_deletions = [
                AccountDeletionTombstone.status == "pending",
                not_(active_upload),
            ]
            if attempted_user_ids:
                pending_deletions.append(
                    AccountDeletionTombstone.user_id.not_in(attempted_user_ids)
                )
            tombstone = session.scalar(
                select(AccountDeletionTombstone)
                .where(*pending_deletions)
                .order_by(AccountDeletionTombstone.requested_at)
                .with_for_update(skip_locked=True)
                .limit(1)
            )
            if tombstone is None:
                session.rollback()
                break
            user_id = tombstone.user_id
            try:
                finish_account_deletion(session, user_id)
                completed += 1
                logger.info("pending account deletion completed")
            except HTTPException as exc:
                session.rollback()
                detail = exc.detail if isinstance(exc.detail, dict) else {}
                logger.warning(
                    "pending account deletion will retry code=%s status=%s",
                    detail.get("code", "ACCOUNT_DELETE_FAILED"),
                    exc.status_code,
                )
                attempted_user_ids.add(user_id)
                continue
            except Exception:
                session.rollback()
                logger.exception("pending account deletion failed unexpectedly")
                attempted_user_ids.add(user_id)
                continue
    return completed


def run_one_job() -> bool:
    with SessionLocal() as session:
        job = session.scalar(
            select(IdentificationJob)
            .where(IdentificationJob.status == "queued")
            .order_by(IdentificationJob.created_at)
            .with_for_update(skip_locked=True)
            .limit(1)
        )
        if job is None:
            session.rollback()
            return False
        job.status = "running"
        job.started_at = datetime.now(timezone.utc)
        configured_provider = settings.identification_provider.strip().lower()
        job.provider = configured_provider
        job.model_version = settings.openai_model if configured_provider == "openai" else "development-empty-provider"
        job_id = job.id
        media_id = job.media_asset_id
        user_id = job.user_id
        session.commit()

    job_started_monotonic = time.monotonic()
    predictions = []
    error_code = None
    final_status = "succeeded"
    try:
        with SessionLocal() as session:
            if configured_provider != "mock":
                retry_after = provider_retry_after(session, configured_provider)
                session.rollback()
                if retry_after:
                    raise IdentificationProviderError("AI_PROVIDER_CIRCUIT_OPEN")
            # Serialize photo processing with account deletion. The xact lock
            # remains held through object read and provider processing.
            session.execute(
                text("SELECT pg_advisory_xact_lock(hashtextextended(:lock_key, 0))"),
                {"lock_key": user_lifecycle_lock_key(user_id)},
            )
            tombstone = session.get(AccountDeletionTombstone, user_id)
            now = datetime.now(timezone.utc)
            if tombstone and (
                tombstone.status == "pending"
                or (tombstone.block_expires_at and tombstone.block_expires_at > now)
            ):
                raise IdentificationProviderError("ACCOUNT_DELETED")
            media = session.scalar(
                select(MediaAsset).where(MediaAsset.id == media_id, MediaAsset.status == "ready")
            )
            if media is None:
                raise IdentificationProviderError("MEDIA_NOT_AVAILABLE")
            if configured_provider != "mock" and (
                media.external_ai_consent_provider != configured_provider
                or media.external_ai_consent_version != EXTERNAL_AI_DISCLOSURE_VERSION
            ):
                # Fail closed if the worker's provider differs from the one the
                # user saw and acknowledged before uploading the photo.
                raise IdentificationProviderError("EXTERNAL_AI_CONSENT_REQUIRED")
            image_response = storage_client().get_object(
                Bucket=settings.s3_bucket_name, Key=media.storage_key
            )
            image_stream = image_response["Body"]
            try:
                image_bytes = image_stream.read(MAX_UPLOAD_BYTES + 1)
            finally:
                image_stream.close()
            if len(image_bytes) != media.byte_size or len(image_bytes) > MAX_UPLOAD_BYTES:
                raise IdentificationProviderError("MEDIA_NOT_AVAILABLE")
            catalog_rows = list(
                session.scalars(
                    select(Species).where(Species.is_active.is_(True)).order_by(Species.slug)
                )
            )
            catalog = [
                SpeciesLabel(row.slug, row.common_name_ko, row.scientific_name)
                for row in catalog_rows
            ]
            predictions = identify_with_configured_provider(image_bytes, media.mime_type, catalog)
    except IdentificationProviderError as exc:
        final_status = "failed"
        error_code = exc.code
    except (BotoCoreError, ClientError):
        final_status = "failed"
        error_code = "STORAGE_UNAVAILABLE"
    except Exception:
        logger.exception("identification job failed unexpectedly id=%s", job_id)
        final_status = "failed"
        error_code = "IDENTIFICATION_FAILED"

    with SessionLocal() as session:
        job = session.scalar(
            select(IdentificationJob)
            .where(IdentificationJob.id == job_id)
            .with_for_update()
        )
        if job is None or job.status != "running":
            return True
        if final_status == "succeeded" and predictions:
            species_by_slug = {
                row.slug: row
                for row in session.scalars(
                    select(Species).where(Species.slug.in_([item.slug for item in predictions]))
                )
            }
            for rank, prediction in enumerate(predictions, start=1):
                species = species_by_slug.get(prediction.slug)
                if species is None:
                    continue
                session.add(
                    IdentificationCandidate(
                        job_id=job.id,
                        species_id=species.id,
                        rank=rank,
                        score=None,
                        confidence_band=prediction.confidence_band,
                        label_raw=prediction.slug,
                    )
                )
        job.status = final_status
        job.error_code = error_code
        job.completed_at = datetime.now(timezone.utc)
        if configured_provider != "mock":
            if final_status == "succeeded":
                clear_provider_failures(session, configured_provider)
            elif error_code in {"AI_PROVIDER_UNAVAILABLE", "AI_INVALID_RESPONSE"}:
                if record_provider_failure(session, configured_provider):
                    logger.warning("AI provider circuit opened provider=%s", configured_provider)
        session.commit()
    logger.info(
        "identification job finished id=%s status=%s elapsed_ms=%s",
        job_id,
        final_status,
        round((time.monotonic() - job_started_monotonic) * 1000),
    )
    return True


def main() -> None:
    logger.info("worker started provider=%s", settings.identification_provider.strip().lower())
    with SessionLocal() as session:
        now = datetime.now(timezone.utc)
        session.execute(
            update(IdentificationJob)
            .where(
                IdentificationJob.status == "running",
                IdentificationJob.started_at < now - timedelta(minutes=10),
            )
            .values(status="failed", error_code="WORKER_INTERRUPTED", completed_at=now)
        )
        session.commit()
    next_cleanup = time.monotonic()
    while True:
        if time.monotonic() >= next_cleanup:
            try:
                cleanup_orphaned_media()
            except Exception:
                logger.exception("expired upload cleanup failed")
            try:
                completed_deletions = cleanup_pending_account_deletions()
                if completed_deletions:
                    logger.info("pending account deletions completed=%s", completed_deletions)
            except Exception:
                logger.exception("pending account deletion cleanup failed")
            try:
                removed_tombstones = cleanup_expired_account_tombstones()
                if removed_tombstones:
                    logger.info("expired account deletion tombstones removed=%s", removed_tombstones)
            except Exception:
                logger.exception("expired account deletion tombstone cleanup failed")
            try:
                removed_observations, removed_media = cleanup_deleted_observations()
                if removed_observations or removed_media:
                    logger.info(
                        "aged deletion data purged observations=%s media=%s",
                        removed_observations,
                        removed_media,
                    )
            except Exception:
                logger.exception("aged deletion data cleanup failed")
            next_cleanup = time.monotonic() + 60
        if not run_one_job():
            time.sleep(1)


if __name__ == "__main__":
    main()








