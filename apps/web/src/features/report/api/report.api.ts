import { authHeaders } from "@/features/auth/store/auth-store";
import type { ReportRequest, ReportResponse } from "@/features/report/types";
import { apiFetch } from "@/lib/api/client";

export function generateReport(body: ReportRequest): Promise<ReportResponse> {
  return apiFetch("/v1/report", { method: "POST", body, headers: authHeaders() });
}
