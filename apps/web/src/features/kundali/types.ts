/**
 * Feature-facing names for the generated schema.
 *
 * Nothing outside this file imports from `generated/` — regenerating the
 * contract then ripples through one module, not the whole app. Same firebreak
 * the Flutter client gets from its DTO mapper (docs/mobile.md §1).
 */

import type { components, paths } from "@/lib/api/generated/schema";

export type Chart = components["schemas"]["ChartOut"];
export type Planet = components["schemas"]["PlanetOut"];
export type House = components["schemas"]["HouseOut"];
export type DashaPeriod = components["schemas"]["DashaPeriodOut"];
export type Panchang = components["schemas"]["PanchangOut"];
export type Varga = components["schemas"]["VargaChartOut"];
export type VargaPlacement = components["schemas"]["VargaPlacementOut"];
export type Avakhada = components["schemas"]["AvakhadaOut"];
export type Place = components["schemas"]["PlaceOut"];
export type BirthDetailsIn = components["schemas"]["BirthDetailsIn"];
export type TimeAccuracy = BirthDetailsIn["time_accuracy"];

// Compile-time proof the request body still matches the endpoint. If the API
// renames a field, this errors at build rather than at runtime.
type _CreateBody =
  paths["/v1/kundali"]["post"]["requestBody"]["content"]["application/json"];
const _check: _CreateBody extends BirthDetailsIn ? true : never = true;
void _check;
