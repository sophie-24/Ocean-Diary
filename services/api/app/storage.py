import boto3
from botocore.config import Config

from app.settings import settings


def storage_client(*, public: bool = False):
    return boto3.client(
        "s3",
        endpoint_url=(settings.s3_public_endpoint_url if public else settings.s3_endpoint_url),
        region_name=settings.s3_region,
        aws_access_key_id=settings.s3_access_key_id,
        aws_secret_access_key=settings.s3_secret_access_key,
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )
