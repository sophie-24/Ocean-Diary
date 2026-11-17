from dataclasses import replace
from urllib.parse import urlsplit

import app.storage as storage

from .conftest import headers


def _intent(client, host: str, key: str):
    return client.post(
        "/v1/media/upload-intents",
        json={"mime_type": "image/jpeg", "byte_size": 1000},
        headers={**headers(key=key), "Host": host},
    )


def test_auto_public_endpoint_follows_the_address_the_phone_used(client, monkeypatch):
    monkeypatch.setattr(storage, "settings", replace(storage.settings, s3_public_endpoint_url="auto"))
    r = _intent(client, "172.20.10.2:8765", "auto-1")
    assert r.status_code == 201, r.text
    url = urlsplit(r.json()["upload_url"])
    assert (url.hostname, url.port) == ("172.20.10.2", 9000)

    # A non-IP Host header never ends up in a signed URL.
    r = _intent(client, "evil.example:8765", "auto-2")
    assert urlsplit(r.json()["upload_url"]).hostname == "127.0.0.1"


def test_fixed_public_endpoint_is_kept(client, monkeypatch):
    monkeypatch.setattr(storage, "settings", replace(storage.settings, s3_public_endpoint_url="http://10.0.0.5:9000"))
    r = _intent(client, "172.20.10.2:8765", "fixed-1")
    assert urlsplit(r.json()["upload_url"]).netloc == "10.0.0.5:9000"
