import { proxy } from "@/lib/api/proxy";

/**
 * Synthesis, the fallback engine and the disk cache all moved to
 * `apps/api/src/app/modules/voice/`. The cache is served by the API too — it
 * used to live in `public/audio-cache/`, which only worked while the Next app
 * was the only client.
 */
export async function POST(req: Request) {
  return proxy(req, "/v1/tts");
}
