"use client";

import { useSessionSync } from "@/features/auth/hooks/use-auth";

/**
 * Renders nothing; exists so the session check runs inside `QueryProvider`.
 * A hook needs a component, and putting it in the layout would make the whole
 * layout a client component.
 */
export function SessionSync() {
  useSessionSync();
  return null;
}
