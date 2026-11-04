"""Add private user-owned media upload records.

Revision ID: 0002_media_assets
Revises: 0001_species_catalog
Create Date: 2026-11-01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002_media_assets"
down_revision: Union[str, None] = "0001_species_catalog"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "media_assets",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("owner_user_id", sa.Uuid(), nullable=False),
        sa.Column("storage_key", sa.String(length=500), nullable=False),
        sa.Column("mime_type", sa.String(length=50), nullable=False),
        sa.Column("byte_size", sa.BigInteger(), nullable=False),
        sa.Column("width", sa.Integer(), nullable=True),
        sa.Column("height", sa.Integer(), nullable=True),
        sa.Column("sha256", sa.String(length=64), nullable=True),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "byte_size > 0 AND byte_size <= 15728640", name="ck_media_assets_size"
        ),
        sa.CheckConstraint(
            "mime_type IN ('image/jpeg', 'image/png')", name="ck_media_assets_mime_type"
        ),
        sa.CheckConstraint(
            "status IN ('pending_upload', 'processing', 'ready', 'rejected', 'deleted')",
            name="ck_media_assets_status",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("storage_key"),
    )
    op.create_index("ix_media_assets_owner_user_id", "media_assets", ["owner_user_id"])


def downgrade() -> None:
    op.drop_index("ix_media_assets_owner_user_id", table_name="media_assets")
    op.drop_table("media_assets")
