"""Add asynchronous identification jobs and candidates.

Revision ID: 0003_identification_jobs
Revises: 0002_media_assets
Create Date: 2026-11-01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0003_identification_jobs"
down_revision: Union[str, None] = "0002_media_assets"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "identification_jobs",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("media_asset_id", sa.Uuid(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("provider", sa.String(length=80), nullable=True),
        sa.Column("model_version", sa.String(length=120), nullable=True),
        sa.Column("error_code", sa.String(length=80), nullable=True),
        sa.Column("idempotency_key", sa.String(length=128), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint(
            "status IN ('queued', 'running', 'succeeded', 'failed')",
            name="ck_identification_jobs_status",
        ),
        sa.ForeignKeyConstraint(["media_asset_id"], ["media_assets.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "idempotency_key", name="uq_identification_job_idempotency"),
    )
    op.create_index("ix_identification_jobs_user_id", "identification_jobs", ["user_id"])
    op.create_index("ix_identification_jobs_status", "identification_jobs", ["status"])
    op.create_index(
        "ix_identification_job_queue", "identification_jobs", ["status", "created_at"]
    )

    op.create_table(
        "identification_candidates",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("job_id", sa.Uuid(), nullable=False),
        sa.Column("species_id", sa.Uuid(), nullable=True),
        sa.Column("rank", sa.SmallInteger(), nullable=False),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("confidence_band", sa.String(length=20), nullable=False),
        sa.Column("label_raw", sa.String(length=200), nullable=True),
        sa.CheckConstraint("rank BETWEEN 1 AND 3", name="ck_identification_candidates_rank"),
        sa.CheckConstraint(
            "confidence_band IN ('high', 'medium', 'low')",
            name="ck_identification_candidates_confidence",
        ),
        sa.ForeignKeyConstraint(["job_id"], ["identification_jobs.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["species_id"], ["species.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("job_id", "rank", name="uq_identification_candidates_job_rank"),
    )
    op.create_index("ix_identification_candidates_job_id", "identification_candidates", ["job_id"])


def downgrade() -> None:
    op.drop_index("ix_identification_candidates_job_id", table_name="identification_candidates")
    op.drop_table("identification_candidates")
    op.drop_index("ix_identification_job_queue", table_name="identification_jobs")
    op.drop_index("ix_identification_jobs_status", table_name="identification_jobs")
    op.drop_index("ix_identification_jobs_user_id", table_name="identification_jobs")
    op.drop_table("identification_jobs")
