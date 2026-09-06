import type { MilanRequest, MilanResponse } from "@/features/milan/types";
import { apiFetch } from "@/lib/api/client";

export function calculateMatch(body: MilanRequest): Promise<MilanResponse> {
  return apiFetch("/v1/milan/match", { method: "POST", body });
}
