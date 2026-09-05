"""Typed settings, validated at startup.

Fail fast and loudly: a missing LLM_BASE_URL that defaults to empty means
requests silently go to api.anthropic.com with an AgentRouter key and 401 like
a bad key (docs/ai-astrologer.md). Better to refuse to boot.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    ENV: Literal["local", "staging", "production"] = "local"
    DEBUG: bool = False

    # Astrology. Optional: without it the engine uses Moshier analytical theory,
    # which needs no data files and is accurate to ~1 arcsecond.
    EPHEMERIS_PATH: str | None = None

    # LLM (Phase 2). Declared now so a misconfigured deploy fails at boot rather
    # than on the first user question.
    LLM_BASE_URL: str = "https://agentrouter.org/v1"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "claude-opus-5"

    CORS_ORIGINS: list[str] = []


@lru_cache
def get_settings() -> Settings:
    return Settings()
