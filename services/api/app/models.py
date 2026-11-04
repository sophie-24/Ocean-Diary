from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Species(Base):
    __tablename__ = "species"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    common_name_ko: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    scientific_name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description_ko: Mapped[str] = mapped_column(Text, nullable=False)
    taxonomy_json: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    artwork: Mapped["SpeciesArtwork | None"] = relationship(
        back_populates="species", uselist=False, cascade="all, delete-orphan"
    )


class SpeciesArtwork(Base):
    __tablename__ = "species_artworks"

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    species_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("species.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    asset_key: Mapped[str] = mapped_column(String(500), nullable=False)
    thumbnail_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    style_name: Mapped[str] = mapped_column(String(50), nullable=False, default="storybook")
    license_source: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    species: Mapped[Species] = relationship(back_populates="artwork")


class MediaAsset(Base):
    __tablename__ = "media_assets"
    __table_args__ = (
        CheckConstraint("byte_size > 0 AND byte_size <= 15728640", name="ck_media_assets_size"),
        CheckConstraint(
            "upload_byte_size IS NULL OR upload_byte_size BETWEEN 1 AND 15728640",
            name="ck_media_assets_upload_size",
        ),
        CheckConstraint(
            "mime_type IN ('image/jpeg', 'image/png')", name="ck_media_assets_mime_type"
        ),
        CheckConstraint(
            "status IN ('pending_upload', 'processing', 'ready', 'rejected', 'deleted')",
            name="ck_media_assets_status",
        ),
        CheckConstraint(
            "(external_ai_consent_provider IS NULL AND external_ai_consent_at IS NULL AND "
            "external_ai_consent_version IS NULL) OR "
            "(external_ai_consent_provider IS NOT NULL AND external_ai_consent_at IS NOT NULL AND "
            "external_ai_consent_version IS NOT NULL)",
            name="ck_media_assets_ai_consent_complete",
        ),
        UniqueConstraint(
            "owner_user_id", "upload_intent_key", name="uq_media_assets_owner_upload_intent_key"
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    owner_user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False, index=True)
    storage_key: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    upload_storage_key: Mapped[str | None] = mapped_column(String(500), unique=True, nullable=True)
    upload_intent_key: Mapped[str | None] = mapped_column(String(128), nullable=True)
    mime_type: Mapped[str] = mapped_column(String(50), nullable=False)
    byte_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    upload_byte_size: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    upload_sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)
    width: Mapped[int | None] = mapped_column(nullable=True)
    height: Mapped[int | None] = mapped_column(nullable=True)
    sha256: Mapped[str | None] = mapped_column(String(64), nullable=True)
    external_ai_consent_provider: Mapped[str | None] = mapped_column(String(80), nullable=True)
    external_ai_consent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    external_ai_consent_version: Mapped[str | None] = mapped_column(String(30), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending_upload")
    captured_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    storage_deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class IdentificationJob(Base):
    __tablename__ = "identification_jobs"
    __table_args__ = (
        CheckConstraint(
            "status IN ('queued', 'running', 'succeeded', 'failed')",
            name="ck_identification_jobs_status",
        ),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False, index=True)
    media_asset_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("media_assets.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="queued", index=True)
    provider: Mapped[str | None] = mapped_column(String(80), nullable=True)
    model_version: Mapped[str | None] = mapped_column(String(120), nullable=True)
    error_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    idempotency_key: Mapped[str | None] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    candidates: Mapped[list["IdentificationCandidate"]] = relationship(
        back_populates="job", cascade="all, delete-orphan", order_by="IdentificationCandidate.rank"
    )


class IdentificationCandidate(Base):
    __tablename__ = "identification_candidates"
    __table_args__ = (
        CheckConstraint("rank BETWEEN 1 AND 3", name="ck_identification_candidates_rank"),
        CheckConstraint(
            "confidence_band IN ('high', 'medium', 'low')",
            name="ck_identification_candidates_confidence",
        ),
        UniqueConstraint("job_id", "rank", name="uq_identification_candidates_job_rank"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    job_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("identification_jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    species_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("species.id", ondelete="SET NULL"), nullable=True
    )
    rank: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence_band: Mapped[str] = mapped_column(String(20), nullable=False)
    label_raw: Mapped[str | None] = mapped_column(String(200), nullable=True)
    job: Mapped[IdentificationJob] = relationship(back_populates="candidates")
    species: Mapped[Species | None] = relationship()


class Observation(Base):
    __tablename__ = "observations"
    __table_args__ = (
        CheckConstraint(
            "identified_by IN ('ai_confirmed', 'user_selected', 'unidentified')",
            name="ck_observations_identified_by",
        ),
        CheckConstraint(
            "(identified_by = 'unidentified' AND species_id IS NULL) OR "
            "(identified_by IN ('ai_confirmed', 'user_selected') AND species_id IS NOT NULL)",
            name="ck_observations_species_selection",
        ),
        UniqueConstraint("user_id", "idempotency_key", name="uq_observations_idempotency"),
    )

    id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), nullable=False, index=True)
    species_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("species.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    media_asset_id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("media_assets.id", ondelete="RESTRICT"), nullable=False
    )
    identification_job_id: Mapped[UUID | None] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("identification_jobs.id", ondelete="SET NULL"), nullable=True
    )
    identified_by: Mapped[str] = mapped_column(String(30), nullable=False)
    region_label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    idempotency_key: Mapped[str] = mapped_column(String(128), nullable=False)
    species: Mapped[Species | None] = relationship()
    media_asset: Mapped[MediaAsset] = relationship()


class ApiRateLimitEvent(Base):
    __tablename__ = "api_rate_limit_events"
    __table_args__ = (Index("ix_api_rate_limit_bucket_occurred", "bucket_key", "occurred_at"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    bucket_key: Mapped[str] = mapped_column(String(64), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), index=True
    )


class AiProviderFailureEvent(Base):
    __tablename__ = "ai_provider_failure_events"
    __table_args__ = (Index("ix_ai_provider_failure_provider_occurred", "provider", "occurred_at"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    provider: Mapped[str] = mapped_column(String(80), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )


class AccountDeletionTombstone(Base):
    """Block still-valid access tokens after user data and auth deletion."""

    __tablename__ = "account_deletion_tombstones"
    __table_args__ = (
        CheckConstraint(
            "(status = 'pending' AND completed_at IS NULL AND block_expires_at IS NULL) OR "
            "(status = 'complete' AND completed_at IS NOT NULL AND block_expires_at IS NOT NULL)",
            name="ck_account_deletion_tombstone_state",
        ),
        Index("ix_account_deletion_tombstones_expiry", "block_expires_at"),
    )

    user_id: Mapped[UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    block_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
