import hashlib
import hmac
import io
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, Depends, Header, HTTPException, Response, status
from PIL import Image, ImageOps, UnidentifiedImageError
from pydantic import BaseModel, Field
from sqlalchemy import delete, func, select, text
from sqlalchemy.orm import Session

from app.auth import get_current_user_id
from app.database import get_session
from app.models import IdentificationJob, MediaAsset, Observation
from app.settings import EXTERNAL_AI_DISCLOSURE_VERSION, settings
from app.storage import storage_client

router = APIRouter(prefix="/v1/media", tags=["media"])
MAX_UPLOAD_BYTES = 15 * 1024 * 1024
MAX_PROCESSED_IMAGE_EDGE = 2560
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png"}


class UploadIntentRequest(BaseModel):
    mime_type: str
    byte_size: int = Field(gt=0, le=MAX_UPLOAD_BYTES)
    sha256: str | None = Field(default=None, pattern=r"^[a-fA-F0-9]{64}$")
    external_ai_consent_provider: str | None = Field(default=None, min_length=1, max_length=80)
    external_ai_consent_version: str | None = Field(default=None, min_length=1, max_length=30)


class UploadIntentResponse(BaseModel):
    media_id: str
    status: str = "pending_upload"
    upload_url: str
    method: str = "PUT"
    required_headers: dict[str, str]
    expires_at: datetime
    max_byte_size: int = MAX_UPLOAD_BYTES


class MediaStatusResponse(BaseModel):
    media_id: str
    status: str


def _reject_upload(
    session: Session,
    media: MediaAsset,
    code: str,
    status_code: int = 415,
    *,
    client=None,
) -> None:
    media.status = "rejected"
    session.commit()
    if client is not None:
        for key in {media.storage_key, media.upload_storage_key} - {None}:
            try:
                client.delete_object(Bucket=settings.s3_bucket_name, Key=key)
            except (BotoCoreError, ClientError):
                pass
    raise HTTPException(status_code=status_code, detail={"code": code})


def _processed_object_signature(
    media: MediaAsset, checksum: str, width: int, height: int
) -> str:
    message = "\n".join(
        (
            str(media.id),
            str(media.owner_user_id),
            media.storage_key,
            settings.s3_bucket_name,
            media.mime_type,
            checksum,
            str(width),
            str(height),
        )
    ).encode("utf-8")
    return hmac.new(
        settings.s3_secret_access_key.encode("utf-8"), message, hashlib.sha256
    ).hexdigest()


def _resume_sanitized_upload(
    session: Session,
    media: MediaAsset,
    user_id: UUID,
    client,
    head: dict,
) -> MediaStatusResponse | None:
    metadata = head.get("Metadata", {})
    signature = metadata.get("processed-signature")
    if signature is None:
        return None

    try:
        width = int(metadata["processed-width"])
        height = int(metadata["processed-height"])
        checksum = metadata["processed-sha256"]
    except (KeyError, TypeError, ValueError):
        _reject_upload(session, media, "UPLOAD_METADATA_MISMATCH", 400, client=client)

    content_length = head.get("ContentLength")
    if (
        head.get("ContentType") != media.mime_type
        or metadata.get("media-id") != str(media.id)
        or metadata.get("owner-user-id") != str(user_id)
        or not isinstance(content_length, int)
        or isinstance(content_length, bool)
        or not 0 < content_length <= MAX_UPLOAD_BYTES
        or width <= 0
        or height <= 0
        or max(width, height) > MAX_PROCESSED_IMAGE_EDGE
        or not isinstance(checksum, str)
        or len(checksum) != 64
        or any(char not in "0123456789abcdef" for char in checksum)
        or not isinstance(signature, str)
        or len(signature) != 64
        or any(char not in "0123456789abcdef" for char in signature)
    ):
        _reject_upload(session, media, "UPLOAD_METADATA_MISMATCH", 400, client=client)

    expected_signature = _processed_object_signature(media, checksum, width, height)
    if not hmac.compare_digest(signature, expected_signature):
        _reject_upload(session, media, "UPLOAD_METADATA_MISMATCH", 400, client=client)

    try:
        response = client.get_object(Bucket=settings.s3_bucket_name, Key=media.storage_key)
        body = response["Body"]
        try:
            processed_image = body.read(MAX_UPLOAD_BYTES + 1)
        finally:
            body.close()
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=503, detail={"code": "STORAGE_UNAVAILABLE"}) from exc

    if (
        len(processed_image) != content_length
        or hashlib.sha256(processed_image).hexdigest() != checksum
    ):
        _reject_upload(session, media, "UPLOAD_CHECKSUM_MISMATCH", 400, client=client)

    media.width = width
    media.height = height
    media.byte_size = content_length
    media.sha256 = checksum
    media.status = "ready"
    session.commit()
    return MediaStatusResponse(media_id=str(media.id), status="ready")


