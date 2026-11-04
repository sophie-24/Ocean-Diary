"""Persist recent AI provider failures for a shared worker circuit breaker.

Revision ID: 0007_ai_provider_circuit_breaker
Revises: 0006_async_media_deletion
Create Date: 2026-11-01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0007_ai_provider_circuit_breaker"
down_revision: Union[str, None] = "0006_async_media_deletion"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_provider_failure_events",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("provider", sa.String(length=80), nullable=False),
        sa.Column(
            "occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_ai_provider_failure_provider_occurred",
        "ai_provider_failure_events",
        ["provider", "occurred_at"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_ai_provider_failure_provider_occurred",
        table_name="ai_provider_failure_events",
    )
    op.drop_table("ai_provider_failure_events")
