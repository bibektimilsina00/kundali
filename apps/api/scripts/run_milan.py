import sys
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from app.astrology_core import build_chart
from app.astrology_core.milan import match_kundalis
from app.modules.kundali.schemas import BirthDetailsIn
from app.modules.kundali.service import _birth_moment, _to_schema

def main():
    if len(sys.argv) > 1:
        body = json.loads(sys.argv[1])
    else:
        body = json.load(sys.stdin)

    groom_in = BirthDetailsIn.model_validate(body["groom"])
    bride_in = BirthDetailsIn.model_validate(body["bride"])

    g_moment = _birth_moment(groom_in)
    b_moment = _birth_moment(bride_in)

    g_chart_raw = build_chart(g_moment)
    b_chart_raw = build_chart(b_moment)

    g_moon = next(p for p in g_chart_raw.planets if p.name == "Moon")
    b_moon = next(p for p in b_chart_raw.planets if p.name == "Moon")
    g_mars = next(p for p in g_chart_raw.planets if p.name == "Mars")
    b_mars = next(p for p in b_chart_raw.planets if p.name == "Mars")

    res = match_kundalis(
        groom_rashi=g_moon.sign_index + 1,
        groom_nak_idx=g_moon.nakshatra.index + 1,
        groom_mars_house=g_mars.house,
        bride_rashi=b_moon.sign_index + 1,
        bride_nak_idx=b_moon.nakshatra.index + 1,
        bride_mars_house=b_mars.house,
    )

    res["groom_name"] = body.get("groom_name", "Groom")
    res["bride_name"] = body.get("bride_name", "Bride")
    res["groom_chart"] = _to_schema(g_chart_raw, dasha_depth=2).model_dump(mode="json")
    res["bride_chart"] = _to_schema(b_chart_raw, dasha_depth=2).model_dump(mode="json")

    print(json.dumps(res))

if __name__ == "__main__":
    main()
