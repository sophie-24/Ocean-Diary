import os
from dataclasses import dataclass
from pathlib import Path
from uuid import UUID

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[3] / ".env")

EXTERNAL_AI_DISCLOSURE_VERSION = "v1"


@dataclass(frozen=True)
class Settings:
    database_connect_timeout_seconds: int = int(
        os.getenv("DATABASE_CONNECT_TIMEOUT_SECONDS", "5")
    )
    app_env: str = os.getenv("APP_ENV", "development")
    dev_auth_enabled: bool = os.getenv("DEV_AUTH_ENABLED", "true").lower() == "true"
    dev_auth_token: str = os.getenv("DEV_AUTH_TOKEN", "local-only-change-me")
    dev_auth_user_id: UUID = UUID(
        os.getenv("DEV_AUTH_USER_ID", "11111111-1111-4111-8111-111111111111")
    )
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_jwks_timeout_seconds: int = int(os.getenv("SUPABASE_JWKS_TIMEOUT_SECONDS", "5"))
    supabase_access_token_max_age_seconds: int = int(
        os.getenv("SUPABASE_ACCESS_TOKEN_MAX_AGE_SECONDS", "86400")
    )
    s3_endpoint_url: str = os.getenv("S3_ENDPOINT_URL", "http://127.0.0.1:9000")
    s3_public_endpoint_url: str = os.getenv(
        "S3_PUBLIC_ENDPOINT_URL", "http://127.0.0.1:9000"
    )
    s3_region: str = os.getenv("S3_REGION", "us-east-1")
    s3_bucket_name: str = os.getenv("S3_BUCKET_NAME", "ocean-diary-media")
    s3_access_key_id: str = os.getenv("S3_ACCESS_KEY_ID", "minioadmin")
    s3_secret_access_key: str = os.getenv("S3_SECRET_ACCESS_KEY", "minioadmin")
    upload_intent_ttl_seconds: int = int(os.getenv("UPLOAD_INTENT_TTL_SECONDS", "600"))
    deleted_observation_retention_days: int = int(
        os.getenv("DELETED_OBSERVATION_RETENTION_DAYS", "30")
    )
    identification_provider: str = os.getenv("IDENTIFICATION_PROVIDER", "mock")
    max_identification_jobs_per_user_per_day: int = int(
        os.getenv("MAX_IDENTIFICATION_JOBS_PER_USER_PER_DAY", "20")
    )
    ai_provider_failure_threshold: int = int(os.getenv("AI_PROVIDER_FAILURE_THRESHOLD", "3"))
    ai_provider_circuit_window_seconds: int = int(
        os.getenv("AI_PROVIDER_CIRCUIT_WINDOW_SECONDS", "300")
    )
    ai_provider_timeout_seconds: int = int(os.getenv("AI_PROVIDER_TIMEOUT_SECONDS", "45"))
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-6-luna")


settings = Settings()

if settings.database_connect_timeout_seconds <= 0:
    raise RuntimeError("DATABASE_CONNECT_TIMEOUT_SECONDS must be greater than zero")
if settings.supabase_jwks_timeout_seconds <= 0:
    raise RuntimeError("SUPABASE_JWKS_TIMEOUT_SECONDS must be greater than zero")
if settings.supabase_access_token_max_age_seconds <= 0:
    raise RuntimeError("SUPABASE_ACCESS_TOKEN_MAX_AGE_SECONDS must be greater than zero")
if settings.upload_intent_ttl_seconds <= 0:
    raise RuntimeError("UPLOAD_INTENT_TTL_SECONDS must be greater than zero")
if settings.max_identification_jobs_per_user_per_day <= 0:
    raise RuntimeError("MAX_IDENTIFICATION_JOBS_PER_USER_PER_DAY must be greater than zero")
if settings.deleted_observation_retention_days <= 0:
    raise RuntimeError("DELETED_OBSERVATION_RETENTION_DAYS must be greater than zero")
if (
    settings.ai_provider_failure_threshold <= 0
    or settings.ai_provider_circuit_window_seconds <= 0
    or settings.ai_provider_timeout_seconds <= 0
):
    raise RuntimeError("AI provider timeout and circuit settings must be greater than zero")

if settings.app_env != "development" and settings.dev_auth_enabled:
    raise RuntimeError("DEV_AUTH_ENABLED must be false outside development")
if settings.app_env != "development":
    if (
        settings.s3_access_key_id.lower() == "minioadmin"
        or settings.s3_secret_access_key.lower() == "minioadmin"
    ):
        raise RuntimeError("Development-only MinIO credentials must not be used outside development")
    missing = [
        name
        for name, value in (
            ("SUPABASE_URL", settings.supabase_url),
            ("SUPABASE_SERVICE_ROLE_KEY", settings.supabase_service_role_key),
            ("S3_ENDPOINT_URL", os.getenv("S3_ENDPOINT_URL")),
            ("S3_PUBLIC_ENDPOINT_URL", os.getenv("S3_PUBLIC_ENDPOINT_URL")),
            ("S3_ACCESS_KEY_ID", os.getenv("S3_ACCESS_KEY_ID")),
            ("S3_SECRET_ACCESS_KEY", os.getenv("S3_SECRET_ACCESS_KEY")),
        )
        if not value
    ]
    if missing:
        raise RuntimeError(f"Missing required production settings: {', '.join(missing)}")


