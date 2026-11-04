import base64
import binascii
import json
import os
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, select, tuple_
from sqlalchemy.orm import Session, joinedload

from app.database import get_session
from app.models import Species
from app.schemas import SpeciesListResponse, SpeciesResponse

router = APIRouter(prefix="/v1/species", tags=["species"])
MEDIA_PUBLIC_BASE_URL = os.environ.get("MEDIA_PUBLIC_BASE_URL", "").rstrip("/")


def species_response(species: Species) -> SpeciesResponse:
    artwork = None
    if species.artwork and MEDIA_PUBLIC_BASE_URL:
        artwork = {
            "url": f"{MEDIA_PUBLIC_BASE_URL}/{species.artwork.asset_key.lstrip('/')}",
            "thumbnail_url": (
                f"{MEDIA_PUBLIC_BASE_URL}/{species.artwork.thumbnail_key.lstrip('/')}"
                if species.artwork.thumbnail_key
                else None
            ),
            "style_name": species.artwork.style_name,
        }
    return SpeciesResponse(
        id=species.id,
        slug=species.slug,
        common_name_ko=species.common_name_ko,
        scientific_name=species.scientific_name,
        description_ko=species.description_ko,
        artwork=artwork,
    )


def encode_cursor(common_name_ko: str, species_id: UUID) -> str:
    payload = json.dumps([common_name_ko, str(species_id)], ensure_ascii=False).encode("utf-8")
    return base64.urlsafe_b64encode(payload).decode("ascii").rstrip("=")


def decode_cursor(cursor: str) -> tuple[str, UUID]:
    try:
        padded_cursor = cursor + "=" * (-len(cursor) % 4)
        common_name, species_id = json.loads(base64.urlsafe_b64decode(padded_cursor))
        return str(common_name), UUID(species_id)
    except (ValueError, TypeError, KeyError, binascii.Error) as exc:
        raise HTTPException(status_code=400, detail={"code": "INVALID_CURSOR"}) from exc


@router.get("", response_model=SpeciesListResponse)
def list_species(
    query: str | None = Query(default=None, max_length=100),
    limit: int = Query(default=20, ge=1, le=50),
    cursor: str | None = None,
    session: Session = Depends(get_session),
) -> SpeciesListResponse:
    statement = select(Species).options(joinedload(Species.artwork)).where(Species.is_active.is_(True))
    if query and query.strip():
        search = f"%{query.strip()}%"
        statement = statement.where(
            or_(Species.common_name_ko.ilike(search), Species.scientific_name.ilike(search))
        )
    if cursor:
        last_name, last_id = decode_cursor(cursor)
        statement = statement.where(tuple_(Species.common_name_ko, Species.id) > (last_name, last_id))

    statement = statement.order_by(Species.common_name_ko, Species.id).limit(limit + 1)
    rows = list(session.scalars(statement).unique())
    has_more = len(rows) > limit
    rows = rows[:limit]
    next_cursor = encode_cursor(rows[-1].common_name_ko, rows[-1].id) if has_more and rows else None
    return SpeciesListResponse(items=[species_response(row) for row in rows], next_cursor=next_cursor)


@router.get("/{species_id}", response_model=SpeciesResponse)
def get_species(species_id: UUID, session: Session = Depends(get_session)) -> SpeciesResponse:
    species = session.scalar(
        select(Species)
        .options(joinedload(Species.artwork))
        .where(Species.id == species_id, Species.is_active.is_(True))
    )
    if species is None:
        raise HTTPException(status_code=404, detail={"code": "SPECIES_NOT_FOUND"})
    return species_response(species)
