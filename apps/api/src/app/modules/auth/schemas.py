from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class UserSignupIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=100)


class UserLoginIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserProfileOut(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileOut
