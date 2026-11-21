import json
from datetime import date, datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator

LogKind = Literal["scuba", "free", "snorkel"]

DIARY_MAX_CHARS = 500
DETAILS_MAX_BYTES = 8_000
LAYOUT_MAX_ITEMS = 60
DETAILS_MAX_DEPTH = 6

# Product decision (docs/plan-v2.md): locations are stored by name only. Reject anything that looks
# like coordinates so a client bug can never persist precise GPS positions in free-form details.
FORBIDDEN_DETAIL_KEYS = {"lat", "lng", "lon", "latitude", "longitude", "gps", "coords", "coordinates", "location"}


def _check_details(value: dict[str, Any]) -> dict[str, Any]:
    def walk(node: Any, depth: int = 1) -> None:
        # Cap nesting so a hostile payload cannot exhaust the recursion limit (500 instead of 422).
        if depth > DETAILS_MAX_DEPTH:
            raise ValueError("details is nested too deeply")
        if isinstance(node, dict):
            for key, child in node.items():
                if str(key).lower() in FORBIDDEN_DETAIL_KEYS:
                    raise ValueError(f"details must not contain location coordinates ({key})")
                walk(child, depth + 1)
        elif isinstance(node, list):
            for child in node:
                walk(child, depth + 1)

    walk(value)
    if len(json.dumps(value, ensure_ascii=False).encode("utf-8")) > DETAILS_MAX_BYTES:
        raise ValueError("details is too large")
    return value


class StickerItem(BaseModel):
    id: str = Field(min_length=1, max_length=40)
    type: Literal["sticker", "critter"]
    kind: str = Field(min_length=1, max_length=40, pattern=r"^[a-z0-9_]+$")
    x: float = Field(ge=-400, le=800)
    y: float = Field(ge=-400, le=800)
    scale: float = Field(ge=0.2, le=4)
    rot: float = Field(ge=-720, le=720)
    flip: bool | None = None


def _clean_label(value: str) -> str:
    cleaned = " ".join(value.split())
    if not cleaned:
        raise ValueError("must not be blank")
    return cleaned


class DiveLogCreateRequest(BaseModel):
    kind: LogKind
    dive_date: date
    region_label: str = Field(max_length=100)
    point_label: str = Field(max_length=100)
    title: str | None = Field(default=None, max_length=60)
    details: dict[str, Any] = Field(default_factory=dict)
    site_id: UUID | None = None
    is_draft: bool = False

    @field_validator("region_label", "point_label")
    @classmethod
    def clean_labels(cls, v: str) -> str:
        return _clean_label(v)

    @field_validator("details")
    @classmethod
    def check_details(cls, v: dict[str, Any]) -> dict[str, Any]:
        return _check_details(v)


class DiveLogPatchRequest(BaseModel):
    dive_date: date | None = None
    region_label: str | None = Field(default=None, max_length=100)
    point_label: str | None = Field(default=None, max_length=100)
    title: str | None = Field(default=None, max_length=60)
    details: dict[str, Any] | None = None
    diary_text: str | None = None
    sticker_layout: list[StickerItem] | None = Field(default=None, max_length=LAYOUT_MAX_ITEMS)
    site_id: UUID | None = None
    is_draft: bool | None = None

    @field_validator("region_label", "point_label")
    @classmethod
    def clean_labels(cls, v: str | None) -> str | None:
        return None if v is None else _clean_label(v)

    @field_validator("details")
    @classmethod
    def check_details(cls, v: dict[str, Any] | None) -> dict[str, Any] | None:
        return None if v is None else _check_details(v)

    @field_validator("diary_text")
    @classmethod
    def check_diary(cls, v: str | None) -> str | None:
        # Count user-perceived characters the way the app does (Array.from in JS ≈ code points).
        if v is not None and len(v) > DIARY_MAX_CHARS:
            raise ValueError(f"diary_text must be {DIARY_MAX_CHARS} characters or fewer")
        return v

    @model_validator(mode="after")
    def required_fields_not_cleared(self):
        for name in ("dive_date", "region_label", "point_label"):
            if name in self.model_fields_set and getattr(self, name) is None:
                raise ValueError(f"{name} is required and cannot be cleared")
        return self


class DiveSiteResponse(BaseModel):
    id: UUID
    catalog_no: str
    category_ko: str
    name_ko: str
    name_en: str
    country_ko: str
    region_ko: str
    note_ko: str
    depth_label: str | None
    level_label: str | None
    art_key: str


class LoggedSpecies(BaseModel):
    species_id: UUID
    catalog_no: str | None
    common_name_ko: str
    art_key: str | None


class DiveLogResponse(BaseModel):
    id: UUID
    kind: LogKind
    seq: int
    label: str
    dive_date: date
    region_label: str
    point_label: str
    title: str | None
    details: dict[str, Any]
    diary_text: str | None
    sticker_layout: list[StickerItem] | None
    is_draft: bool
    site: DiveSiteResponse | None
    species: list[LoggedSpecies]
    created_at: datetime
    updated_at: datetime


class DiveLogListResponse(BaseModel):
    items: list[DiveLogResponse]
    next_cursor: str | None
    counts: dict[LogKind, int]


class SiteStampResponse(BaseModel):
    site: DiveSiteResponse
    stamped_on: date
    dive_log_id: UUID | None


class PlaceResponse(BaseModel):
    region_label: str
    first_date: date
    last_date: date
    log_count: int
    point_labels: list[str]
    species: list[LoggedSpecies]
    stamp_count: int


class SummaryResponse(BaseModel):
    collected_species: int
    total_species: int
    encounter_count: int
    log_counts: dict[LogKind, int]
    stamp_count: int
    total_sites: int
    visited_regions: int
