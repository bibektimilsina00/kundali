import type { components, paths } from "@/lib/api/generated/schema";

export type ChatRequest = components["schemas"]["ChatRequest"];
export type ChatResponse = components["schemas"]["ChatResponse"];
export type ChatTurn = components["schemas"]["ChatTurn"];

type _Body = paths["/v1/chat"]["post"]["requestBody"]["content"]["application/json"];
const _check: _Body extends ChatRequest ? true : never = true;
void _check;

/**
 * A chat turn as the UI holds it.
 *
 * Distinct from `ChatTurn` above, which is the wire shape: this carries the id,
 * timestamp and basis the UI renders and the API neither sends nor wants.
 */
export interface ChatMessage {
  id: string;
  sender: "user" | "astrologer";
  text: string;
  timestamp: string;
  astrologicalBasis?: string;
}
