from contextvars import ContextVar
from ipaddress import ip_address
from urllib.parse import urlsplit

import boto3
from botocore.config import Config

from app.settings import settings

# Host name the current request arrived on (set by middleware in app.main). Used only when
# S3_PUBLIC_ENDPOINT_URL=auto in development, so a phone on a hotspot or Wi-Fi gets presigned
# URLs for the same PC address it already used to reach the API, without editing .env.
request_host: ContextVar[str | None] = ContextVar("request_host", default=None)


def _auto_public_endpoint() -> str:
    internal = urlsplit(settings.s3_endpoint_url)
    port = internal.port or 9000
    host = request_host.get()
    try:
        # Only trust literal IP addresses (LAN / loopback); anything else falls back to loopback.
        ip_address(host or "")
    except ValueError:
        host = "127.0.0.1"
    return f"{internal.scheme or 'http'}://{host}:{port}"


def public_endpoint_url() -> str:
    if settings.s3_public_endpoint_url.strip().lower() == "auto":
        return _auto_public_endpoint()
    return settings.s3_public_endpoint_url


def storage_client(*, public: bool = False):
    return boto3.client(
        "s3",
        endpoint_url=(public_endpoint_url() if public else settings.s3_endpoint_url),
        region_name=settings.s3_region,
        aws_access_key_id=settings.s3_access_key_id,
        aws_secret_access_key=settings.s3_secret_access_key,
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )
