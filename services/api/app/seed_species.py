import json
from pathlib import Path
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import insert

from app.database import SessionLocal
from app.models import Species

CATALOG_PATH = Path(__file__).resolve().parents[3] / "data" / "species" / "catalog.json"


def main() -> None:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    with SessionLocal.begin() as session:
        for item in catalog["species"]:
            statement = insert(Species).values(
                id=UUID(item["id"]),
                slug=item["slug"],
                common_name_ko=item["common_name_ko"],
                scientific_name=item["scientific_name"],
                description_ko=item["description_ko"],
                is_active=True,
            )
            session.execute(
                statement.on_conflict_do_update(
                    index_elements=[Species.slug],
                    set_={
                        "common_name_ko": statement.excluded.common_name_ko,
                        "scientific_name": statement.excluded.scientific_name,
                        "description_ko": statement.excluded.description_ko,
                        "is_active": True,
                        "updated_at": sa.func.now(),
                    },
                )
            )
    print(f"Seeded {len(catalog['species'])} species from {CATALOG_PATH}")


if __name__ == "__main__":
    main()
