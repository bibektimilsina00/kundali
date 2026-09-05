import { NextResponse } from "next/server";
import { execFile } from "child_process";
import path from "path";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const fastapiUrl = process.env.FASTAPI_URL || process.env.KUNDALI_API_URL || "http://127.0.0.1:8000";

    // 1. Try FastAPI
    try {
      const res = await fetch(`${fastapiUrl}/v1/vault/kundalis`, {
        headers: { Authorization: authHeader },
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("FastAPI vault kundalis GET fallback:", e);
    }

    // 2. Python fallback
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
        [scriptPath, "list_kundalis", "{}", authHeader],
        { cwd: targetApiDir, maxBuffer: 10 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            return resolve("[]");
          }
          resolve(stdout.trim());
        }
      );
    });

    return NextResponse.json(JSON.parse(outputJson));

  } catch (err: any) {
    console.error("API /api/v1/vault/kundalis GET error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const body = await req.json();
    const fastapiUrl = process.env.FASTAPI_URL || process.env.KUNDALI_API_URL || "http://127.0.0.1:8000";

    // 1. Try FastAPI
    try {
      const res = await fetch(`${fastapiUrl}/v1/vault/kundalis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (e) {
      console.warn("FastAPI vault kundalis POST fallback:", e);
    }

    // 2. Python fallback
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
    const jsonInput = JSON.stringify(body);

    const outputJson = await new Promise<string>((resolve, reject) => {
      execFile(
        pythonExe,
        [scriptPath, "save_kundali", jsonInput, authHeader],
        { cwd: targetApiDir, maxBuffer: 10 * 1024 * 1024 },
        (error, stdout, stderr) => {
          if (error) {
            console.error("Python save_kundali error:", stderr);
            return reject(error);
          }
          resolve(stdout.trim());
        }
      );
    });

    return NextResponse.json(JSON.parse(outputJson));

  } catch (err: any) {
    console.error("API /api/v1/vault/kundalis POST error:", err);
    return NextResponse.json(
      { error: "Failed to save Kundali", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
