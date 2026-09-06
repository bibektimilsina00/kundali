import { proxy } from "@/lib/api/proxy";

/** Prompt, model call and deterministic fallback live in `modules/report/`. */
export async function POST(req: Request) {
  return proxy(req, "/v1/report");
}
