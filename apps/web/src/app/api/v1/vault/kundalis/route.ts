import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const fastapiUrl = process.env.FASTAPI_URL || process.env.KUNDALI_API_URL || "http://127.0.0.1:8000";

    const res = await fetch(`${fastapiUrl}/v1/vault/kundalis`, {
      headers: { Authorization: authHeader },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
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

    const res = await fetch(`${fastapiUrl}/v1/vault/kundalis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("API /api/v1/vault/kundalis POST error:", err);
    return NextResponse.json(
      { error: "Failed to save Kundali", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
