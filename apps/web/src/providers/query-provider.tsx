"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { makeQueryClient } from "@/lib/query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState, not a module-level singleton: on the server a shared client
  // would leak one user's cached data into another user's request.
  const [client] = useState(makeQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
