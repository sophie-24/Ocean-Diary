"""Create the species catalog and artwork metadata."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_species_catalog"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "species",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=100), nullable=False),
        sa.Column("common_name_ko", sa.String(length=100), nullable=False),
        sa.Column("scientific_name", sa.String(length=200), nullable=False),
        sa.Column("description_ko", sa.Text(), nullable=False),
        sa.Column("taxonomy_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_species_common_name_ko", "species", ["common_name_ko"])
    op.create_index("ix_species_scientific_name", "species", ["scientific_name"])
    op.create_table(
        "species_artworks",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("species_id", sa.Uuid(), nullable=False),
        sa.Column("asset_key", sa.String(length=500), nullable=False),
        sa.Column("thumbnail_key", sa.String(length=500), nullable=True),
        sa.Column("style_name", sa.String(length=50), server_default="storybook", nullable=False),
        sa.Column("license_source", sa.String(length=500), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["species_id"], ["species.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("species_id"),
    )


def downgrade() -> None:
    op.drop_table("species_artworks")
    op.drop_index("ix_species_scientific_name", table_name="species")
    op.drop_index("ix_species_common_name_ko", table_name="species")
    op.drop_table("species")
