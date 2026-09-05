import sys
import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from app.astrology_core import build_chart
from app.astrology_core.models import BirthMoment

def main():
    if len(sys.argv) > 1:
        data = json.loads(sys.argv[1])
    else:
        data = json.load(sys.stdin)

    date_str = data["date"]
    time_str = data["time"]
    
    dt = None
    for fmt in ("%Y-%m-%d %H:%M", "%Y-%m-%d %I:%M %p", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d %I:%M:%S %p"):
        try:
            dt = datetime.strptime(f"{date_str} {time_str}", fmt)
            break
        except ValueError:
            pass
            
    if dt is None:
        raise ValueError(f"Could not parse date/time: {date_str} {time_str}")

    birth = BirthMoment(
        local_datetime=dt,
        tz_name=data.get("tz_name", "Asia/Kathmandu"),
        latitude=float(data.get("latitude", 27.7172)),
        longitude=float(data.get("longitude", 85.3240)),
        time_accuracy=data.get("time_accuracy", "exact"),
    )

    chart = build_chart(birth)
    print(json.dumps(chart.to_dict()))

if __name__ == "__main__":
    main()
