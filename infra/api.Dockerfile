# Build from the repository root:  docker build -f infra/api.Dockerfile .
# The seed script reads ../../data relative to services/api/app, so the folder layout is kept.
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /srv/services/api

COPY services/api/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

COPY services/api/ /srv/services/api/
COPY data/ /srv/data/
COPY infra/entrypoint.sh /entrypoint.sh
# Strip Windows line endings so the script runs inside Linux.
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh \
    && useradd --create-home --uid 10001 app && chown -R app /srv
USER app

EXPOSE 8080
CMD ["/entrypoint.sh"]
