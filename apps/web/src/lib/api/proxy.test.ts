import { afterEach, describe, expect, it, vi } from "vitest";
import { proxy } from "./proxy";

/**
 * The proxy is the only thing between every client request and FastAPI, so the
 * three rules it enforces are worth pinning: forward the token, pass the body
 * through byte for byte, and never leak upstream detail to the caller.
 */

afterEach(() => vi.unstubAllGlobals());

function captureFetch(response: Response) {
  const calls: Array<{ url: string; init: RequestInit }> = [];
  vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return Promise.resolve(response);
  });
  return calls;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

describe("proxy", () => {
  it("passes the body through unchanged", async () => {
    const calls = captureFetch(json({ ok: true }));
    // A field the proxy does not know about must still arrive. Rebuilding the
    // body is what silently dropped `name` and broke chart generation.
    const body = JSON.stringify({ name: "Someone", unknown_future_field: 1 });
    await proxy(new Request("http://x/api", { method: "POST", body }), "/v1/kundali");

    expect(calls[0].init.body).toBe(body);
    expect(calls[0].url).toContain("/v1/kundali");
  });

  it("forwards the Authorization header when present", async () => {
    const calls = captureFetch(json({ ok: true }));
    await proxy(
      new Request("http://x/api", {
        method: "POST",
        body: "{}",
        headers: { Authorization: "Bearer t0ken" },
      }),
      "/v1/chat",
    );
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBe("Bearer t0ken");
  });

  it("omits Authorization entirely when there is none", async () => {
    const calls = captureFetch(json({ ok: true }));
    await proxy(new Request("http://x/api", { method: "POST", body: "{}" }), "/v1/chat");
    expect((calls[0].init.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("sends no body on GET", async () => {
    const calls = captureFetch(json([]));
    await proxy(new Request("http://x/api"), "/v1/vault/kundalis");
    expect(calls[0].init.body).toBeUndefined();
  });

  it("preserves the upstream status and error envelope", async () => {
    captureFetch(json({ error: { code: "invalid_credentials", message: "no" } }, 401));
    const res = await proxy(new Request("http://x/api", { method: "POST", body: "{}" }), "/v1/auth/login");
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe("invalid_credentials");
  });

  it("masks the reason when the backend is unreachable", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new Error("ECONNREFUSED 10.0.0.7:8000")));
    const res = await proxy(new Request("http://x/api", { method: "POST", body: "{}" }), "/v1/chat");
    expect(res.status).toBe(502);
    // Internal hosts and upstream detail must not reach the browser.
    expect(JSON.stringify(await res.json())).not.toContain("ECONNREFUSED");
  });

  it("does not forward a non-JSON upstream response", async () => {
    captureFetch(new Response("<html>502 Bad Gateway</html>", { status: 502 }));
    const res = await proxy(new Request("http://x/api", { method: "POST", body: "{}" }), "/v1/chat");
    expect((await res.json()).error.code).toBe("bad_gateway");
  });
});
