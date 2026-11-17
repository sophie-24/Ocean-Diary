"""v2: field-guide catalog columns, dive sites, dive logs, site stamps.

Revision ID: 0013_v2_logbook
Revises: 0012_retire_legacy_upload_intents
Create Date: 2026-11-04
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0013_v2_logbook"
down_revision: Union[str, None] = "0012_retire_legacy_upload_intents"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("species", sa.Column("catalog_no", sa.String(3), nullable=True))
    op.add_column("species", sa.Column("group_ko", sa.String(40), nullable=True))
    op.add_column("species", sa.Column("subgroup_ko", sa.String(40), nullable=True))
    op.add_column("species", sa.Column("common_name_en", sa.String(120), nullable=True))
    op.add_column("species", sa.Column("art_key", sa.String(40), nullable=True))
    op.create_unique_constraint("uq_species_catalog_no", "species", ["catalog_no"])
    op.create_index("ix_species_group_ko", "species", ["group_ko"])

    op.create_table(
        "dive_sites",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("catalog_no", sa.String(3), nullable=False, unique=True),
        sa.Column("category_ko", sa.String(40), nullable=False),
        sa.Column("name_ko", sa.String(100), nullable=False),
        sa.Column("name_en", sa.String(160), nullable=False),
        sa.Column("country_ko", sa.String(60), nullable=False),
        sa.Column("region_ko", sa.String(100), nullable=False),
        sa.Column("note_ko", sa.Text(), nullable=False, server_default=""),
        sa.Column("depth_label", sa.String(40), nullable=True),
        sa.Column("level_label", sa.String(40), nullable=True),
        sa.Column("art_key", sa.String(40), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index("ix_dive_sites_category_ko", "dive_sites", ["category_ko"])
    op.create_index("ix_dive_sites_name_ko", "dive_sites", ["name_ko"])

    op.create_table(
        "dive_logs",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("user_id", sa.Uuid(as_uuid=True), nullable=False),
        sa.Column("kind", sa.String(10), nullable=False),
        sa.Column("seq", sa.Integer(), nullable=False),
        sa.Column("dive_date", sa.Date(), nullable=False),
        sa.Column("region_label", sa.String(100), nullable=False),
        sa.Column("point_label", sa.String(100), nullable=False),
        sa.Column("title", sa.String(60), nullable=True),
        sa.Column("details", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("diary_text", sa.Text(), nullable=True),
        sa.Column("sticker_layout", postgresql.JSONB(), nullable=True),
        sa.Column("is_draft", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("site_id", sa.Uuid(as_uuid=True), sa.ForeignKey("dive_sites.id", ondelete="SET NULL"), nullable=True),
        sa.Column("idempotency_key", sa.String(128), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("kind IN ('scuba', 'free', 'snorkel')", name="ck_dive_logs_kind"),
        sa.CheckConstraint("char_length(diary_text) <= 500", name="ck_dive_logs_diary_length"),
        sa.UniqueConstraint("user_id", "kind", "seq", name="uq_dive_logs_user_kind_seq"),
        sa.UniqueConstraint("user_id", "idempotency_key", name="uq_dive_logs_idempotency"),
    )
    op.create_index("ix_dive_logs_user_id", "dive_logs", ["user_id"])
    op.create_index("ix_dive_logs_user_date", "dive_logs", ["user_id", "dive_date"])

    op.create_table(
        "site_stamps",
        sa.Column("user_id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("site_id", sa.Uuid(as_uuid=True), sa.ForeignKey("dive_sites.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("dive_log_id", sa.Uuid(as_uuid=True), sa.ForeignKey("dive_logs.id", ondelete="SET NULL"), nullable=True),
        sa.Column("stamped_on", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.add_column(
        "observations",
        sa.Column("dive_log_id", sa.Uuid(as_uuid=True), sa.ForeignKey("dive_logs.id", ondelete="SET NULL"), nullable=True),
    )
    op.create_index("ix_observations_dive_log_id", "observations", ["dive_log_id"])


def downgrade() -> None:
    op.drop_index("ix_observations_dive_log_id", table_name="observations")
    op.drop_column("observations", "dive_log_id")
    op.drop_table("site_stamps")
    op.drop_index("ix_dive_logs_user_date", table_name="dive_logs")
    op.drop_index("ix_dive_logs_user_id", table_name="dive_logs")
    op.drop_table("dive_logs")
    op.drop_index("ix_dive_sites_name_ko", table_name="dive_sites")
    op.drop_index("ix_dive_sites_category_ko", table_name="dive_sites")
    op.drop_table("dive_sites")
    op.drop_index("ix_species_group_ko", table_name="species")
    op.drop_constraint("uq_species_catalog_no", "species", type_="unique")
    for column in ("art_key", "common_name_en", "subgroup_ko", "group_ko", "catalog_no"):
        op.drop_column("species", column)
