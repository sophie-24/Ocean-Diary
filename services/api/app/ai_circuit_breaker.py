"""PostgreSQL-backed circuit-breaker state shared by API and worker processes."""

from datetime import datetime, timedelta, timezone
from math import ceil

from sqlalchemy import delete, func, select, text
from sqlalchemy.orm import Session

from app.models import AiProviderFailureEvent
from app.settings import settings


def _lock_provider(session: Session, provider: str) -> None:
    session.execute(
        text("SELECT pg_advisory_xact_lock(hashtextextended(:provider_key, 0))"),
        {"provider_key": f"ocean-diary:ai-circuit:{provider}"},
    )


def provider_retry_after(session: Session, provider: str) -> int:
    """Return remaining open time while holding the provider transaction lock."""
    _lock_provider(session, provider)
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=settings.ai_provider_circuit_window_seconds)
    count, oldest = session.execute(
        select(
            func.count(AiProviderFailureEvent.id),
            func.min(AiProviderFailureEvent.occurred_at),
        ).where(
            AiProviderFailureEvent.provider == provider,
            AiProviderFailureEvent.occurred_at > cutoff,
        )
    ).one()
    if count < settings.ai_provider_failure_threshold or oldest is None:
        return 0
    return max(
        1,
        ceil(
            (
                oldest + timedelta(seconds=settings.ai_provider_circuit_window_seconds) - now
            ).total_seconds()
        ),
    )


def record_provider_failure(session: Session, provider: str) -> bool:
    """Record a retryable provider failure; return whether the circuit is open."""
    _lock_provider(session, provider)
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=settings.ai_provider_circuit_window_seconds)
    session.execute(
        delete(AiProviderFailureEvent).where(
            AiProviderFailureEvent.provider == provider,
            AiProviderFailureEvent.occurred_at <= cutoff,
        )
    )
    session.add(AiProviderFailureEvent(provider=provider, occurred_at=now))
    session.flush()
    failure_count = session.scalar(
        select(func.count(AiProviderFailureEvent.id)).where(
            AiProviderFailureEvent.provider == provider,
            AiProviderFailureEvent.occurred_at > cutoff,
        )
    ) or 0
    return failure_count >= settings.ai_provider_failure_threshold


def clear_provider_failures(session: Session, provider: str) -> None:
    """Close the circuit after a successful provider response."""
    _lock_provider(session, provider)
    session.execute(
        delete(AiProviderFailureEvent).where(AiProviderFailureEvent.provider == provider)
    )
