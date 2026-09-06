"""JWT encode/decode.

PyJWT rather than hand-rolled HMAC. The previous implementation's signature
check was actually correct, but it also carried a `_b64_url_decode` that called
`urlsafe_b64encode` — dead code, and the kind that stops being dead the moment
someone reaches for it.

Password hashing moved to `hashing.py`; the names are re-exported here so
existing imports keep working.
"""

from __future__ import annotations

import time
from typing import Any

import jwt

from app.core.config import get_settings
from app.modules.auth.hashing import hash_password, needs_rehash, verify_password

__all__ = [
    "create_jwt_token",
    "decode_jwt_token",
    "hash_password",
    "needs_rehash",
    "verify_password",
    "TOKEN_TTL_SECONDS",
]

TOKEN_TTL_SECONDS = 86400 * 30


def create_jwt_token(payload: dict[str, Any], expires_in_seconds: int = TOKEN_TTL_SECONDS) -> str:
    settings = get_settings()
    return jwt.encode(
        {**payload, "exp": int(time.time()) + expires_in_seconds},
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_jwt_token(token: str) -> dict[str, Any] | None:
    """Return the payload, or None for any invalid, expired or malformed token."""
    settings = get_settings()
    try:
        # `algorithms` as an explicit list is what blocks algorithm confusion:
        # without it a token claiming alg=none would be honoured.
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.PyJWTError:
        return None
