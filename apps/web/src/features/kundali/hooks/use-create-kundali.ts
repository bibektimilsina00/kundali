"use client";

import { useMutation } from "@tanstack/react-query";

import { createKundali } from "@/features/kundali/api/kundali.api";
import type { BirthDetailsIn, Chart } from "@/features/kundali/types";
import type { ApiError } from "@/lib/api/errors";
import { trackKundaliGenerated } from "@/lib/utils/analytics";

/**
 * Server state lives in TanStack Query, never in a Zustand store — copying it
 * out means hand-writing cache invalidation, and you will get it wrong
 * (docs/architecture.md §8).
 */
export function useCreateKundali() {
  return useMutation<Chart, ApiError, BirthDetailsIn>({
    mutationFn: createKundali,
    onSuccess: (_chart, birthDetails) => {
      trackKundaliGenerated({
        language: "en",
        timeAccuracy: birthDetails.time_accuracy,
      });
    },
  });
}
