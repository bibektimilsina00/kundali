"""FastAPI router for Kundali Milan (Matchmaking)."""

from __future__ import annotations

from fastapi import APIRouter

from app.astrology_core import build_chart
from app.astrology_core.milan import match_kundalis
from app.modules.kundali.service import _birth_moment, _to_schema
from app.modules.milan.schemas import MilanRequest, MilanResponse

router = APIRouter(prefix="/v1/milan", tags=["milan"])


@router.post("/match", response_model=MilanResponse)
def match(body: MilanRequest) -> MilanResponse:
    g_moment = _birth_moment(body.groom)
    b_moment = _birth_moment(body.bride)

    g_chart_raw = build_chart(g_moment)
    b_chart_raw = build_chart(b_moment)

    g_moon = next(p for p in g_chart_raw.planets if p.name == "Moon")
    b_moon = next(p for p in b_chart_raw.planets if p.name == "Moon")

    g_mars = next(p for p in g_chart_raw.planets if p.name == "Mars")
    b_mars = next(p for p in b_chart_raw.planets if p.name == "Mars")

    # Convert 0-indexed rashi to 1-indexed (1=Aries .. 12=Pisces)
    g_rashi = g_moon.sign_index + 1
    b_rashi = b_moon.sign_index + 1

    # Convert 0-indexed nakshatra to 1-indexed (1=Ashwini .. 27=Revati)
    g_nak = g_moon.nakshatra.index + 1
    b_nak = b_moon.nakshatra.index + 1

    g_mars_house = g_mars.house
    b_mars_house = b_mars.house

    result = match_kundalis(
        groom_rashi=g_rashi,
        groom_nak_idx=g_nak,
        groom_mars_house=g_mars_house,
        bride_rashi=b_rashi,
        bride_nak_idx=b_nak,
        bride_mars_house=b_mars_house,
    )

    g_schema = _to_schema(g_chart_raw, dasha_depth=2)
    b_schema = _to_schema(b_chart_raw, dasha_depth=2)

    return MilanResponse(
        groom_name=body.groom_name,
        bride_name=body.bride_name,
        total_guna=result["total_guna"],
        max_guna=result["max_guna"],
        percentage=result["percentage"],
        recommendation=result["recommendation"],
        kutas=result["kutas"],
        groom_manglik=result["groom_manglik"],
        bride_manglik=result["bride_manglik"],
        manglik_compatibility=result["manglik_compatibility"],
        groom_chart=g_schema,
        bride_chart=b_schema,
    )
