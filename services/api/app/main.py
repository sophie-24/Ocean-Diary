import hashlib
import logging
import math
import threading
import time
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from sqlalchemy import delete, func, select, text
from sqlalchemy.exc import SQLAlchemyError
from starlette.concurrency import run_in_threadpool
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.account import router as account_router
from app.auth import _resolve_current_user_id
from app.database import SessionLocal
from app.media import router as media_router
from app.identification import router as identification_router
from app.models import ApiRateLimitEvent
from app.observations import router as observations_router
from app.species import router as species_router
from app.settings import EXTERNAL_AI_DISCLOSURE_VERSION, settings
from app.storage import storage_client

app = FastAPI(title="OCEAN DIARY API", version="0.1.0")
if settings.app_env == "development":
    # Expo Web runs on a loopback origin while the API listens on another port.
    # Keep this development-only and limited to Expo's local web ports.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[],
        allow_origin_regex=r"^http://(?:localhost|127\.0\.0\.1|\[::1\]):(?:808[0-9]|19006)$",
        allow_credentials=False,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
        expose_headers=["Retry-After", "X-Request-ID"],
    )
app.include_router(account_router)
app.include_router(species_router)
app.include_router(media_router)
app.include_router(identification_router)
app.include_router(observations_router)
logger = logging.getLogger("ocean_diary.api")
REQUIRED_DB_SCHEMA_REVISION = "0012_retire_legacy_upload_intents"
RATE_LIMIT_RULES = {
    ("POST", "/v1/media/upload-intents"): (20, 600),
    ("POST", "/v1/identification-jobs"): (10, 600),
    ("POST", "/v1/observations"): (60, 3600),
    ("DELETE", "/v1/account"): (5, 3600),
}
MEDIA_RATE_LIMIT_RULES = {
    ("POST", "complete"): (30, 600),
    ("DELETE", ""): (30, 600),
}
_rate_limit_cleanup_lock = threading.Lock()
_last_rate_limit_cleanup = 0.0


def _cleanup_rate_limit_events(now_monotonic: float) -> bool:
    global _last_rate_limit_cleanup
    with _rate_limit_cleanup_lock:
        if now_monotonic - _last_rate_limit_cleanup <= 900:
            return False
        _last_rate_limit_cleanup = now_monotonic
        return True


def _consume_rate_limit_sync(
    method: str,
    path: str,
    authorization: str,
    client_host: str,
    limit: int,
    window_seconds: int,
) -> tuple[int, int, int, UUID | None, tuple[int, object, dict[str, str] | None] | None]:
    auth_resolution_error = None
    if authorization:
        verified_user_id = None
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() == "bearer" and token:
            try:
                verified_user_id = _resolve_current_user_id(
                    HTTPAuthorizationCredentials(scheme=scheme, credentials=token)
                )
            except StarletteHTTPException as exc:
                # Invalid credentials are rejected by the route dependency; use
                # the client IP here so arbitrary invalid tokens cannot create buckets.
                auth_resolution_error = (exc.status_code, exc.detail, exc.headers)
        principal = f"user:{verified_user_id}" if verified_user_id else f"ip:{client_host}"
    else:
        verified_user_id = None
        principal = f"ip:{client_host}"
    bucket_key = hashlib.sha256(f"{method}:{path}:{principal}".encode("utf-8")).hexdigest()
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=window_seconds)
    should_cleanup = _cleanup_rate_limit_events(time.monotonic())

    with SessionLocal() as session:
        # Serialize updates across API processes without storing bearer tokens.
        session.execute(
            text("SELECT pg_advisory_xact_lock(hashtextextended(:bucket_key, 0))"),
            {"bucket_key": bucket_key},
        )
        session.execute(
            delete(ApiRateLimitEvent).where(
                ApiRateLimitEvent.bucket_key == bucket_key,
                ApiRateLimitEvent.occurred_at <= cutoff,
            )
        )
        event_count, oldest_event = session.execute(
            select(func.count(ApiRateLimitEvent.id), func.min(ApiRateLimitEvent.occurred_at)).where(
                ApiRateLimitEvent.bucket_key == bucket_key
            )
        ).one()

        if event_count >= limit and oldest_event is not None:
            retry_after = max(
                1,
                math.ceil((oldest_event + timedelta(seconds=window_seconds) - now).total_seconds()),
            )
            session.commit()
            remaining = 0
        else:
            session.add(ApiRateLimitEvent(bucket_key=bucket_key, occurred_at=now))
            session.commit()
            remaining = max(0, limit - event_count - 1)
            retry_after = 0

    if should_cleanup:
        try:
            with SessionLocal() as cleanup_session:
                cleanup_session.execute(
                    delete(ApiRateLimitEvent).where(
                        ApiRateLimitEvent.occurred_at < now - timedelta(days=1)
                    )
                )
                cleanup_session.commit()
        except SQLAlchemyError as exc:
            # Cleanup is maintenance; a failure must not reject a request whose
            # rate-limit decision was already stored successfully.
            logger.warning("rate-limit event cleanup failed error_type=%s", type(exc).__name__)
    return limit, remaining, retry_after, verified_user_id, auth_resolution_error


