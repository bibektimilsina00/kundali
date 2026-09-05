import { NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if FASTAPI_URL microservice is configured
    const fastapiUrl = process.env.FASTAPI_URL || process.env.KUNDALI_API_URL;
    if (fastapiUrl) {
      try {
        const res = await fetch(`${fastapiUrl}/v1/kundali`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: body.date,
            time: body.time,
            tz_name: body.tz_name || "Asia/Kathmandu",
            latitude: body.latitude ?? 27.7172,
            longitude: body.longitude ?? 85.3240,
            place_label: body.place_label || "Kathmandu",
            time_accuracy: body.time_accuracy || "exact",
          }),
        });
        if (res.ok) {
          const chart = await res.json();
          return NextResponse.json(chart);
        }
      } catch (fastapiErr) {
        console.warn("FastAPI service proxy connection error, using local Python fallback:", fastapiErr);
      }
    }

    // Absolute path to the python script and venv python executable
    const apiDir = path.resolve(process.cwd(), "../../apps/api");
    const fallbackApiDir = path.resolve(process.cwd(), "../api");

    const fs = await import("fs");
    const targetApiDir = fs.existsSync(apiDir) ? apiDir : fallbackApiDir;

    const pythonExe =
      process.env.PYTHON_PATH ||
      (fs.existsSync(path.join(targetApiDir, ".venv/bin/python"))
        ? path.join(targetApiDir, ".venv/bin/python")
        : "python3");
    const scriptPath = path.join(targetApiDir, "scripts/calc_chart.py");

    const jsonInput = JSON.stringify({
      date: body.date,
      time: body.time,
      tz_name: body.tz_name || "Asia/Kathmandu",
      latitude: body.latitude ?? 27.7172,
      longitude: body.longitude ?? 85.3240,
      place_label: body.place_label || "Kathmandu",
      time_accuracy: body.time_accuracy || "exact",
    });

    const chartJson = await new Promise<string>((resolve, reject) => {
      execFile(
        pythonExe,
        [scriptPath, jsonInput],
        { cwd: targetApiDir, maxBuffer: 10 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            console.error("Python Swiss Ephemeris execution error:", stderr);
            return reject(error);
          }
          resolve(stdout.trim());
        }
      );
    });

    const chart = JSON.parse(chartJson);
    return NextResponse.json(chart);
  } catch (err: any) {
    console.error("API /api/v1/kundali error:", err);
    return NextResponse.json(
      { error: "Failed to calculate astronomical chart", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