@router.post(
    "/upload-intents",
    response_model=UploadIntentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_upload_intent(
    payload: UploadIntentRequest,
    user_id=Depends(get_current_user_id),
    session: Session = Depends(get_session),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key", max_length=128),
) -> UploadIntentResponse:
    if payload.mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=415, detail={"code": "UNSUPPORTED_MEDIA"})
    if idempotency_key is not None:
        idempotency_key = idempotency_key.strip()
        if not idempotency_key:
            raise HTTPException(status_code=400, detail={"code": "INVALID_IDEMPOTENCY_KEY"})

    provider = settings.identification_provider.strip().lower()
    if provider != "mock" and (
        payload.external_ai_consent_provider != provider
        or payload.external_ai_consent_version != EXTERNAL_AI_DISCLOSURE_VERSION
    ):
        raise HTTPException(
            status_code=409,
            detail={"code": "EXTERNAL_AI_CONSENT_REQUIRED"},
        )

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(seconds=settings.upload_intent_ttl_seconds)
    checksum = payload.sha256.lower() if payload.sha256 else None
    if idempotency_key:
        session.execute(
            text("SELECT pg_advisory_xact_lock(hashtextextended(:key, 0))"),
            {"key": f"ocean-diary:upload-intent:{user_id}:{idempotency_key}"},
        )
        media = session.scalar(
            select(MediaAsset).where(
                MediaAsset.owner_user_id == user_id,
                MediaAsset.upload_intent_key == idempotency_key,
            ).with_for_update()
        )
        if media is not None:
            expected_consent_provider = provider if provider != "mock" else None
            expected_consent_version = (
                EXTERNAL_AI_DISCLOSURE_VERSION if provider != "mock" else None
            )
            if (
                media.mime_type != payload.mime_type
                or (
                    media.upload_byte_size is not None
                    and media.upload_byte_size != payload.byte_size
                )
                or (
                    checksum is not None
                    and media.upload_sha256 is not None
                    and media.upload_sha256 != checksum
                )
                or media.external_ai_consent_provider != expected_consent_provider
                or media.external_ai_consent_version != expected_consent_version
            ):
                session.rollback()
                raise HTTPException(status_code=409, detail={"code": "IDEMPOTENCY_KEY_REUSED"})
            if media.status == "ready":
                session.rollback()
                return UploadIntentResponse(
                    media_id=str(media.id),
                    status="ready",
                    upload_url="",
                    required_headers={},
                    expires_at=media.expires_at,
                )
            if media.status != "pending_upload" or media.upload_storage_key is None:
                session.rollback()
                raise HTTPException(
                    status_code=409, detail={"code": "UPLOAD_INTENT_NOT_REUSABLE"}
                )
            return _signed_upload_intent_response(media, session)

    media_id = uuid4()
    suffix = "jpg" if payload.mime_type == "image/jpeg" else "png"
    storage_key = f"users/{user_id}/media/{media_id}/processed.{suffix}"
    upload_storage_key = f"users/{user_id}/media/{media_id}/upload.{suffix}"
    media = MediaAsset(
        id=media_id,
        owner_user_id=user_id,
        storage_key=storage_key,
        upload_storage_key=upload_storage_key,
        upload_intent_key=idempotency_key,
        mime_type=payload.mime_type,
        byte_size=payload.byte_size,
        upload_byte_size=payload.byte_size,
        upload_sha256=checksum,
        sha256=checksum,
        external_ai_consent_provider=provider if provider != "mock" else None,
        external_ai_consent_at=now if provider != "mock" else None,
        external_ai_consent_version=(
            EXTERNAL_AI_DISCLOSURE_VERSION if provider != "mock" else None
        ),
        status="pending_upload",
        created_at=now,
        expires_at=expires_at,
    )
    session.add(media)
    return _signed_upload_intent_response(media, session)


