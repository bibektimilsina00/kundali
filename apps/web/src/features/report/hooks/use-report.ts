"use client";

import { useQuery } from "@tanstack/react-query";

import * as reportApi from "@/features/report/api/report.api";
import type { ReportRequest, ReportResponse } from "@/features/report/types";
import type { ApiError } from "@/lib/api/errors";

/**
 * A query, not a mutation: the same chart and language produce the same report,
 * so remounting the dashboard should read the cache rather than pay for the
 * model again. This replaces a `useEffect` + `fetch` + `useState` triple that
 * re-requested on every mount.
 */
export function useReport(request: ReportRequest | null) {
  return useQuery<ReportResponse, ApiError>({
    queryKey: [
      "report",
      request?.chart.engine_version,
      request?.chart.julian_day,
      request?.language ?? "en",
    ],
    queryFn: () => reportApi.generateReport(request as ReportRequest),
    enabled: request !== null,
    // The model call is slow and costs money; a report does not go stale.
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
    retry: false,
  });
}
