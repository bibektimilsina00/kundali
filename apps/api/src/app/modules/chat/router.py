"""Astrologer chat endpoint. Routes only."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.modules.auth.router_deps import get_current_user
from app.modules.chat import service
from app.modules.chat.schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/v1", tags=["chat"])


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Ask the astrologer about a chart",
    description=(
        "Answers a question against an already-computed chart. The chart is "
        "supplied by the caller and read, never recalculated — the model is not "
        "asked to derive positions or dates."
    ),
)
async def chat(
    body: ChatRequest,
    # Not optional: this endpoint spends money per call. Unauthenticated, it is
    # an open proxy to a paid model.
    user_id: str = Depends(get_current_user),
) -> ChatResponse:
    return await service.answer(body)
