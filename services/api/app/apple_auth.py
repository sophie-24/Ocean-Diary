"""Sign in with Apple token revocation (App Store guideline 5.1.1(v)).

When an account that signed in with Apple is deleted, the app must revoke the user's
Apple tokens. The mobile app re-authenticates with Apple at deletion time and sends the
fresh, single-use authorization code; we exchange it for a refresh token and revoke it.
No Apple token is ever stored.
"""

import json
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import jwt
from fastapi import HTTPException, status

from app.settings import settings

APPLE_AUDIENCE = "https://appleid.apple.com"
APPLE_TOKEN_URL = f"{APPLE_AUDIENCE}/auth/token"
APPLE_REVOKE_URL = f"{APPLE_AUDIENCE}/auth/revoke"
CLIENT_SECRET_TTL_SECONDS = 300


def apple_revocation_configured() -> bool:
    return all(
        (
            settings.apple_team_id,
            settings.apple_key_id,
            settings.apple_private_key,
            settings.apple_client_id,
        )
    )


def build_client_secret(now: int | None = None) -> str:
    """ES256 JWT signed with the Sign in with Apple key (.p8). Valid for 5 minutes."""
    issued_at = int(time.time()) if now is None else now
    return jwt.encode(
        {
            "iss": settings.apple_team_id,
            "iat": issued_at,
            "exp": issued_at + CLIENT_SECRET_TTL_SECONDS,
            "aud": APPLE_AUDIENCE,
            "sub": settings.apple_client_id,
        },
        settings.apple_private_key.replace("\\n", "\n"),
        algorithm="ES256",
        headers={"kid": settings.apple_key_id},
    )


def _post_form(url: str, fields: dict[str, str]) -> dict:
    request = Request(
        url,
        method="POST",
        data=urlencode(fields).encode("utf-8"),
        headers={"Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json"},
    )
    with urlopen(request, timeout=10) as response:
        raw = response.read()
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except ValueError:
        return {}


def revoke_apple_authorization(authorization_code: str) -> None:
    """Exchange a fresh authorization code for a refresh token, then revoke it."""
    if not apple_revocation_configured():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "ACCOUNT_DELETE_NOT_CONFIGURED"},
        )

    client_id = settings.apple_client_id
    client_secret = build_client_secret()
    try:
        token = _post_form(
            APPLE_TOKEN_URL,
            {
                "client_id": client_id,
                "client_secret": client_secret,
                "code": authorization_code,
                "grant_type": "authorization_code",
            },
        )
        refresh_token = token.get("refresh_token")
        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={"code": "ACCOUNT_DELETE_APPLE_REVOKE_FAILED"},
            )
        _post_form(
            APPLE_REVOKE_URL,
            {
                "client_id": client_id,
                "client_secret": client_secret,
                "token": refresh_token,
                "token_type_hint": "refresh_token",
            },
        )
    except HTTPError as exc:
        # 400 invalid_grant: the code was already used or expired (5 minutes). The app can
        # ask Apple for a new one and retry, so report it distinctly.
        if exc.code == 400:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"code": "APPLE_AUTHORIZATION_CODE_INVALID"},
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "ACCOUNT_DELETE_APPLE_REVOKE_FAILED"},
        ) from exc
    except (URLError, TimeoutError) as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "ACCOUNT_DELETE_APPLE_REVOKE_UNAVAILABLE"},
        ) from exc
