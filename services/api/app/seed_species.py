"""Seed the species catalog (v1 coastal set + v2 field guide) and the 명소 (dive site) catalog.

Idempotent: re-running updates names/groups and never deletes rows that observations reference.
"""

import json
import re
from pathlib import Path
from uuid import UUID, uuid5

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert

from app.database import SessionLocal
from app.models import DiveSite, Species

DATA_DIR = Path(__file__).resolve().parents[3] / "data"
CATALOG_V1_PATH = DATA_DIR / "species" / "catalog.json"
CATALOG_V3_PATH = DATA_DIR / "species" / "species-v3.json"
SITES_PATH = DATA_DIR / "sites" / "sites-v1.json"

# Stable ids: the same catalog number always maps to the same UUID in every environment.
NAMESPACE = UUID("6f1e2c1a-3b0e-5d43-9a0c-0ce4d1a2b9e1")


def species_id_for(catalog_no: str) -> UUID:
    return uuid5(NAMESPACE, f"ocean-diary/species/{catalog_no}")


def site_id_for(catalog_no: str) -> UUID:
    return uuid5(NAMESPACE, f"ocean-diary/site/{catalog_no}")


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60] or "species"


def seed_v1(session) -> int:
    catalog = json.loads(CATALOG_V1_PATH.read_text(encoding="utf-8"))
    for item in catalog["species"]:
        statement = insert(Species).values(
            id=UUID(item["id"]),
            slug=item["slug"],
            common_name_ko=item["common_name_ko"],
            scientific_name=item["scientific_name"],
            description_ko=item["description_ko"],
            group_ko=item.get("category_ko"),
            is_active=True,
        )
        session.execute(
            statement.on_conflict_do_update(
                index_elements=[Species.slug],
                set_={
                    "common_name_ko": statement.excluded.common_name_ko,
                    "scientific_name": statement.excluded.scientific_name,
                    "description_ko": statement.excluded.description_ko,
                    "group_ko": statement.excluded.group_ko,
                    "is_active": True,
                    "updated_at": sa.func.now(),
                },
            )
        )
    return len(catalog["species"])


def seed_v3(session) -> int:
    catalog = json.loads(CATALOG_V3_PATH.read_text(encoding="utf-8"))
    for item in catalog["species"]:
        no = item["no"]
        statement = insert(Species).values(
            id=species_id_for(no),
            slug=f"v3-{no}-{_slug(item['name_en'])}",
            common_name_ko=item["name_ko"],
            scientific_name=item.get("sci_name") or "",
            description_ko=item.get("note") or "",
            catalog_no=no,
            group_ko=item["group"],
            subgroup_ko=item.get("subgroup"),
            common_name_en=item["name_en"],
            art_key=item["art_key"] if item.get("art") == "Y" else None,
            is_active=True,
        )
        session.execute(
            statement.on_conflict_do_update(
                # Ids are derived from the catalog number, so the id is the stable conflict target.
                index_elements=[Species.id],
                set_={
                    "catalog_no": statement.excluded.catalog_no,
                    "slug": statement.excluded.slug,
                    "common_name_ko": statement.excluded.common_name_ko,
                    "scientific_name": statement.excluded.scientific_name,
                    "group_ko": statement.excluded.group_ko,
                    "subgroup_ko": statement.excluded.subgroup_ko,
                    "common_name_en": statement.excluded.common_name_en,
                    "art_key": statement.excluded.art_key,
                    "is_active": True,
                    "updated_at": sa.func.now(),
                },
            )
        )
    return len(catalog["species"])


def seed_sites(session) -> int:
    data = json.loads(SITES_PATH.read_text(encoding="utf-8"))
    for item in data["sites"]:
        statement = insert(DiveSite).values(
            id=site_id_for(item["no"]),
            catalog_no=item["no"],
            category_ko=item["category"],
            name_ko=item["name_ko"],
            name_en=item["name_en"],
            country_ko=item["country"],
            region_ko=item["region"],
            note_ko=item.get("note") or "",
            depth_label=item.get("depth_m") or None,
            level_label=item.get("level") or None,
            art_key=item["art_key"],
            is_active=True,
        )
        session.execute(
            statement.on_conflict_do_update(
                index_elements=[DiveSite.id],
                set_={
                    k: getattr(statement.excluded, k)
                    for k in ("catalog_no", "category_ko", "name_ko", "name_en", "country_ko", "region_ko", "note_ko", "depth_label", "level_label", "art_key")
                },
            )
        )
    return len(data["sites"])


def main() -> None:
    with SessionLocal.begin() as session:
        v1 = seed_v1(session)
        v3 = seed_v3(session)
        sites = seed_sites(session)
    print(f"Seeded species: {v1} (v1) + {v3} (v3 field guide); dive sites: {sites}")


if __name__ == "__main__":
    main()
