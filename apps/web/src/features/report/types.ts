import type { components, paths } from "@/lib/api/generated/schema";

export type ReportRequest = components["schemas"]["ReportRequest"];
export type ReportResponse = components["schemas"]["ReportResponse"];
export type ReportSection = components["schemas"]["ReportSection"];
export type ReportReason = components["schemas"]["ReportReason"];

type _Body = paths["/v1/report"]["post"]["requestBody"]["content"]["application/json"];
const _check: _Body extends ReportRequest ? true : never = true;
void _check;
