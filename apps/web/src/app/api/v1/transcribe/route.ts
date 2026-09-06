const API_URL = process.env.FASTAPI_URL || process.env.KUNDALI_API_URL || "http://127.0.0.1:8000";

/**
 * Forward a multipart upload to FastAPI.
 *
 * Not `proxy()`: that helper reads the body as text, which destroys a binary
 * audio part. The body is streamed through with its original Content-Type so the
 * multipart boundary survives.
 */
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const res = await fetch(`${API_URL}/v1/transcribe`, {
      method: "POST",
      headers: {
        ...(req.headers.get("content-type")
          ? { "Content-Type": req.headers.get("content-type")! }
          : {}),
        ...(auth ? { Authorization: auth } : {}),
      },
      body: req.body,
      // Required by fetch when streaming a request body.
      duplex: "half",
    } as RequestInit & { duplex: "half" });
    return Response.json(await res.json(), { status: res.status });
  } catch (err) {
    console.error("proxy /v1/transcribe failed", err);
    return Response.json(
      { error: { code: "service_unavailable", message: "Could not transcribe that audio." } },
      { status: 502 },
    );
  }
}
