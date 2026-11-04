from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from datetime import datetime, timedelta, timezone

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select, text
from sqlalchemy.orm import Session
from uuid import UUID

from app.auth import get_current_user_id_for_account_deletion, user_lifecycle_lock_key
from app.database import get_session
from app.models import AccountDeletionTombstone, IdentificationJob, MediaAsset, Observation
from app.settings import settings
from app.storage import storage_client

router = APIRouter(prefix="/v1/account", tags=["account"])


def _delete_supabase_user(user_id: UUID) -> None:
    if not settings.supabase_url:
        return
    if not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "ACCOUNT_DELETE_NOT_CONFIGURED"},
        )

    request = Request(
        f"{settings.supabase_url.rstrip('/')}/auth/v1/admin/users/{user_id}",
        method="DELETE",
        headers={
            "apikey": settings.supabase_service_role_key,
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with urlopen(request, timeout=10) as response:
            if response.status not in (200, 204):
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail={"code": "ACCOUNT_DELETE_AUTH_PROVIDER_FAILED"},
                )
    except HTTPError as exc:
        # Treat an already-removed identity as success so a retry can finish cleanup.
        if exc.code == 404:
            return
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "ACCOUNT_DELETE_AUTH_PROVIDER_FAILED"},
        ) from exc
    except (URLError, TimeoutError) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "ACCOUNT_DELETE_AUTH_PROVIDER_UNAVAILABLE"},
        ) from exc


def finish_account_deletion(session: Session, user_id: UUID) -> None:
    """Idempotently remove a user's data and complete an existing tombstone."""
    media_assets = list(
        session.scalars(select(MediaAsset).where(MediaAsset.owner_user_id == user_id))
    )
    now = datetime.now(timezone.utc)
    safe_upload_cutoff = now - timedelta(minutes=15)
    if any(
        media.upload_storage_key is not None
        and media.expires_at >= safe_upload_cutoff
        for media in media_assets
    ):
        # S3 presigned PUTs cannot be revoked. Keep the tombstone active until
        # every upload capability expires and an in-flight PUT has time to
        # finish, then retry cleanup without risking a recreated object.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "ACCOUNT_DELETE_UPLOAD_URL_ACTIVE"},
        )
    storage = storage_client()
    try:
        for media in media_assets:
            for key in {media.storage_key, media.upload_storage_key} - {None}:
                storage.delete_object(Bucket=settings.s3_bucket_name, Key=key)
    except (BotoCoreError, ClientError) as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "ACCOUNT_DELETE_MEDIA_CLEANUP_FAILED"},
        ) from exc

    # These operations are safe to repeat if a later Auth provider request fails.
    session.execute(delete(Observation).where(Observation.user_id == user_id))
    session.execute(delete(IdentificationJob).where(IdentificationJob.user_id == user_id))
    session.execute(delete(MediaAsset).where(MediaAsset.owner_user_id == user_id))
    session.commit()

    # Local fixed-token development identity has no matching Supabase auth user.
    is_local_dev_identity = (
        settings.app_env == "development"
        and settings.dev_auth_enabled
        and user_id == settings.dev_auth_user_id
    )
    if is_local_dev_identity:
        return

    _delete_supabase_user(user_id)
    tombstone = session.get(AccountDeletionTombstone, user_id)
    if tombstone is not None:
        now = datetime.now(timezone.utc)
        tombstone.status = "complete"
        tombstone.completed_at = now
        tombstone.block_expires_at = now + timedelta(
            seconds=settings.supabase_access_token_max_age_seconds
        )
        session.commit()


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    user_id: UUID = Depends(get_current_user_id_for_account_deletion),
    session: Session = Depends(get_session),
) -> None:
    is_local_dev_identity = (
        settings.app_env == "development"
        and settings.dev_auth_enabled
        and user_id == settings.dev_auth_user_id
    )
    if (
        settings.supabase_url
        and not settings.supabase_service_role_key
        and not is_local_dev_identity
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "ACCOUNT_DELETE_NOT_CONFIGURED"},
        )

    if not is_local_dev_identity:
        # Serialize with normal user requests. Once the pending tombstone commits,
        # stale access tokens are denied while cleanup can safely be retried.
        session.execute(
            text("SELECT pg_advisory_xact_lock(hashtextextended(:lock_key, 0))"),
            {"lock_key": user_lifecycle_lock_key(user_id)},
        )
        tombstone = session.get(AccountDeletionTombstone, user_id)
        if tombstone and tombstone.status == "complete":
            session.rollback()
            return
        if tombstone is None:
            session.add(AccountDeletionTombstone(user_id=user_id, status="pending"))
            session.commit()
        else:
            session.rollback()

    finish_account_deletion(session, user_id)

