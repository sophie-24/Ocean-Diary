"""Record provider-specific external AI photo consent.

Revision ID: 0008_external_ai_consent
Revises: 0007_ai_provider_circuit_breaker
Create Date: 2026-11-01
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0008_external_ai_consent"
down_revision: Union[str, None] = "0007_ai_provider_circuit_breaker"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "media_assets",
        sa.Column("external_ai_consent_provider", sa.String(length=80), nullable=True),
    )
    op.add_column(
        "media_assets",
        sa.Column("external_ai_consent_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "media_assets",
        sa.Column("external_ai_consent_version", sa.String(length=30), nullable=True),
    )
    op.create_check_constraint(
        "ck_media_assets_ai_consent_complete",
        "media_assets",
        "(external_ai_consent_provider IS NULL AND external_ai_consent_at IS NULL AND "
        "external_ai_consent_version IS NULL) OR "
        "(external_ai_consent_provider IS NOT NULL AND external_ai_consent_at IS NOT NULL AND "
        "external_ai_consent_version IS NOT NULL)",
    )


def downgrade() -> None:
    op.drop_constraint(
        "ck_media_assets_ai_consent_complete",
        "media_assets",
        type_="check",
    )
    op.drop_column("media_assets", "external_ai_consent_version")
    op.drop_column("media_assets", "external_ai_consent_at")
    op.drop_column("media_assets", "external_ai_consent_provider")
