import { proxy } from "@/lib/api/proxy";

/**
 * The prompt and the ephemeral-key exchange moved to
 * `apps/api/src/app/modules/voice/`. `OPENAI_API_KEY` no longer needs to exist
 * in the web app at all.
 */
export async function POST(req: Request) {
  return proxy(req, "/v1/realtime-session");
}
