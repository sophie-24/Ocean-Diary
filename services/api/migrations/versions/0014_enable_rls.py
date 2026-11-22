"""Enable row level security on every table (Supabase Data API hardening).

The API connects as the table owner, which bypasses RLS, so server behaviour does not change.
With RLS on and no policies, the Supabase Data API (anon / authenticated keys) can read or
write nothing, which is the intended state: all access goes through this API.

Revision ID: 0014_enable_rls
Revises: 0013_v2_logbook
Create Date: 2026-11-23
"""

from typing import Sequence, Union

from alembic import op

revision: str = "0014_enable_rls"
down_revision: Union[str, None] = "0013_v2_logbook"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TABLES = (
    "species",
    "species_artworks",
    "media_assets",
    "identification_jobs",
    "identification_candidates",
    "observations",
    "api_rate_limit_events",
    "ai_provider_failure_events",
    "account_deletion_tombstones",
    "dive_sites",
    "dive_logs",
    "site_stamps",
    "alembic_version",
)


def upgrade() -> None:
    for table in TABLES:
        op.execute(f'ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY')


def downgrade() -> None:
    for table in TABLES:
        op.execute(f'ALTER TABLE "{table}" DISABLE ROW LEVEL SECURITY')
