"""Divisional charts (vargas).

Each varga slices every sign into N parts and maps each part onto a sign. The
mapping rule differs per varga — there is no single formula — so each is
written out explicitly below with the rule it implements. Getting one wrong
produces a chart that looks entirely plausible, so every rule is stated rather
than derived.

Rules are Parashari (BPHS). The Shodasavarga set is implemented.
"""

from __future__ import annotations

from dataclasses import dataclass

from app.astrology_core.constants import DEGREES_PER_SIGN, SIGN_LORDS, SIGNS

# Sign natures, used by several varga rules.
MOVABLE = (0, 3, 6, 9)      # Aries, Cancer, Libra, Capricorn
FIXED = (1, 4, 7, 10)       # Taurus, Leo, Scorpio, Aquarius
# Dual (Gemini, Virgo, Sagittarius, Pisces) is everything else.

FIRE, EARTH, AIR, WATER = 0, 1, 2, 3


def _nature(sign: int) -> str:
    if sign in MOVABLE:
        return "movable"
    if sign in FIXED:
        return "fixed"
    return "dual"


def _part(longitude: float, divisions: int) -> tuple[int, int]:
    """(sign index, which part of that sign) for a longitude."""
    lon = longitude % 360.0
    sign = int(lon // DEGREES_PER_SIGN)
    degree = lon - sign * DEGREES_PER_SIGN
    part = min(int(degree // (DEGREES_PER_SIGN / divisions)), divisions - 1)
    return sign, part


# --- one function per varga ------------------------------------------------


def d1(lon: float) -> int:
    """Rasi — the birth chart itself."""
    return _part(lon, 1)[0]


def d2(lon: float) -> int:
    """Hora — wealth. Odd sign: first half Leo, second half Cancer. Even sign
    reversed."""
    sign, part = _part(lon, 2)
    odd = sign % 2 == 0  # Aries is the 1st sign, so index 0 is odd
    if odd:
        return 4 if part == 0 else 3   # Leo, Cancer
    return 3 if part == 0 else 4


def d3(lon: float) -> int:
    """Drekkana — siblings. 1st third the sign itself, then the 5th, then the 9th."""
    sign, part = _part(lon, 3)
    return (sign + part * 4) % 12


def d4(lon: float) -> int:
    """Chaturthamsa — property, fortune. Sign, then 4th, 7th, 10th from it."""
    sign, part = _part(lon, 4)
    return (sign + part * 3) % 12


def d7(lon: float) -> int:
    """Saptamsa — children. Odd signs count from the sign, even from the 7th."""
    sign, part = _part(lon, 7)
    start = sign if sign % 2 == 0 else (sign + 6) % 12
    return (start + part) % 12


def d9(lon: float) -> int:
    """Navamsa — marriage, and the single most-used varga after the rasi.

    Equivalent to the classical movable/fixed/dual starting rule: movable signs
    start from themselves, fixed from the 9th, dual from the 5th.
    """
    sign, part = _part(lon, 9)
    return (sign * 9 + part) % 12


def d10(lon: float) -> int:
    """Dasamsa — career. Odd signs count from the sign, even from the 9th."""
    sign, part = _part(lon, 10)
    start = sign if sign % 2 == 0 else (sign + 8) % 12
    return (start + part) % 12


def d12(lon: float) -> int:
    """Dwadasamsa — parents. Counted from the sign itself."""
    sign, part = _part(lon, 12)
    return (sign + part) % 12


def d16(lon: float) -> int:
    """Shodasamsa — vehicles, comforts. Movable from Aries, fixed from Leo,
    dual from Sagittarius."""
    sign, part = _part(lon, 16)
    start = {"movable": 0, "fixed": 4, "dual": 8}[_nature(sign)]
    return (start + part) % 12


def d20(lon: float) -> int:
    """Vimsamsa — spiritual practice. Movable from Aries, fixed from
    Sagittarius, dual from Leo."""
    sign, part = _part(lon, 20)
    start = {"movable": 0, "fixed": 8, "dual": 4}[_nature(sign)]
    return (start + part) % 12


def d24(lon: float) -> int:
    """Siddhamsa — learning. Odd signs from Leo, even from Cancer."""
    sign, part = _part(lon, 24)
    start = 4 if sign % 2 == 0 else 3
    return (start + part) % 12


def d27(lon: float) -> int:
    """Bhamsa — strengths and weaknesses. Fire from Aries, earth from Cancer,
    air from Libra, water from Capricorn."""
    sign, part = _part(lon, 27)
    start = (0, 3, 6, 9)[sign % 4]
    return (start + part) % 12


# Trimsamsa is the one varga with unequal parts.
# Odd signs: Mars 5, Saturn 5, Jupiter 8, Mercury 7, Venus 5 degrees.
# Even signs: the same spans mirrored, ruled Venus, Mercury, Jupiter, Saturn, Mars.
_TRIMSAMSA_ODD = ((5.0, 0), (10.0, 10), (18.0, 8), (25.0, 2), (30.0, 6))
_TRIMSAMSA_EVEN = ((5.0, 1), (12.0, 5), (20.0, 11), (25.0, 9), (30.0, 7))


def d30(lon: float) -> int:
    """Trimsamsa — misfortune. Unequal five-part division by planetary rulership."""
    lon = lon % 360.0
    sign = int(lon // DEGREES_PER_SIGN)
    degree = lon - sign * DEGREES_PER_SIGN
    table = _TRIMSAMSA_ODD if sign % 2 == 0 else _TRIMSAMSA_EVEN
    for upper, result in table:
        if degree < upper:
            return result
    return table[-1][1]


def d40(lon: float) -> int:
    """Khavedamsa — auspicious and inauspicious effects. Odd signs from Aries,
    even from Libra."""
    sign, part = _part(lon, 40)
    start = 0 if sign % 2 == 0 else 6
    return (start + part) % 12


def d45(lon: float) -> int:
    """Akshavedamsa — general character. Movable from Aries, fixed from Leo,
    dual from Sagittarius."""
    sign, part = _part(lon, 45)
    start = {"movable": 0, "fixed": 4, "dual": 8}[_nature(sign)]
    return (start + part) % 12


def d60(lon: float) -> int:
    """Shashtiamsa — the finest classical division, used for past-life karma."""
    sign, part = _part(lon, 60)
    return (sign + part) % 12


@dataclass(frozen=True, slots=True)
class VargaDefinition:
    code: str
    name: str
    meaning: str
    divisions: int


VARGAS: tuple[VargaDefinition, ...] = (
    VargaDefinition("D1", "Lagna", "Birth chart — the whole life", 1),
    VargaDefinition("D2", "Hora", "Wealth and income", 2),
    VargaDefinition("D3", "Drekkana", "Siblings and courage", 3),
    VargaDefinition("D4", "Chaturthamsa", "Property and fortune", 4),
    VargaDefinition("D7", "Saptamsa", "Children and progeny", 7),
    VargaDefinition("D9", "Navamsa", "Marriage and inner strength", 9),
    VargaDefinition("D10", "Dasamsa", "Career and status", 10),
    VargaDefinition("D12", "Dwadasamsa", "Parents and ancestry", 12),
    VargaDefinition("D16", "Shodasamsa", "Vehicles and comforts", 16),
    VargaDefinition("D20", "Vimsamsa", "Spiritual practice", 20),
    VargaDefinition("D24", "Siddhamsa", "Learning and education", 24),
    VargaDefinition("D27", "Bhamsa", "Strengths and weaknesses", 27),
    VargaDefinition("D30", "Trimsamsa", "Misfortune and difficulty", 30),
    VargaDefinition("D40", "Khavedamsa", "Maternal legacy", 40),
    VargaDefinition("D45", "Akshavedamsa", "Paternal legacy and character", 45),
    VargaDefinition("D60", "Shashtiamsa", "Past-life karma — the finest division", 60),
)

_MAPPERS = {
    "D1": d1, "D2": d2, "D3": d3, "D4": d4, "D7": d7, "D9": d9,
    "D10": d10, "D12": d12, "D16": d16, "D20": d20, "D24": d24,
    "D27": d27, "D30": d30, "D40": d40, "D45": d45, "D60": d60,
}


@dataclass(frozen=True, slots=True)
class VargaPlacement:
    planet: str
    sign_index: int
    sign: str
    house: int


@dataclass(frozen=True, slots=True)
class VargaChart:
    code: str
    name: str
    meaning: str
    divisions: int
    lagna_sign_index: int
    lagna_sign: str
    placements: tuple[VargaPlacement, ...]

    def house_signs(self) -> tuple[int, ...]:
        """Whole-sign houses of this varga, from its own lagna."""
        return tuple((self.lagna_sign_index + i) % 12 for i in range(12))


def build_varga(
    code: str, ascendant_longitude: float, planet_longitudes: dict[str, float]
) -> VargaChart:
    """A divisional chart is a full chart in its own right: the ascendant is
    mapped through the same division, and houses are counted from it."""
    definition = next(v for v in VARGAS if v.code == code)
    mapper = _MAPPERS[code]

    lagna_sign = mapper(ascendant_longitude)
    placements = tuple(
        VargaPlacement(
            planet=name,
            sign_index=(sign := mapper(lon)),
            sign=SIGNS[sign],
            house=((sign - lagna_sign) % 12) + 1,
        )
        for name, lon in planet_longitudes.items()
    )
    return VargaChart(
        code=definition.code,
        name=definition.name,
        meaning=definition.meaning,
        divisions=definition.divisions,
        lagna_sign_index=lagna_sign,
        lagna_sign=SIGNS[lagna_sign],
        placements=placements,
    )


def build_all_vargas(
    ascendant_longitude: float, planet_longitudes: dict[str, float]
) -> tuple[VargaChart, ...]:
    return tuple(
        build_varga(v.code, ascendant_longitude, planet_longitudes) for v in VARGAS
    )


def sign_lord(sign_index: int) -> str:
    return SIGN_LORDS[sign_index]
