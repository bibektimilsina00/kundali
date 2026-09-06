import { authHeaders } from "@/features/auth/store/auth-store";
import type { ChatRequest, ChatResponse } from "@/features/chat/types";
import { apiFetch } from "@/lib/api/client";

export function askAstrologer(body: ChatRequest): Promise<ChatResponse> {
  return apiFetch("/v1/chat", { method: "POST", body, headers: authHeaders() });
}
