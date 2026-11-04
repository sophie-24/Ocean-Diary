"""Vision-provider adapters for the asynchronous species identification worker."""

import base64
import json
import logging
from dataclasses import dataclass
from typing import Literal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.settings import settings

logger = logging.getLogger("ocean-diary.ai-provider")

ConfidenceBand = Literal["high", "medium", "low"]


@dataclass(frozen=True)
class SpeciesLabel:
    slug: str
    common_name_ko: str
    scientific_name: str


@dataclass(frozen=True)
class SpeciesPrediction:
    slug: str
    confidence_band: ConfidenceBand


class IdentificationProviderError(Exception):
    def __init__(self, code: str):
        self.code = code
        super().__init__(code)


def identify_with_configured_provider(
    image_bytes: bytes,
    mime_type: str,
    species_catalog: list[SpeciesLabel],
) -> list[SpeciesPrediction]:
    provider = settings.identification_provider.strip().lower()
    if provider == "mock":
        # Never invent wildlife labels in the development fallback.
        return []
    if provider != "openai":
        raise IdentificationProviderError("IDENTIFICATION_PROVIDER_NOT_CONFIGURED")
    if not settings.openai_api_key:
        raise IdentificationProviderError("AI_PROVIDER_CONFIG_ERROR")
    if not species_catalog:
        return []

    labels = [
        {
            "slug": item.slug,
            "common_name_ko": item.common_name_ko,
            "scientific_name": item.scientific_name,
        }
        for item in species_catalog
    ]
    allowed_slugs = [item.slug for item in species_catalog]
    schema = {
        "type": "object",
        "additionalProperties": False,
        "properties": {
            "candidates": {
                "type": "array",
                "maxItems": 3,
                "items": {
                    "type": "object",
                    "additionalProperties": False,
                    "properties": {
                        "slug": {"type": "string", "enum": allowed_slugs},
                        "confidence_band": {"type": "string", "enum": ["high", "medium", "low"]},
                    },
                    "required": ["slug", "confidence_band"],
                },
            }
        },
        "required": ["candidates"],
    }
    image_data_url = f"data:{mime_type};base64,{base64.b64encode(image_bytes).decode('ascii')}"
    payload = {
        "model": settings.openai_model,
        "store": False,
        "max_output_tokens": 300,
        "instructions": (
            "Identify marine organisms in underwater photographs. Return only plausible matches from "
            "the supplied Korean coastal species catalog. Do not guess when the subject is unclear, "
            "too small, obscured, or absent from the catalog. Order candidates by visual plausibility. "
            "Confidence bands are qualitative triage only, not calibrated probabilities. The diver must confirm."
        ),
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": (
                            "Identify up to three likely visible marine species. If no catalog entry is a "
                            "defensible match, return an empty candidates list. Do not infer a species from "
                            "location or metadata. Catalog:\n" + json.dumps(labels, ensure_ascii=False)
                        ),
                    },
                    {"type": "input_image", "image_url": image_data_url, "detail": "auto"},
                ],
            }
        ],
        "text": {
            "format": {
                "type": "json_schema",
                "name": "marine_species_candidates",
                "strict": True,
                "schema": schema,
            }
        },
    }
    request = Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=settings.ai_provider_timeout_seconds) as response:
            response_body = json.loads(response.read())
    except HTTPError as exc:
        error_code = "AI_PROVIDER_CONFIG_ERROR" if exc.code in {401, 403} else "AI_PROVIDER_UNAVAILABLE"
        raise IdentificationProviderError(error_code) from exc
    except (TimeoutError, URLError, OSError, json.JSONDecodeError) as exc:
        raise IdentificationProviderError("AI_PROVIDER_UNAVAILABLE") from exc

    if not isinstance(response_body, dict):
        raise IdentificationProviderError("AI_INVALID_RESPONSE")
    usage = response_body.get("usage")
    if isinstance(usage, dict):
        input_tokens = usage.get("input_tokens")
        output_tokens = usage.get("output_tokens")
        if (
            isinstance(input_tokens, int)
            and not isinstance(input_tokens, bool)
            and isinstance(output_tokens, int)
            and not isinstance(output_tokens, bool)
            and input_tokens >= 0
            and output_tokens >= 0
        ):
            logger.info(
                "provider response provider=openai model=%s input_tokens=%s output_tokens=%s",
                settings.openai_model,
                input_tokens,
                output_tokens,
            )

    output_text = response_body.get("output_text")
    if output_text is None:
        chunks = []
        output_items = response_body.get("output", [])
        if not isinstance(output_items, list):
            raise IdentificationProviderError("AI_INVALID_RESPONSE")
        for item in output_items:
            if not isinstance(item, dict):
                raise IdentificationProviderError("AI_INVALID_RESPONSE")
            if item.get("type") != "message":
                continue
            content_items = item.get("content", [])
            if not isinstance(content_items, list):
                raise IdentificationProviderError("AI_INVALID_RESPONSE")
            for content in content_items:
                if not isinstance(content, dict):
                    raise IdentificationProviderError("AI_INVALID_RESPONSE")
                if content.get("type") == "output_text" and isinstance(content.get("text"), str):
                    chunks.append(content["text"])
        output_text = "".join(chunks)
    elif not isinstance(output_text, str):
        raise IdentificationProviderError("AI_INVALID_RESPONSE")
    try:
        result = json.loads(output_text)
        candidates = result["candidates"]
        if not isinstance(candidates, list) or len(candidates) > 3:
            raise ValueError("invalid candidate list")
        seen: set[str] = set()
        predictions: list[SpeciesPrediction] = []
        for item in candidates:
            slug = item["slug"]
            confidence = item["confidence_band"]
            if slug not in allowed_slugs or slug in seen or confidence not in {"high", "medium", "low"}:
                raise ValueError("invalid candidate")
            seen.add(slug)
            predictions.append(SpeciesPrediction(slug=slug, confidence_band=confidence))
        return predictions
    except (TypeError, KeyError, ValueError, json.JSONDecodeError) as exc:
        raise IdentificationProviderError("AI_INVALID_RESPONSE") from exc