def _signed_upload_intent_response(
    media: MediaAsset, session: Session
) -> UploadIntentResponse:
    if media.upload_storage_key is None:
        raise HTTPException(status_code=409, detail={"code": "UPLOAD_INTENT_NOT_REUSABLE"})
    # Every newly signed URL gets a matching persisted expiry. This is also
    # refreshed on idempotent retries so the worker does not delete the object
    # while a recently reissued URL can still write to it.
    media.expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=settings.upload_intent_ttl_seconds
    )
    object_metadata = {"owner-user-id": str(media.owner_user_id), "media-id": str(media.id)}
    if media.sha256:
        object_metadata["sha256"] = media.sha256
    try:
        upload_url = storage_client(public=True).generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.s3_bucket_name,
                "Key": media.upload_storage_key,
                "ContentType": media.mime_type,
                "Metadata": object_metadata,
            },
            ExpiresIn=settings.upload_intent_ttl_seconds,
        )
    except (BotoCoreError, ClientError) as exc:
        session.rollback()
        raise HTTPException(status_code=503, detail={"code": "STORAGE_UNAVAILABLE"}) from exc
    session.commit()
    return UploadIntentResponse(
        media_id=str(media.id),
        upload_url=upload_url,
        status="pending_upload",
        required_headers={
            "Content-Type": media.mime_type,
            **{f"x-amz-meta-{key}": value for key, value in object_metadata.items()},
        },
        expires_at=media.expires_at,
    )


