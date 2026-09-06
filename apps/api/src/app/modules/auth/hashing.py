"""Password hashing.

argon2id, with a transparent upgrade path from the legacy PBKDF2 format.

The format being replaced derived its salt from `time.time_ns()`, so the salt
was a function of the signup timestamp rather than of `secrets` — guessable,
which is most of what a salt exists to prevent. Existing rows cannot be
rehashed in a migration (the plaintext is gone), so `verify_password` accepts
both formats and `needs_rehash` tells the caller to upgrade on next login.
"""

from __future__ import annotations

import hashlib
import hmac

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

# Library defaults. Tune only against a benchmark on the target hardware —
# guessing at time/memory cost is how you get either a weak hash or a DoS.
_ph = PasswordHasher()

_ARGON2_PREFIX = "$argon2"


def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(plain: str, stored: str) -> bool:
    """True if `plain` matches `stored`. Handles argon2 and legacy PBKDF2 rows."""
    if stored.startswith(_ARGON2_PREFIX):
        try:
            return _ph.verify(stored, plain)
        except (VerifyMismatchError, VerificationError, InvalidHashError):
            return False
    return _verify_legacy(plain, stored)


def needs_rehash(stored: str) -> bool:
    """True when `stored` should be replaced after a successful verify."""
    if not stored.startswith(_ARGON2_PREFIX):
        return True
    try:
        return _ph.check_needs_rehash(stored)
    except InvalidHashError:
        return True


def _verify_legacy(plain: str, stored: str) -> bool:
    # ponytail: delete this and the `needs_rehash` call sites once no rows remain.
    # Check with: SELECT count(*) FROM users WHERE password_hash NOT LIKE '$argon2%';
    try:
        salt, key_hex = stored.split(":", 1)
        expected = bytes.fromhex(key_hex)
    except ValueError:
        return False
    key = hashlib.pbkdf2_hmac("sha256", plain.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return hmac.compare_digest(key, expected)
