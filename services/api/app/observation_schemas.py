from datetime import datetime, timezone
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.schemas import SpeciesResponse

IdentifiedBy = Literal["ai_confirmed", "user_selected", "unidentified"]


def normalize_observed_at_utc(value: datetime) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("observed_at must include a timezone")
    return value.astimezone(timezone.utc)


class ObservationCreateRequest(BaseModel):
    media_id: UUID
    species_id: UUID | None = None
    identification_job_id: UUID | None = None
    identified_by: IdentifiedBy
    observed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    region_label: str | None = Field(default=None, max_length=100)

    @field_validator("observed_at")
    @classmethod
    def make_observed_at_utc(cls, value: datetime) -> datetime:
        return normalize_observed_at_utc(value)

    @model_validator(mode="after")
    def check_species_selection(self):
        if self.identified_by == "unidentified" and self.species_id is not None:
            raise ValueError("unidentified observations must not have a species")
        if self.identified_by != "unidentified" and self.species_id is None:
            raise ValueError("a species is required for a confirmed selection")
        if self.identified_by == "ai_confirmed" and self.identification_job_id is None:
            raise ValueError("AI confirmation must reference its identification job")
        return self


class ObservationPatchRequest(BaseModel):
    species_id: UUID | None = None
    identified_by: IdentifiedBy | None = None
    region_label: str | None = Field(default=None, max_length=100)
    observed_at: datetime | None = None

    @model_validator(mode="after")
    def check_species_selection(self):
        fields = self.model_fields_set
        if "species_id" in fields and self.species_id is None:
            if "identified_by" not in fields or self.identified_by != "unidentified":
                raise ValueError("clearing a species requires identified_by=unidentified")
        if "identified_by" in fields and self.identified_by == "unidentified":
            if "species_id" not in fields or self.species_id is not None:
                raise ValueError("unidentified selection requires species_id=null")
        return self

    @field_validator("observed_at")
    @classmethod
    def make_observed_at_utc(cls, value: datetime | None) -> datetime | None:
        if value is None:
            return value
        return normalize_observed_at_utc(value)


class ObservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    species_id: UUID | None
    media_id: UUID
    identification_job_id: UUID | None
    identified_by: IdentifiedBy
    observed_at: datetime
    region_label: str | None
    created_at: datetime
    photo_url: str
    species: SpeciesResponse | None


class ObservationListResponse(BaseModel):
    items: list[ObservationResponse]
    next_cursor: str | None


class ObservationCreateResponse(BaseModel):
    observation: ObservationResponse
    species_summary: dict[str, int | bool] | None


class CollectionSpeciesResponse(BaseModel):
    species: SpeciesResponse
    discovery_count: int
    first_seen_at: datetime
    latest_seen_at: datetime


class CollectionResponse(BaseModel):
    items: list[CollectionSpeciesResponse]
    unidentified_count: int
    total_species: int
