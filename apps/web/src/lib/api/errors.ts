/**
 * The API's error envelope, shared with the Flutter client.
 *
 * Every failure is `{error: {code, message, details}}` (docs/architecture.md §7).
 * Switch on `code`; never parse `message` — it is human-facing copy and a
 * wording change must not be a breaking change.
 */

export type ApiErrorBody = {
  error: { code: string; message: string; details?: Record<string, string> };
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: Record<string, string>;

  constructor(status: number, body: Partial<ApiErrorBody> | undefined) {
    const error = body?.error;
    super(error?.message ?? "Something went wrong.");
    this.name = "ApiError";
    this.status = status;
    this.code = error?.code ?? "unknown_error";
    this.details = error?.details ?? {};
  }

  /** Field-level messages for a 422, keyed by field name. */
  get fieldErrors(): Record<string, string> {
    return this.code === "validation_error" ? this.details : {};
  }
}

export class NetworkError extends Error {
  constructor() {
    super("Could not reach the server.");
    this.name = "NetworkError";
  }
}
