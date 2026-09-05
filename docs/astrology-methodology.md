# Astrology Methodology

Spec §54 requires the platform to state which Vedic methodology it uses,
because different astrologers reach different conclusions from the same birth
data. This document is that statement. It is also the specification
`astrology_core` is implemented and tested against.

**Every value here is a decision, not a fact.** Each one names what changes if
you pick differently.

---

## Decisions

| Parameter | Choice | Swiss Ephemeris | Changing it… |
|---|---|---|---|
| Zodiac | Sidereal | `SEFLG_SIDEREAL` | Tropical shifts every planet ~24° — a different product |
| Ayanamsa | **Lahiri (Chitrapaksha)** | `SIDM_LAHIRI` | Raman/KP shift positions ~1°; planets near a cusp change sign |
| House system | **Whole Sign** (bhava = rashi) | computed, not `swe_houses` | Placidus/Sripati move planets between houses; ~30% of placements change |
| Lunar nodes | **Mean** Rahu/Ketu | `SE_MEAN_NODE` | True node oscillates ±1.5°; changes Kaal Sarp edge cases and nakshatra at boundaries |
| Dasha | **Vimshottari**, 120y, from Moon's nakshatra | — | Ashtottari/Yogini give completely different period dates |
| Dasha depth | Maha → Antar → Pratyantar | — | — |
| Transits | **Gochar from Moon sign** (Chandra lagna) | — | From Lagna is also traditional; results differ |
| Chart display | **North Indian** (fixed houses, moving signs) | UI only | South Indian is a render option, not a calculation change |
| Planets | Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu | — | Uranus/Neptune/Pluto are not classical Vedic. Excluded. |

**Rationale for the defaults:** Lahiri + Whole Sign + Vimshottari + Mean node
+ North Indian chart is the mainstream configuration in Nepal and North India,
which is the launch market. It is also what a user comparing our chart against
a local panchang or a family astrologer will most often see.

Per spec §53 the user is **never** asked to choose these. Expose them read-only
under "Advanced astrology settings"; make them configurable only if real
demand appears — and note that making ayanamsa per-user invalidates every
cached chart.

---

## Time zones

The single largest source of silent wrong charts.

- Store the **IANA zone name** (`Asia/Kathmandu`) on the birth profile.
  **Never store a UTC offset.**
- Resolve the offset at calculation time from the zone + the birth *date*,
  using `zoneinfo` with an up-to-date `tzdata`.

Why it matters concretely: Kathmandu ran local mean time (**+5:41:16**) until
1920, then **+5:30** until 1986, then **+5:45**. A birth in 1975 stored as
`+05:45` is **15 minutes** wrong — about 3.75° of ascendant motion, so roughly
1 birth in 8 lands in the wrong sign and inherits an entirely wrong house
structure.

Do not take those offsets (or the ones below) from memory, including this
document's — read them from `zoneinfo` and assert them in a test. This
paragraph was wrong in its first draft and `test_historical_offsets` is what
caught it.

India (`Asia/Kolkata`) has the same problem pre-1955, plus wartime DST in
1941–45. Any birth in a country with historical DST needs the same care.

Ambiguous/nonexistent local times (DST transitions): resolve with
`fold=0` and record that the chart is at a DST boundary, so the UI can note it.

**Sunrise-based day boundary:** Vedic day changes at local sunrise, not
midnight. This affects Panchang/tithi and the "today" boundary for horoscopes,
not the natal chart. MVP uses local midnight for the horoscope date; note it in
the methodology page and revisit if users flag it.

---

## Computation pipeline

```
birth_profile (date, time, tz_name, lat, lon)
  → local datetime → UTC → Julian Day (swe_julday)
  → ayanamsa at that JD (swe_get_ayanamsa_ut, SIDM_LAHIRI)
  → sidereal longitudes for 9 grahas (swe_calc_ut, SEFLG_SIDEREAL)
  → Lagna: sidereal ascendant from JD + lat/lon
  → houses: whole-sign from Lagna's sign
  → per planet: sign, house, degree-in-sign, nakshatra, pada,
                retrograde, combust, dignity
  → aspects (drishti)
  → yogas, doshas
  → vimshottari dasha tree from Moon's nakshatra
  → Chart  (frozen dataclass)
```

Pure function. No database, no network, no clock — the birth moment is an
argument. This is what makes it testable.

---

## Rules

### Dignity
Exaltation / debilitation degrees (classical):

| Planet | Exalted | Debilitated |
|---|---|---|
| Sun | Aries 10° | Libra 10° |
| Moon | Taurus 3° | Scorpio 3° |
| Mars | Capricorn 28° | Cancer 28° |
| Mercury | Virgo 15° | Pisces 15° |
| Jupiter | Cancer 5° | Capricorn 5° |
| Venus | Pisces 27° | Virgo 27° |
| Saturn | Libra 20° | Aries 20° |

Also computed: own sign, moolatrikona, friend/neutral/enemy sign (natural
relationships table in `constants.py`).

### Combustion (asta)
Distance from Sun, in degrees:
Moon 12° · Mars 17° · Mercury 14° (12° if retrograde) · Jupiter 11° ·
Venus 10° (8° if retrograde) · Saturn 15°.

