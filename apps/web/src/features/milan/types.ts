import type { components, paths } from "@/lib/api/generated/schema";

export type MilanRequest = components["schemas"]["MilanRequest"];
export type MilanResponse = components["schemas"]["MilanResponse"];
export type Kuta = components["schemas"]["KutaOut"];
export type Manglik = components["schemas"]["ManglikOut"];
export type ManglikCompatibility = components["schemas"]["ManglikCompatibilityOut"];

type _Body = paths["/v1/milan/match"]["post"]["requestBody"]["content"]["application/json"];
const _check: _Body extends MilanRequest ? true : never = true;
void _check;
