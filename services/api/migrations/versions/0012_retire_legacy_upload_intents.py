"""Retire legacy uploads whose signed and processed object keys were shared.

Revision ID: 0012_retire_legacy_upload_intents
Revises: 0011_upload_request_fingerprints
Create Date: 2026-11-02
"""

from typing import Sequence, Union

from alembic import context, op
import sqlalchemy as sa

from app.settings import settings

revision: str = "0012_retire_legacy_upload_intents"
down_revision: Union[str, None] = "0011_upload_request_fingerprints"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    if context.is_offline_mode():
        ttl_seconds = settings.upload_intent_ttl_seconds
        safe_wait_seconds = ttl_seconds * 2 + 15 * 60
        op.execute(
            "DO $$ BEGIN "
            "IF EXISTS (SELECT 1 FROM media_assets "
            "WHERE status = 'ready' AND upload_storage_key IS NULL "
            "AND expires_at >= now() - interval '15 minutes' "
            f"- interval '{ttl_seconds} seconds') THEN "
            "RAISE EXCEPTION 'Cannot retire legacy upload URLs while a ready photo may still be overwritten. "
            "Stop the old API, keep UPLOAD_INTENT_TTL_SECONDS unchanged, wait at least "
            f"{safe_wait_seconds} seconds, then retry this migration.'; "
            "END IF; END $$"
        )
    else:
        active_legacy_ready = op.get_bind().execute(
            sa.text(
                "SELECT count(*) FROM media_assets "
                "WHERE status = 'ready' AND upload_storage_key IS NULL "
                "AND expires_at >= now() - interval '15 minutes' "
                "- (:ttl_seconds * interval '1 second')"
            ),
            {"ttl_seconds": settings.upload_intent_ttl_seconds},
        ).scalar_one()
        if active_legacy_ready:
            safe_wait_seconds = settings.upload_intent_ttl_seconds * 2 + 15 * 60
            raise RuntimeError(
                "Cannot retire legacy upload URLs while a ready photo may still be overwritten. "
                "Stop the old API, keep UPLOAD_INTENT_TTL_SECONDS unchanged, wait at least "
                f"{safe_wait_seconds} seconds, then retry this migration."
            )

    # Before 0010, clients received a signed URL for storage_key, which is also
    # where the server writes the sanitized image. A still-valid old URL could
    # overwrite that image after complete_upload. Retire these in-flight rows
    # while retaining the URL's key so deletion/account cleanup waits until the
    # signature expires and the worker can remove any late PUT.
    op.execute(
        "UPDATE media_assets "
        "SET status = CASE WHEN status IN ('pending_upload', 'processing') "
        "THEN 'deleted' ELSE status END, "
        "deleted_at = CASE WHEN status IN ('pending_upload', 'processing') "
        "THEN COALESCE(deleted_at, now()) ELSE deleted_at END, "
        "upload_storage_key = storage_key, "
        "expires_at = GREATEST(expires_at, now() + "
        f"interval '{settings.upload_intent_ttl_seconds} seconds') "
        "WHERE status IN ('pending_upload', 'processing', 'rejected', 'deleted') "
        "AND upload_storage_key IS NULL"
    )


def downgrade() -> None:
    # The original status of retired uploads is not recorded, so do not revive
    # them. Remove the alias for rows the worker has not already finalized.
    op.execute(
        "UPDATE media_assets SET upload_storage_key = NULL "
        "WHERE storage_deleted_at IS NULL "
        "AND upload_storage_key = storage_key"
    )
