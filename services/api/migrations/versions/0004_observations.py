"""Add private user discovery records.

Revision ID: 0004_observations
Revises: 0003_identification_jobs
Create Date: 2026-11-01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0004_observations"
down_revision: Union[str, None] = "0003_identification_jobs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "observations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("species_id", sa.Uuid(), nullable=True),
        sa.Column("media_asset_id", sa.Uuid(), nullable=False),
        sa.Column("identification_job_id", sa.Uuid(), nullable=True),
        sa.Column("identified_by", sa.String(length=30), nullable=False),
        sa.Column("region_label", sa.String(length=100), nullable=True),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("idempotency_key", sa.String(length=128), nullable=False),
        sa.CheckConstraint(
            "identified_by IN ('ai_confirmed', 'user_selected', 'unidentified')",
            name="ck_observations_identified_by",
        ),
        sa.CheckConstraint(
            "(identified_by = 'unidentified' AND species_id IS NULL) OR "
            "(identified_by IN ('ai_confirmed', 'user_selected') AND species_id IS NOT NULL)",
            name="ck_observations_species_selection",
        ),
        sa.ForeignKeyConstraint(
            ["identification_job_id"], ["identification_jobs.id"], ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(["media_asset_id"], ["media_assets.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["species_id"], ["species.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "idempotency_key", name="uq_observations_idempotency"),
    )
    op.create_index("ix_observations_user_id", "observations", ["user_id"])
    op.create_index("ix_observations_species_id", "observations", ["species_id"])


def downgrade() -> None:
    op.drop_index("ix_observations_species_id", table_name="observations")
    op.drop_index("ix_observations_user_id", table_name="observations")
    op.drop_table("observations")
