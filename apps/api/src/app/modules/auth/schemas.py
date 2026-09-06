from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.modules.auth.jwt_handler import TOKEN_TTL_SECONDS


class UserSignupIn(BaseModel):
    email: EmailStr
    # 8, not 6. Narrowing an input constraint is normally a rule 7 violation, but
    # `apps/mobile` has no auth feature yet, so the web client we control is the
    # only caller. Tighten now, while that is still true.
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=100)


class UserLoginIn(BaseModel):
    email: EmailStr
    # Deliberately not min_length=8: existing accounts have shorter passwords and
    # must still be able to log in (and then be rehashed).
    password: str = Field(..., min_length=1)


class UserProfileOut(BaseModel):
    id: str
    email: str
    full_name: str
    # Typed as a datetime rather than the column's TEXT. ISO-8601 serialises
    # identically, so this is not a wire change — but it survives Phase 9 turning
    # the column into a real timestamp.
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(
        default=TOKEN_TTL_SECONDS,
        description="Token lifetime in seconds. Without it a client only learns "
        "the token expired by receiving a 401.",
    )
    user: UserProfileOut
