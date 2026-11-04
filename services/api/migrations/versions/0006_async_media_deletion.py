"""Track storage cleanup separately from logical media deletion.

Revision ID: 0006_async_media_deletion
Revises: 0005_api_rate_limit_events
Create Date: 2026-11-01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0006_async_media_deletion"
down_revision: Union[str, None] = "0005_api_rate_limit_events"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "media_assets",
        sa.Column("storage_deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    # Existing deleted rows were marked only after their object deletion succeeded.
    op.execute(
        sa.text(
            "UPDATE media_assets "
            "SET storage_deleted_at = COALESCE(deleted_at, created_at) "
            "WHERE status = 'deleted'"
        )
    )


def downgrade() -> None:
    pending = op.get_bind().execute(
        sa.text(
            "SELECT count(*) FROM media_assets "
            "WHERE status = 'deleted' AND storage_deleted_at IS NULL"
        )
    ).scalar_one()
    if pending:
        raise RuntimeError(
            "Cannot remove storage deletion tracking while media cleanup is pending"
        )
    op.drop_column("media_assets", "storage_deleted_at")
