const API_URL = process.env.FASTAPI_URL || process.env.KUNDALI_API_URL || "http://127.0.0.1:8000";

/**
 * Birthplace search. Forwards the query string to FastAPI, which resolves the
 * IANA zone from a 786k-row GeoNames index.
 */
export async function GET(req: Request) {
  const search = new URL(req.url).search;
  try {
    const res = await fetch(`${API_URL}/v1/places${search}`);
    return Response.json(await res.json(), { status: res.status });
  } catch (err) {
    console.error("proxy /v1/places failed", err);
    return Response.json(
      { error: { code: "service_unavailable", message: "Could not search birthplaces." } },
      { status: 502 },
    );
  }
}
