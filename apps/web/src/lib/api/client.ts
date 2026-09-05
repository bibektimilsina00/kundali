/**
 * One fetch wrapper. Every request goes through it so error translation and
 * auth live in exactly one place.
 */

import { ApiError, type ApiErrorBody, NetworkError } from "./errors";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, signal }: RequestOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch only rejects on a transport failure; an HTTP error is a resolved
    // promise, which is the single most common source of "why did my error
    // handler not run".
    throw new NetworkError();
  }

  if (!response.ok) {
    const parsed = await response
      .json()
      .catch(() => undefined as ApiErrorBody | undefined);
    throw new ApiError(response.status, parsed);
  }

  return (await response.json()) as T;
}
