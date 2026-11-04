from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ArtworkResponse(BaseModel):
    url: str
    thumbnail_url: str | None
    style_name: str


class SpeciesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    common_name_ko: str
    scientific_name: str
    description_ko: str
    artwork: ArtworkResponse | None = None
    catalog_no: str | None = None
    group_ko: str | None = None
    subgroup_ko: str | None = None
    common_name_en: str | None = None
    art_key: str | None = None


class SpeciesListResponse(BaseModel):
    items: list[SpeciesResponse]
    next_cursor: str | None
