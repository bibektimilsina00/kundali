const API_URL = process.env.FASTAPI_URL || process.env.NAKHATRA_API_URL || process.env.KUNDALI_API_URL || "http://127.0.0.1:8000";

/**
 * Stream a synthesised mp3 through to the browser.
 *
 * Not `proxy()`: that helper parses JSON, and this is binary. An `<audio>` tag
 * also needs range requests and the right content type, so the upstream
 * response is passed through rather than rebuilt.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  try {
    const res = await fetch(`${API_URL}/v1/tts/audio/${encodeURIComponent(name)}`);
    if (!res.ok) return new Response(null, { status: res.status });
    return new Response(res.body, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "audio/mpeg",
        // Immutable: the filename is a hash of the text, so the bytes behind a
        // given name can never change.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("proxy /v1/tts/audio failed", err);
    return new Response(null, { status: 502 });
  }
}