def _rate_limit_policy(method: str, path: str) -> tuple[str, tuple[int, int] | None]:
    exact_rule = RATE_LIMIT_RULES.get((method, path))
    if exact_rule is not None:
        return path, exact_rule
    parts = path.strip("/").split("/")
    if parts[:2] == ["v1", "media"]:
        if len(parts) == 3 and method == "DELETE":
            rule = MEDIA_RATE_LIMIT_RULES.get((method, ""))
            if rule is not None:
                return "/v1/media/{media_id}", rule
        if len(parts) == 4 and method == "POST" and parts[3] == "complete":
            rule = MEDIA_RATE_LIMIT_RULES.get((method, parts[3]))
            if rule is not None:
                return "/v1/media/{media_id}/complete", rule
    return path, None


@app.middleware("http")
async def ensure_json_utf8_charset(request, call_next):
    request.state.request_id = str(uuid4())
    bucket_path, rule = _rate_limit_policy(request.method, request.url.path)
    rate_limit = None
    if rule is not None:
        limit, window_seconds = rule
        client_host = request.client.host if request.client else "unknown"
        try:
            rate_limit = await run_in_threadpool(
                _consume_rate_limit_sync,
                request.method,
                bucket_path,
                request.headers.get("authorization", ""),
                client_host,
                limit,
                window_seconds,
            )
        except SQLAlchemyError:
            logger.error("rate-limit store unavailable route=%s", bucket_path)
            return _error_response(request, 503, "RATE_LIMIT_UNAVAILABLE")
        request.state.verified_auth_user_id = rate_limit[3]
        request.state.auth_resolution_error = rate_limit[4]
        if rate_limit[2] > 0:
            return _error_response(
                request,
                429,
                "RATE_LIMITED",
                {
                    "Retry-After": str(rate_limit[2]),
                    "X-RateLimit-Limit": str(rate_limit[0]),
                    "X-RateLimit-Remaining": "0",
                },
            )
    response = await call_next(request)
    response.headers["X-Request-ID"] = request.state.request_id
    if rate_limit is not None:
        response.headers["X-RateLimit-Limit"] = str(rate_limit[0])
        response.headers["X-RateLimit-Remaining"] = str(rate_limit[1])
    content_type = response.headers.get("content-type", "")
    if content_type.partition(";")[0].strip().lower() == "application/json":
        response.headers["content-type"] = "application/json; charset=utf-8"
    return response


def _error_response(
    request: Request,
    status_code: int,
    code: str,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid4()))
    response_headers = dict(headers or {})
    response_headers["X-Request-ID"] = request_id
    response_headers.setdefault("Content-Type", "application/json; charset=utf-8")
    message = (
        "요청이 많아요. 잠시 후 다시 시도해 주세요."
        if code == "RATE_LIMITED"
        else "요청을 처리하지 못했어요."
    )
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "request_id": request_id,
            }
        },
        headers=response_headers,
    )


@app.exception_handler(StarletteHTTPException)
async def safe_http_exception(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    detail = exc.detail
    code = detail.get("code") if isinstance(detail, dict) else None
    if not isinstance(code, str):
        code = {
            401: "AUTH_REQUIRED",
            403: "ACCESS_DENIED",
            404: "RESOURCE_NOT_FOUND",
            405: "METHOD_NOT_ALLOWED",
        }.get(exc.status_code, "REQUEST_FAILED")
    return _error_response(request, exc.status_code, code, exc.headers)


@app.exception_handler(RequestValidationError)
async def safe_validation_exception(request: Request, exc: RequestValidationError) -> JSONResponse:
    return _error_response(request, 422, "INVALID_REQUEST")


@app.exception_handler(Exception)
async def safe_unhandled_exception(request: Request, exc: Exception) -> JSONResponse:
    route = request.scope.get("route")
    route_path = getattr(route, "path", "unknown")
    logger.error(
        "unhandled API error request_id=%s route=%s error_type=%s",
        getattr(request.state, "request_id", "unknown"),
        route_path,
        type(exc).__name__,
    )
    return _error_response(request, 500, "INTERNAL_ERROR")


@app.get("/v1/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "ocean-diary-api"}


@app.get("/v1/ready", response_model=None)
def readiness() -> JSONResponse | dict[str, str]:
    try:
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
            current_revision = session.execute(
                text("SELECT version_num FROM alembic_version")
            ).scalar_one_or_none()
    except SQLAlchemyError:
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "dependency": "database"},
        )

    if current_revision != REQUIRED_DB_SCHEMA_REVISION:
        return JSONResponse(
            status_code=503,
            content={
                "status": "not_ready",
                "dependency": "database_schema",
                "expected_revision": REQUIRED_DB_SCHEMA_REVISION,
                "current_revision": current_revision,
            },
        )

    try:
        storage_client().head_bucket(Bucket=settings.s3_bucket_name)
    except (BotoCoreError, ClientError, ValueError):
        return JSONResponse(
            status_code=503,
            content={"status": "not_ready", "dependency": "media_storage"},
        )

    return {
        "status": "ready",
        "database": "ok",
        "database_schema": current_revision,
        "media_storage": "ok",
    }


@app.get("/v1/client-config")
def client_config() -> dict[str, bool | str | None]:
    provider = settings.identification_provider.strip().lower()
    external_processing = provider != "mock"
    return {
        "external_ai_processing": external_processing,
        "external_ai_provider": provider if external_processing else None,
        "external_ai_consent_version": (
            EXTERNAL_AI_DISCLOSURE_VERSION if external_processing else None
        ),
    }
