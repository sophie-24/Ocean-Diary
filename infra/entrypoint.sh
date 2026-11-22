#!/bin/sh
# One small machine runs both the API and the background worker (photo identification + cleanup).
set -e
cd /srv/services/api

# Restart the worker if it ever exits; the API keeps serving either way.
( while true; do python -m app.worker || true; sleep 5; done ) &

exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 \
  --proxy-headers --forwarded-allow-ips="*"
