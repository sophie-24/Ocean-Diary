import base64
import io

import pytest
from fastapi import HTTPException
from PIL import Image

from app.admin import MAX_SPECIES_IMAGE_BYTES, _like_pattern, _process_species_image


def _b64(fmt: str, size=(40, 30), mode="RGB") -> str:
    buf = io.BytesIO()
    Image.new(mode, size, "blue").save(buf, format=fmt)
    return base64.b64encode(buf.getvalue()).decode()


@pytest.mark.parametrize("fmt", ["PNG", "JPEG", "WEBP"])
def test_accepts_allowed_formats_and_returns_png_pair(fmt):
    main, thumb = _process_species_image(_b64(fmt))
    assert Image.open(io.BytesIO(main)).format == "PNG"
    assert Image.open(io.BytesIO(thumb)).format == "PNG"


def test_large_image_is_downscaled():
    main, thumb = _process_species_image(_b64("PNG", size=(3000, 2000)))
    assert max(Image.open(io.BytesIO(main)).size) == 1024
    assert max(Image.open(io.BytesIO(thumb)).size) == 320


@pytest.mark.parametrize("bad", ["not base64!!", base64.b64encode(b"hello world").decode(), ""])
def test_rejects_non_images(bad):
    with pytest.raises(HTTPException) as exc:
        _process_species_image(bad)
    assert exc.value.status_code == 400


def test_rejects_unlisted_format():
    with pytest.raises(HTTPException) as exc:
        _process_species_image(_b64("GIF", mode="P"))
    assert exc.value.status_code == 400


def test_rejects_oversize_payload():
    big = base64.b64encode(b"\0" * (MAX_SPECIES_IMAGE_BYTES + 1)).decode()
    with pytest.raises(HTTPException) as exc:
        _process_species_image(big)
    assert exc.value.detail["code"] == "IMAGE_TOO_LARGE"


def test_like_pattern_escapes_wildcards():
    assert _like_pattern("  ") is None
    assert _like_pattern("a%b_c!") == "%a!%b!_c!!%"
