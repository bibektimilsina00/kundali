"use client";

import { useMutation } from "@tanstack/react-query";

import * as milanApi from "@/features/milan/api/milan.api";
import type { MilanRequest, MilanResponse } from "@/features/milan/types";
import type { ApiError } from "@/lib/api/errors";
import { trackEvent } from "@/providers/posthog-provider";

export function useCalculateMatch() {
  return useMutation<MilanResponse, ApiError, MilanRequest>({
    mutationFn: milanApi.calculateMatch,
    onSuccess: (data) => {
      // Scores only. Names, dates and birthplaces stay out of analytics (rule 9).
      trackEvent("milan_calculated", {
        total_guna: data.total_guna,
        percentage: data.percentage,
        recommendation: data.recommendation,
      });
    },
  });
}
