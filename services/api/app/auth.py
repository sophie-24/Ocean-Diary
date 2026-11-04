from functools import lru_cache
from datetime import datetime, timezone
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text
from sqlalchemy.orm import Session
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError, PyJWKClientConnectionError, PyJWKClientError

from app.database import get_session
from app.models import AccountDeletionTombstone
from app.settings import settings

bearer_scheme = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def _jwks_client() -> PyJWKClient:
    if not settings.supabase_url:
        raise RuntimeError("SUPABASE_URL is required to verify Supabase access tokens")
    return PyJWKClient(
        f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json",
        timeout=settings.supabase_jwks_timeout_seconds,
    )


def user_lifecycle_lock_key(user_id: UUID) -> str:
    return f"ocean-diary:user-lifecycle:{user_id}"


def _resolve_current_user_id(
    credentials: HTTPAuthorizationCredentials | None,
) -> UUID:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail={"code": "AUTH_REQUIRED"})

    if (
        settings.app_env == "development"
        and settings.dev_auth_enabled
        and credentials.credentials == settings.dev_auth_token
    ):
        return settings.dev_auth_user_id

    if not settings.supabase_url:
        raise HTTPException(
            status_code=503,
            detail={"code": "AUTH_PROVIDER_NOT_CONFIGURED"},
        )

    # Development tokens remain available locally, while configured Supabase
    # access tokens can exercise the same ownership boundary before deployment.
    try:
        signing_key = _jwks_client().get_signing_key_from_jwt(credentials.credentials).key
        claims = jwt.decode(
            credentials.credentials,
            signing_key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            issuer=f"{settings.supabase_url.rstrip('/')}/auth/v1",
            options={"require": ["sub", "iat", "exp", "iss", "aud"]},
        )
        token_lifetime = int(claims["exp"]) - int(claims["iat"])
        if token_lifetime <= 0 or token_lifetime > settings.supabase_access_token_max_age_seconds:
            raise InvalidTokenError("Access token lifetime exceeds the configured maximum")
        return UUID(claims["sub"])
    except PyJWKClientConnectionError as exc:
        raise HTTPException(
            status_code=503,
            detail={"code": "AUTH_PROVIDER_UNAVAILABLE"},
        ) from exc
    except (InvalidTokenError, PyJWKClientError, ValueError, TypeError, KeyError) as exc:
        raise HTTPException(status_code=401, detail={"code": "INVALID_TOKEN"}) from exc


def get_current_user_id(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: Session = Depends(get_session),
) -> UUID:
    cached_error = getattr(request.state, "auth_resolution_error", None)
    if cached_error is not None:
        status_code, detail, headers = cached_error
        raise HTTPException(status_code=status_code, detail=detail, headers=headers)
    user_id = getattr(request.state, "verified_auth_user_id", None)
    if user_id is None:
        user_id = _resolve_current_user_id(credentials)
    is_local_dev_identity = (
        settings.app_env == "development"
        and settings.dev_auth_enabled
        and credentials is not None
        and credentials.credentials == settings.dev_auth_token
    )
    if is_local_dev_identity:
        return user_id

    session.execute(
        text("SELECT pg_advisory_xact_lock(hashtextextended(:lock_key, 0))"),
        {"lock_key": user_lifecycle_lock_key(user_id)},
    )
    tombstone = session.get(AccountDeletionTombstone, user_id)
    if tombstone and (
        tombstone.status == "pending"
        or (tombstone.block_expires_at and tombstone.block_expires_at > datetime.now(timezone.utc))
    ):
        session.rollback()
        raise HTTPException(status_code=410, detail={"code": "ACCOUNT_DELETED"})
    return user_id


def get_current_user_id_for_account_deletion(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UUID:
    """Allow an authenticated caller to retry cleanup after a partial deletion."""
    cached_error = getattr(request.state, "auth_resolution_error", None)
    if cached_error is not None:
        status_code, detail, headers = cached_error
        raise HTTPException(status_code=status_code, detail=detail, headers=headers)
    user_id = getattr(request.state, "verified_auth_user_id", None)
    return user_id or _resolve_current_user_id(credentials)
