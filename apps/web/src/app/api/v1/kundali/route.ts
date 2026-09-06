import { proxy } from "@/lib/api/proxy";

/**
 * Previously this route rebuilt the request body field by field and, on any
 * FastAPI failure, spawned `scripts/calc_chart.py` per request. The rebuilt body
 * omitted `name`, which `BirthDetailsIn` requires — so FastAPI answered 422 every
 * time and *every chart in the product* was computed by a subprocess. Passing the
 * body through unchanged is both the fix and the deletion.
 *
 * The old code also defaulted a missing latitude/longitude to Kathmandu. A chart
 * for the wrong city renders perfectly and is entirely wrong; the API rejecting
 * it is the correct behaviour.
 */
export async function POST(req: Request) {
  return proxy(req, "/v1/kundali");
}
