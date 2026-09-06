"use client";

import { useMutation } from "@tanstack/react-query";

import * as chatApi from "@/features/chat/api/chat.api";
import type { ChatRequest, ChatResponse } from "@/features/chat/types";
import type { ApiError } from "@/lib/api/errors";

/**
 * One question to the astrologer.
 *
 * Not cached: the same question against the same chart is a new consultation,
 * not a repeat lookup, so this is a mutation rather than a query.
 *
 * No analytics here — the caller already emits `ai_chat_message_sent` when the
 * message is submitted, which counts failed sends too. Tracking success here as
 * well would double every message in the funnel.
 */
export function useAskAstrologer() {
  return useMutation<ChatResponse, ApiError, ChatRequest>({
    mutationFn: chatApi.askAstrologer,
  });
}
