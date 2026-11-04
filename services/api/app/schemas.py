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


class SpeciesListResponse(BaseModel):
    items: list[SpeciesResponse]
    next_cursor: str | None