### Aspects (graha drishti)
All planets aspect the 7th from themselves. Additionally:
Mars → 4th, 8th · Jupiter → 5th, 9th · Saturn → 3rd, 10th.
Rahu/Ketu: treated as aspecting 5th, 7th, 9th (a choice — some schools give
them no drishti; documented here so results are reproducible).

Whole-sign counting, inclusive.

### Nakshatra
27 nakshatras × 13°20′. Pada = quarter (3°20′). Lord from the Vimshottari
sequence: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury, repeating.

### Vimshottari dasha
Total 120 years. Ketu 7 · Venus 20 · Sun 6 · Moon 10 · Mars 7 · Rahu 18 ·
Jupiter 16 · Saturn 19 · Mercury 17.

Balance at birth = remaining fraction of the Moon's nakshatra span × that
lord's years. Antardasha within a mahadasha is proportional
(`maha_years × antar_years / 120`); pratyantar recurses the same way.

Use a fixed 365.25-day year for period arithmetic and document it — different
software uses different conventions and dates will differ by days.

### Yogas (MVP set)
Detect these and nothing else. Per spec §21, listing 200 yogas without
explaining significance is anti-product.

Panch Mahapurusha (Ruchaka, Bhadra, Hamsa, Malavya, Sasa) · Gaja Kesari ·
Budhaditya · Chandra-Mangala · Dhana yogas (2nd/11th lord relationships) ·
Raja yogas (kendra lord + trikona lord conjunction/exchange) ·
Neecha Bhanga · Kemadruma.

Each detector returns: name, planets involved, houses involved, whether the
cancellation/strength conditions hold, and a strength band
(`strong | moderate | weak`). Never a bare boolean — the AI needs the
qualification to write an honest answer.

### Doshas (MVP set)
- **Mangal (Kuja) dosha** — Mars in house 1, 2, 4, 7, 8, or 12. Checked from
  **Lagna, Moon, and Venus** separately; report which. Include standard
  cancellations (Mars in own/exalted sign, Mars in Aries/Scorpio/Capricorn,
  both partners affected).
- **Kaal Sarp** — all seven grahas between Rahu and Ketu. Report *partial* when
  one planet falls outside; this is the common case and calling it full is
  needlessly alarming.
- **Sade Sati** — Saturn transiting the 12th, 1st, or 2nd from the natal Moon
  sign. Transit-dependent, with start/end dates.
- **Pitru dosha** — Sun or Rahu in the 9th, or the 9th lord afflicted.

Every dosha result carries `severity` and the cancellation conditions that were
checked. Spec §22: the AI must not frighten users, and it can only avoid that
if the engine hands it nuance instead of a yes/no.

---

## Output contract

`Chart` is a frozen dataclass, serialised to JSONB, and is the **only** thing
the AI layer ever sees:

```python
Chart(
    computed_at, engine_version, ayanamsa_name, ayanamsa_value,
    julian_day, lagna: Sign, lagna_degree,
    planets: list[Planet],        # sign, house, degree, nakshatra, pada,
                                  # retrograde, combust, dignity, aspects_to
    houses: list[House],          # sign, lord, occupants
    yogas: list[Yoga],            # name, planets, houses, strength, active
    doshas: list[Dosha],          # name, present, severity, cancellations
    dasha: DashaTree,             # 3 levels with start/end dates
)
```

`engine_version` is bumped on **any** change to constants or rules. Charts with
an old version are recomputed on next read, never migrated in place.

---

## Testing

This is the part that cannot be skipped. Everything downstream — the AI, the
horoscope, user trust — is worthless if the chart is wrong, and a wrong chart
looks exactly like a right one.

**Golden charts.** 20–30 fixtures in `tests/astrology/fixtures/*.json`, each a
birth moment plus its full expected output, verified once against an
independent implementation (Jagannatha Hora, AstroSage, or a professional
astrologer). Every run asserts the current engine reproduces them exactly.

Fixtures must cover:

| Case | Catches |
|---|---|
| Pre-1986 Nepal birth | Historical tz offset |
| Pre-1955 India birth | Historical tz offset |
| India 1942 birth | Wartime DST |
| Southern hemisphere | Latitude sign errors |
| Latitude > 60° | Ascendant edge cases |
| Birth within 2 min of a sign cusp | Lagna rounding |
| Birth at local midnight | Date rollover |
| Retrograde Mercury, combust Venus | Flag computation |
| Moon at 0°00′ of a nakshatra | Dasha balance boundary |
| Moon at 13°19′ of a nakshatra | Dasha balance boundary |
| Known Kaal Sarp chart | Node-span logic |
| Known partial Kaal Sarp | The partial branch |
| Known Mangal dosha with cancellation | Cancellation logic |

**Property tests** (hypothesis) for the invariants a golden chart can't cover:

- Every planet's house ∈ 1..12; every longitude ∈ [0, 360)
- Whole-sign: `house == ((planet.sign - lagna.sign) mod 12) + 1`, always
- Dasha periods are contiguous, non-overlapping, and sum to 120 years
- Every antardasha lies strictly inside its mahadasha
- `chart(t)` is deterministic — same input, byte-identical output

**Cross-check script** (`scripts/verify_chart.py`) that prints a chart in a
format you can diff against a reference tool by eye. Run it whenever a rule
changes.

Rule: **a change to `astrology_core` that alters any golden chart is a
breaking change.** Bump `engine_version`, update the fixture deliberately with
a note in the commit explaining which reference confirmed the new value, and
invalidate cached charts.
