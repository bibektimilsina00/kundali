"""The one place an LLM client is constructed.

AgentRouter is Anthropic-wire-compatible, so this is the official `anthropic`
SDK with `base_url` overridden. Both the URL and the key are passed explicitly:
the SDK otherwise reads `ANTHROPIC_BASE_URL` from the environment, and when that
variable is missing an AgentRouter key goes to api.anthropic.com and comes back
as a 401 that reads exactly like a bad key (docs/ai-astrologer.md).
"""

from __future__ import annotations

from functools import lru_cache

from anthropic import AsyncAnthropic

from app.core.config import get_settings

# Opus 5 gotchas that this module's callers must respect (docs/ai-astrologer.md):
#   - `temperature` / `top_p` / `top_k` are rejected. Steer with prompting.
#   - Assistant prefill is rejected. Use output_config.format for forced JSON.
#   - Thinking is on by default and shares the `max_tokens` budget with the
#     text, so size max_tokens with headroom or answers truncate mid-sentence.
#   - Check `stop_reason == "refusal"` before reading `content`; it will be empty.
THINKING: dict[str, str] = {"type": "adaptive"}
OUTPUT_CONFIG: dict[str, str] = {"effort": "medium"}


@lru_cache(maxsize=1)
def get_client() -> AsyncAnthropic:
    settings = get_settings()
    if not settings.LLM_API_KEY:
        raise RuntimeError(
            "LLM_API_KEY is not set. Put an AgentRouter key in apps/api/.env; "
            "see apps/api/.env.example."
        )
    return AsyncAnthropic(
        api_key=settings.LLM_API_KEY,
        base_url=settings.LLM_BASE_URL,
    )


def model_name() -> str:
    """Bare model id, same as first-party. Switching providers is a .env change."""
    return get_settings().LLM_MODEL
