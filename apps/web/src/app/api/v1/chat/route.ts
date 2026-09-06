import { proxy } from "@/lib/api/proxy";

/**
 * The prompt, the model call and the response parsing moved to
 * `apps/api/src/app/modules/chat/` so the Flutter client can reach them —
 * a Next.js route is not reachable from the mobile app.
 */
export async function POST(req: Request) {
  return proxy(req, "/v1/chat");
}
