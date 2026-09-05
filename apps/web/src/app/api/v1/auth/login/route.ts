import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fastapiUrl = process.env.FASTAPI_URL || process.env.KUNDALI_API_URL || "http://127.0.0.1:8000";

    const res = await fetch(`${fastapiUrl}/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("API /api/v1/auth/login error:", err);
    return NextResponse.json(
      { error: "Failed to process login", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
