"""Preserve original upload size and checksum after image sanitization.

Revision ID: 0011_upload_request_fingerprints
Revises: 0010_separate_media_upload_objects
Create Date: 2026-11-02
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0011_upload_request_fingerprints"
down_revision: Union[str, None] = "0010_separate_media_upload_objects"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "media_assets", sa.Column("upload_byte_size", sa.BigInteger(), nullable=True)
    )
    op.add_column(
        "media_assets", sa.Column("upload_sha256", sa.String(length=64), nullable=True)
    )
    op.create_check_constraint(
        "ck_media_assets_upload_size",
        "media_assets",
        "upload_byte_size IS NULL OR upload_byte_size BETWEEN 1 AND 15728640",
    )
    # For pending uploads byte_size and sha256 still describe the uploaded file.
    # Ready legacy rows no longer retain the original fingerprint, so leave those
    # nullable and let the idempotency handler treat them as legacy records.
    op.execute(
        "UPDATE media_assets "
        "SET upload_byte_size = byte_size, upload_sha256 = sha256 "
        "WHERE status IN ('pending_upload', 'processing')"
    )


def downgrade() -> None:
    op.drop_constraint("ck_media_assets_upload_size", "media_assets", type_="check")
    op.drop_column("media_assets", "upload_sha256")
    op.drop_column("media_assets", "upload_byte_size")
