from types import SimpleNamespace
from urllib.error import HTTPError

import jwt
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import HTTPException

from app import apple_auth


@pytest.fixture()
def apple_settings(monkeypatch):
    key = ec.generate_private_key(ec.SECP256R1())
    pem = key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.PKCS8,
        serialization.NoEncryption(),
    ).decode()
    monkeypatch.setattr(
        apple_auth,
        "settings",
        SimpleNamespace(
            apple_team_id="TEAM123456",
            apple_key_id="KEY1234567",
            # .env files carry the .p8 on one line with literal \n sequences.
            apple_private_key=pem.replace("\n", "\\n"),
            apple_client_id="app.mola.ios.kr",
        ),
    )
    return key.public_key()


def test_client_secret_is_a_valid_apple_es256_jwt(apple_settings):
    token = apple_auth.build_client_secret(now=1_700_000_000)

    assert jwt.get_unverified_header(token) == {"alg": "ES256", "kid": "KEY1234567", "typ": "JWT"}
    claims = jwt.decode(
        token,
        apple_settings,
        algorithms=["ES256"],
        audience="https://appleid.apple.com",
        options={"verify_exp": False},
    )
    assert claims["iss"] == "TEAM123456"
    assert claims["sub"] == "app.mola.ios.kr"
    assert claims["exp"] - claims["iat"] == 300


def test_revoke_exchanges_code_then_revokes_refresh_token(apple_settings, monkeypatch):
    calls = []

    def fake_post(url, fields):
        calls.append((url, fields))
        return {"refresh_token": "r-token"} if url == apple_auth.APPLE_TOKEN_URL else {}

    monkeypatch.setattr(apple_auth, "_post_form", fake_post)
    apple_auth.revoke_apple_authorization("fresh-code")

    assert [url for url, _ in calls] == [apple_auth.APPLE_TOKEN_URL, apple_auth.APPLE_REVOKE_URL]
    assert calls[0][1]["code"] == "fresh-code"
    assert calls[0][1]["client_id"] == "app.mola.ios.kr"
    assert calls[1][1]["token"] == "r-token"
    assert calls[1][1]["token_type_hint"] == "refresh_token"


def test_expired_code_is_reported_as_retryable_400(apple_settings, monkeypatch):
    def fake_post(url, fields):
        raise HTTPError(url, 400, "invalid_grant", {}, None)

    monkeypatch.setattr(apple_auth, "_post_form", fake_post)
    with pytest.raises(HTTPException) as exc:
        apple_auth.revoke_apple_authorization("old-code")
    assert exc.value.status_code == 400
    assert exc.value.detail == {"code": "APPLE_AUTHORIZATION_CODE_INVALID"}


def test_missing_configuration_fails_closed(monkeypatch):
    monkeypatch.setattr(
        apple_auth,
        "settings",
        SimpleNamespace(apple_team_id="", apple_key_id="", apple_private_key="", apple_client_id=""),
    )
    with pytest.raises(HTTPException) as exc:
        apple_auth.revoke_apple_authorization("code")
    assert exc.value.status_code == 503
    assert exc.value.detail == {"code": "ACCOUNT_DELETE_NOT_CONFIGURED"}
