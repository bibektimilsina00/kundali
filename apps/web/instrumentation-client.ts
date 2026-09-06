import posthog from "posthog-js";

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const tracingHeaders = [window.location.hostname];

try {
  tracingHeaders.push(
    new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").hostname,
  );
} catch {
  if (process.env.NODE_ENV === "development") {
    console.warn("NEXT_PUBLIC_API_BASE_URL is not a valid URL; PostHog tracing headers will not be sent to it.");
  }
}

if (!projectToken || !host) {
  if (process.env.NODE_ENV === "development") {
    const missingVariable = projectToken
      ? "NEXT_PUBLIC_POSTHOG_HOST"
      : "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN";

    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`
    );
  }
} else {
  posthog.init(projectToken, {
    api_host: host,
    defaults: "2026-01-30",
    capture_exceptions: true,
    tracing_headers: tracingHeaders,
    debug: process.env.NODE_ENV === "development",
  });
}
