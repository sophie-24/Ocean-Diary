from uuid import UUID

from pydantic import BaseModel

from app.schemas import SpeciesResponse


class IdentificationCandidateResponse(BaseModel):
    rank: int
    confidence_band: str
    species: SpeciesResponse


class IdentificationJobResponse(BaseModel):
    job_id: UUID
    status: str
    candidates: list[IdentificationCandidateResponse]
    fallback_available: bool = True
    error_code: str | None = None


class IdentificationJobCreateRequest(BaseModel):
    media_id: UUID
