"""Store shared API rate-limit events in PostgreSQL.

Revision ID: 0005_api_rate_limit_events
Revises: 0004_observations
Create Date: 2026-11-01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0005_api_rate_limit_events"
down_revision: Union[str, None] = "0004_observations"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "api_rate_limit_events",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("bucket_key", sa.String(length=64), nullable=False),
        sa.Column(
            "occurred_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_api_rate_limit_bucket_occurred",
        "api_rate_limit_events",
        ["bucket_key", "occurred_at"],
    )
    op.create_index(
        "ix_api_rate_limit_events_occurred_at",
        "api_rate_limit_events",
        ["occurred_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_api_rate_limit_events_occurred_at", table_name="api_rate_limit_events")
    op.drop_index("ix_api_rate_limit_bucket_occurred", table_name="api_rate_limit_events")
    op.drop_table("api_rate_limit_events")
