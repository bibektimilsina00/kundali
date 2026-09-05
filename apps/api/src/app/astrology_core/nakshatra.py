"""Nakshatra, pada, and the vimshottari lord. Pure arithmetic on a longitude."""

from __future__ import annotations

from app.astrology_core.constants import (
    DEGREES_PER_NAKSHATRA,
    DEGREES_PER_PADA,
    NAKSHATRAS,
    VIMSHOTTARI_ORDER,
)
from app.astrology_core.models import NakshatraPosition


def nakshatra_at(longitude: float) -> NakshatraPosition:
    lon = longitude % 360.0
    index = int(lon // DEGREES_PER_NAKSHATRA)
    # Guard the 359.999... case: floor could yield 27 with float error.
    index = min(index, 26)
    offset = lon - index * DEGREES_PER_NAKSHATRA
    pada = min(int(offset // DEGREES_PER_PADA) + 1, 4)
    return NakshatraPosition(
        index=index,
        name=NAKSHATRAS[index],
        pada=pada,
        lord=VIMSHOTTARI_ORDER[index % 9],
    )


def elapsed_fraction(longitude: float) -> float:
    """How far through its nakshatra a longitude sits, in [0, 1).

    This is the whole basis of the dasha balance at birth, so it is separated
    out and tested on its own.
    """
    lon = longitude % 360.0
    return (lon % DEGREES_PER_NAKSHATRA) / DEGREES_PER_NAKSHATRA
