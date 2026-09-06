"""Report endpoint. Routes only."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.modules.auth.router_deps import get_current_user
from app.modules.report import service
from app.modules.report.schemas import ReportRequest, ReportResponse

router = APIRouter(prefix="/v1", tags=["report"])


@router.post(
    "/report",
    response_model=ReportResponse,
    summary="Generate a seven-section reading for a chart",
    description=(
        "Reads an already-computed chart. `source` says whether the model or the "
        "deterministic generator produced it; both return the same seven sections."
    ),
)
async def report(
    body: ReportRequest,
    user_id: str = Depends(get_current_user),
) -> ReportResponse:
    return await service.generate_report(body)