@router.post("/{media_id}/complete", response_model=MediaStatusResponse)
def complete_upload(
    media_id: UUID,
    user_id=Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> MediaStatusResponse:
    media = session.scalar(
        select(MediaAsset)
        .where(MediaAsset.id == media_id, MediaAsset.owner_user_id == user_id)
        .with_for_update()
    )
    if media is None or media.status in {"deleted", "rejected"}:
        raise HTTPException(status_code=404, detail={"code": "MEDIA_NOT_FOUND"})
    if media.status == "ready":
        return MediaStatusResponse(media_id=str(media.id), status="ready")

    client = storage_client()
    # A previous completion may have written the sanitized object before its DB
    # commit was acknowledged. Resume from the server-only final key first.
    try:
        head = client.head_object(Bucket=settings.s3_bucket_name, Key=media.storage_key)
    except ClientError as exc:
        error_code = exc.response.get("Error", {}).get("Code")
        if error_code in {"404", "NoSuchKey", "NotFound"}:
            head = None
        else:
            raise HTTPException(status_code=503, detail={"code": "STORAGE_UNAVAILABLE"}) from exc
    except BotoCoreError as exc:
        raise HTTPException(status_code=503, detail={"code": "STORAGE_UNAVAILABLE"}) from exc

    if head is not None:
        resumed = _resume_sanitized_upload(session, media, user_id, client, head)
        if resumed is not None:
            return resumed

    upload_key = media.upload_storage_key or media.storage_key
    try:
        head = client.head_object(Bucket=settings.s3_bucket_name, Key=upload_key)
    except ClientError as exc:
        error_code = exc.response.get("Error", {}).get("Code")
        if error_code in {"404", "NoSuchKey", "NotFound"}:
            raise HTTPException(status_code=409, detail={"code": "UPLOAD_NOT_FOUND"}) from exc
        raise HTTPException(status_code=503, detail={"code": "STORAGE_UNAVAILABLE"}) from exc
    except BotoCoreError as exc:
        raise HTTPException(status_code=503, detail={"code": "STORAGE_UNAVAILABLE"}) from exc

    metadata = head.get("Metadata", {})
    if metadata.get("media-id") != str(media.id) or metadata.get("owner-user-id") != str(user_id):
        _reject_upload(session, media, "UPLOAD_METADATA_MISMATCH", 400, client=client)

    if media.expires_at < datetime.now(timezone.utc):
        media.status = "rejected"
        session.commit()
        raise HTTPException(status_code=409, detail={"code": "UPLOAD_EXPIRED"})
    if head.get("ContentLength", 0) != media.byte_size:
        _reject_upload(session, media, "UPLOAD_SIZE_MISMATCH", 400, client=client)
    if head.get("ContentType") != media.mime_type:
        _reject_upload(session, media, "UPLOAD_TYPE_MISMATCH", 415, client=client)

    try:
        response = client.get_object(Bucket=settings.s3_bucket_name, Key=upload_key)
        body = response["Body"]
        try:
            raw_image = body.read(MAX_UPLOAD_BYTES + 1)
        finally:
            body.close()
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=503, detail={"code": "STORAGE_UNAVAILABLE"}) from exc
    if len(raw_image) != media.byte_size or len(raw_image) > MAX_UPLOAD_BYTES:
        _reject_upload(session, media, "UPLOAD_SIZE_MISMATCH", 400, client=client)
    upload_sha256 = hashlib.sha256(raw_image).hexdigest()
    if media.upload_sha256 and upload_sha256 != media.upload_sha256:
        _reject_upload(session, media, "UPLOAD_CHECKSUM_MISMATCH", 400, client=client)

    try:
        Image.MAX_IMAGE_PIXELS = 40_000_000
        with Image.open(io.BytesIO(raw_image)) as image:
            actual_format = image.format
            raw_width, raw_height = image.size
            if (media.mime_type, actual_format) not in {
                ("image/jpeg", "JPEG"),
                ("image/png", "PNG"),
            }:
                _reject_upload(session, media, "UNSUPPORTED_MEDIA", 415, client=client)
            if raw_width * raw_height > 20_000_000:
                _reject_upload(session, media, "IMAGE_TOO_LARGE", 413, client=client)
            cleaned_image = ImageOps.exif_transpose(image)
            cleaned_image.thumbnail(
                (MAX_PROCESSED_IMAGE_EDGE, MAX_PROCESSED_IMAGE_EDGE),
                Image.Resampling.LANCZOS,
            )
            width, height = cleaned_image.size
            output = io.BytesIO()
            if actual_format == "JPEG":
                if cleaned_image.mode not in {"RGB", "L"}:
                    cleaned_image = cleaned_image.convert("RGB")
                cleaned_image.save(output, format="JPEG", quality=92, optimize=True)
            else:
                cleaned_image.save(output, format="PNG", optimize=True)
            sanitized_image = output.getvalue()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as exc:
        _reject_upload(session, media, "INVALID_IMAGE", 415, client=client)
        raise AssertionError("unreachable") from exc

    if width <= 0 or height <= 0 or max(width, height) > MAX_PROCESSED_IMAGE_EDGE:
        _reject_upload(session, media, "INVALID_IMAGE_DIMENSIONS", 400, client=client)
    if len(sanitized_image) > MAX_UPLOAD_BYTES:
        _reject_upload(session, media, "PROCESSED_IMAGE_TOO_LARGE", 413, client=client)

    sanitized_sha256 = hashlib.sha256(sanitized_image).hexdigest()
    processed_metadata = {
        "media-id": str(media.id),
        "owner-user-id": str(user_id),
        "processed-sha256": sanitized_sha256,
        "processed-width": str(width),
        "processed-height": str(height),
        "processed-signature": _processed_object_signature(
            media, sanitized_sha256, width, height
        ),
    }
    try:
        client.put_object(
            Bucket=settings.s3_bucket_name,
            Key=media.storage_key,
            Body=sanitized_image,
            ContentType=media.mime_type,
            Metadata=processed_metadata,
        )
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(status_code=503, detail={"code": "STORAGE_UNAVAILABLE"}) from exc

    media.width = width
    media.height = height
    media.upload_sha256 = upload_sha256
    media.byte_size = len(sanitized_image)
    media.sha256 = sanitized_sha256
    media.status = "ready"
    session.commit()
    # The signed URL can only write to upload_storage_key, never the processed
    # key used for serving and AI. Keep its key until its signature has expired
    # so the worker can remove a late retry as well.
    try:
        client.delete_object(Bucket=settings.s3_bucket_name, Key=upload_key)
    except (BotoCoreError, ClientError):
        pass
    return MediaStatusResponse(media_id=str(media.id), status="ready")


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(
    media_id: UUID,
    user_id=Depends(get_current_user_id),
    session: Session = Depends(get_session),
) -> Response:
    media = session.scalar(
        select(MediaAsset)
        .where(MediaAsset.id == media_id, MediaAsset.owner_user_id == user_id)
        .with_for_update()
    )
    if media is None:
        raise HTTPException(status_code=404, detail={"code": "MEDIA_NOT_FOUND"})
    if media.status == "deleted":
        session.execute(
            delete(IdentificationJob).where(IdentificationJob.media_asset_id == media.id)
        )
        session.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    observation_count = session.scalar(
        select(func.count(Observation.id)).where(
            Observation.media_asset_id == media.id,
            Observation.deleted_at.is_(None),
        )
    )
    if observation_count:
        raise HTTPException(status_code=409, detail={"code": "MEDIA_IN_USE"})
    deleted_at = datetime.now(timezone.utc)
    session.execute(
        delete(IdentificationJob).where(IdentificationJob.media_asset_id == media.id)
    )
    media.status = "deleted"
    media.deleted_at = deleted_at
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
