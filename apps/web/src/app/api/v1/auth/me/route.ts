import { NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const fastapiUrl = process.env.FASTAPI_URL || process.env.KUNDALI_API_URL || "http://127.0.0.1:8000";

    // 1. Try FastAPI microservice endpoint
    try {
      const res = await fetch(`${fastapiUrl}/v1/auth/me`, {
        headers: { Authorization: authHeader },
      });

      if (res.ok || res.status === 401 || res.status === 404) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      }
    } catch (e) {
      console.warn("FastAPI auth me proxy connection error, using local Python fallback:", e);
    }

    // 2. Local Python execution fallback
    const apiDir = path.resolve(process.cwd(), "../../apps/api");
    const fallbackApiDir = path.resolve(process.cwd(), "../api");

    const fs = await import("fs");
    const targetApiDir = fs.existsSync(apiDir) ? apiDir : fallbackApiDir;

    const pythonExe =
      process.env.PYTHON_PATH ||
      (fs.existsSync(path.join(targetApiDir, ".venv/bin/python"))
        ? path.join(targetApiDir, ".venv/bin/python")
        : "python3");

    const scriptPath = path.join(targetApiDir, "scripts/run_auth.py");

    const outputJson = await new Promise<string>((resolve, reject) => {
      execFile(
        pythonExe,
        [scriptPath, "me", "{}", authHeader],
        { cwd: targetApiDir, maxBuffer: 10 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            console.error("Python auth me error:", stderr);
            return reject(error);
          }
          resolve(stdout.trim());
        }
      );
    });

    const parsed = JSON.parse(outputJson);
    const statusCode = parsed.status || 200;
    if (parsed.status) delete parsed.status;

    return NextResponse.json(parsed, { status: statusCode });

  } catch (err: any) {
    console.error("API /api/v1/auth/me error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user profile", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
