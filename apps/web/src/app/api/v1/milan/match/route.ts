import { NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fastapiUrl = process.env.FASTAPI_URL || process.env.KUNDALI_API_URL || "http://127.0.0.1:8000";

    // Try FastAPI service first
    try {
      const res = await fetch(`${fastapiUrl}/v1/milan/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("FastAPI service proxy error for Milan match, using local Python fallback:", e);
    }

    // Python direct fallback
    const apiDir = path.resolve(process.cwd(), "../../apps/api");
    const fallbackApiDir = path.resolve(process.cwd(), "../api");

    const fs = await import("fs");
    const targetApiDir = fs.existsSync(apiDir) ? apiDir : fallbackApiDir;

    const pythonExe =
      process.env.PYTHON_PATH ||
      (fs.existsSync(path.join(targetApiDir, ".venv/bin/python"))
        ? path.join(targetApiDir, ".venv/bin/python")
        : "python3");

    const matchScript = `
import json, sys
from app.astrology_core import build_chart
from app.astrology_core.milan import match_kundalis
from app.modules.kundali.service import _birth_moment, _to_schema

body = json.loads(sys.argv[1])
g_moment = _birth_moment(type("Obj", (), body["groom"])())
b_moment = _birth_moment(type("Obj", (), body["bride"])())

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
`;

    const scriptPath = path.join(targetApiDir, "scripts/run_milan.py");
    if (!fs.existsSync(scriptPath)) {
      fs.writeFileSync(scriptPath, matchScript);
    }

    const jsonInput = JSON.stringify(body);
    const outputJson = await new Promise<string>((resolve, reject) => {
      execFile(
        pythonExe,
        [scriptPath, jsonInput],
        { cwd: targetApiDir, maxBuffer: 10 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            console.error("Python Milan execution error:", stderr);
            return reject(error);
          }
          resolve(stdout.trim());
        }
      );
    });

    return NextResponse.json(JSON.parse(outputJson));
  } catch (err: any) {
    console.error("API /api/v1/milan/match error:", err);
    return NextResponse.json(
      { error: "Failed to calculate Milan match", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
