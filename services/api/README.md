# API service

Run from this folder in PowerShell:

```powershell
python -m venv .venv
.venv/Scripts/python -m pip install -r requirements.txt
.venv/Scripts/python -m uvicorn app.main:app --reload --port 8000
```

Health endpoint: `GET /v1/health`. Species list, search, and detail routes are available at `/v1/species` after the database is migrated and seeded.

## Species catalog

1. Start PostgreSQL from the repository root with `docker compose -f infra/docker-compose.yml up -d`.
2. From this folder, apply the schema: `.venv/Scripts/python -m alembic upgrade head`.
3. Seed the shared catalog: `.venv/Scripts/python -m app.seed_species`.
4. Start the API. Browse `GET /v1/species?limit=20`, search with `?query=자리돔`, and fetch a species with `GET /v1/species/{uuid}`.

The seed command is safe to repeat: it updates rows by `slug`. Artwork stays `null` until an original/licensed illustration has been added. Set `MEDIA_PUBLIC_BASE_URL` when public artwork assets are available.
