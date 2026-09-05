from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query

from app.core.errors import AppError
from app.modules.places import repository
from app.modules.places.schemas import PlaceSearchOut
from app.modules.places.service import search_places

router = APIRouter(prefix="/v1/places", tags=["places"])


class PlaceIndexUnavailable(AppError):
    status_code = 503
    code = "place_index_unavailable"


@router.get(
    "",
    response_model=PlaceSearchOut,
    summary="Search birthplaces",
    description=(
        "Prefix search over 786,650 populated places. Every populated place in "
        "Nepal and India, plus everywhere worldwide with population >= 1000.\n\n"
        "Alternate names are searched too — GeoNames records Lumbini under the "
        "primary name 'Rummin-dei', so searching primary names alone would make "
        "it unfindable.\n\n"
        "Each result carries an **IANA zone name**, resolved here rather than "
        "guessed by the client."
    ),
)
async def search(
    q: Annotated[str, Query(min_length=2, max_length=80, description="Place name")],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
) -> PlaceSearchOut:
    try:
        return search_places(q, limit)
    except repository.PlaceIndexMissing as exc:
        raise PlaceIndexUnavailable(str(exc)) from exc
