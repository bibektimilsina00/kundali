"""Schemas for Cloud Vault (Saved Kundalis and Chat Sessions)."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SavedKundaliIn(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    gender: str = Field("male", pattern="^(male|female)$")
    dob: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    tob: str = Field(..., pattern=r"^\d{2}:\d{2}(:\d{2})?$")
    lat: float
    lon: float
    tz_offset: float
    place_name: str


class SavedKundaliOut(SavedKundaliIn):
    id: str
    user_id: str
    created_at: str


class ChatMessageIn(BaseModel):
    sender: str = Field(..., pattern="^(user|astrologer)$")
    content: str = Field(..., min_length=1)


class ChatMessageOut(ChatMessageIn):
    id: str
    session_id: str
    created_at: str


class ChatSessionIn(BaseModel):
    title: str = Field("Kundali Chat", min_length=1, max_length=200)
    kundali_id: str | None = None


class ChatSessionOut(BaseModel):
    id: str
    user_id: str
    kundali_id: str | None = None
    title: str
    created_at: str
    updated_at: str
    messages: list[ChatMessageOut] = []
