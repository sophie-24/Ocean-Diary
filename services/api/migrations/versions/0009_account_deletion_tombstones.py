"""Prevent revoked account tokens from recreating user data.

Revision ID: 0009_account_deletion_tombstones
Revises: 0008_external_ai_consent
Create Date: 2026-11-01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0009_account_deletion_tombstones"
down_revision: Union[str, None] = "0008_external_ai_consent"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "account_deletion_tombstones",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("requested_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("block_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "(status = 'pending' AND completed_at IS NULL AND block_expires_at IS NULL) OR "
            "(status = 'complete' AND completed_at IS NOT NULL AND block_expires_at IS NOT NULL)",
            name="ck_account_deletion_tombstone_state",
        ),
        sa.PrimaryKeyConstraint("user_id"),
    )
    op.create_index(
        "ix_account_deletion_tombstones_expiry",
        "account_deletion_tombstones",
        ["block_expires_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_account_deletion_tombstones_expiry",
        table_name="account_deletion_tombstones",
    )
    op.drop_table("account_deletion_tombstones")
