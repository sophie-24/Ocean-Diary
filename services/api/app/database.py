import os
from collections.abc import Generator
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.settings import settings

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
load_dotenv(REPOSITORY_ROOT / ".env")


class Base(DeclarativeBase):
    pass


DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+psycopg://ocean:ocean@localhost:5432/ocean_diary",
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={
        "connect_timeout": settings.database_connect_timeout_seconds,
        # Supabase's pooler can hand a different backend connection to the same
        # session, which breaks psycopg's auto-prepared statements
        # ("prepared statement _pg3_0 does not exist"). Disable them.
        "prepare_threshold": None,
    },
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_session() -> Generator[Session, None, None]:
    with SessionLocal() as session:
        yield session
