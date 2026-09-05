import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const fastapiUrl = process.env.FASTAPI_URL || process.env.KUNDALI_API_URL || "http://127.0.0.1:8000";

    const res = await fetch(`${fastapiUrl}/v1/auth/me`, {
      headers: { Authorization: authHeader },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("API /api/v1/auth/me error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user profile", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
