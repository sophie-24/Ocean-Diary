"""Separate client upload objects from sanitized media objects.

Revision ID: 0010_separate_media_upload_objects
Revises: 0009_account_deletion_tombstones
Create Date: 2026-11-02
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0010_separate_media_upload_objects"
down_revision: Union[str, None] = "0009_account_deletion_tombstones"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Alembic's default version_num column is VARCHAR(32), but this and later
    # revision identifiers exceed that length. Widen it before Alembic writes
    # the new revision after this upgrade function returns.
    op.alter_column(
        "alembic_version",
        "version_num",
        existing_type=sa.String(length=32),
        type_=sa.String(length=128),
        existing_nullable=False,
    )
    op.add_column("media_assets", sa.Column("upload_storage_key", sa.String(length=500), nullable=True))
    op.create_unique_constraint(
        "uq_media_assets_upload_storage_key", "media_assets", ["upload_storage_key"]
    )
    op.add_column("media_assets", sa.Column("upload_intent_key", sa.String(length=128), nullable=True))
    op.create_unique_constraint(
        "uq_media_assets_owner_upload_intent_key",
        "media_assets",
        ["owner_user_id", "upload_intent_key"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_media_assets_owner_upload_intent_key", "media_assets", type_="unique"
    )
    op.drop_column("media_assets", "upload_intent_key")
    op.drop_constraint("uq_media_assets_upload_storage_key", "media_assets", type_="unique")
    op.drop_column("media_assets", "upload_storage_key")
