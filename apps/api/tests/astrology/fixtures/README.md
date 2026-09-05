# Golden chart fixtures

Each file is one birth moment plus the full chart this engine is expected to
produce for it. `pytest` asserts reproduction on every run.

**A fixture's `expected` block is only meaningful once a human has confirmed it
against an independent implementation.** Freezing this engine's own output
without that check produces a regression test that faithfully locks in a bug.
That is why `verified_against` exists and why `verify_chart.py --write` refuses
to run without it.

## Verifying one

```bash
make chart FIXTURE=nepal_pre_1986          # print it
# compare against Jagannatha Hora / AstroSage / an astrologer
uv run python scripts/verify_chart.py --fixture nepal_pre_1986 \
    --write --verified-against "Jagannatha Hora 8.0"
```

Check the ascendant sign and degree first — if that is right, the house
structure is right, and most other errors become visible. Then Moon's
nakshatra and pada (the dasha depends entirely on it), then the mahadasha
start dates.

Reference tools must be set to **Lahiri ayanamsa, whole-sign houses, mean node**
or they will legitimately disagree with us. See `docs/astrology-methodology.md`.

## Still to add

These need a chart computed before their birth data can be pinned down — find
each with `make chart`, then add the fixture:

| Case | Catches | How to find one |
|---|---|---|
| Lagna within 2' of a sign cusp | Ascendant rounding | Bisect the birth time until `lagna_degree` is near 0° or 30° |
| Moon at 0°00' of a nakshatra | Dasha balance = full period | Bisect until `balance_years` ≈ the lord's full years |
| Moon at 13°19' of a nakshatra | Dasha balance ≈ 0 | Bisect until `balance_years` ≈ 0 |
| Known Kaal Sarp chart | Node-span logic (Phase 1) | All seven grahas between Rahu and Ketu |
| Known *partial* Kaal Sarp | The partial branch (Phase 1) | Exactly one graha outside the span |
| Mangal dosha with cancellation | Cancellation rules (Phase 1) | Mars in 1/2/4/7/8/12 *and* in Aries, Scorpio, or Capricorn |
