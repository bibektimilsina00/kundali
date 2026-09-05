import type { Chart, BirthDetailsIn } from "../types";

/**
 * Formats the COMPLETE sidereal astronomical chart payload into structured,
 * comprehensive text context for AI models (AgentRouter / OpenRouter).
 */
export function formatCompleteChartForAI(chart: Chart, birth: BirthDetailsIn): string {
  if (!chart) return "No chart data available.";

  const birthInfo = birth
    ? `=== SEEKER VERIFIED BIRTH DATA ===
• Full Name: ${birth.name}
• Moment of Birth: ${birth.date} at ${birth.time} (${birth.time_accuracy || "exact"})
• Birthplace: ${birth.place_label || "Unknown"} (Lat: ${birth.latitude}°, Lng: ${birth.longitude}°, Timezone: ${birth.tz_name})`
    : "No birth details available";

  const lagnaInfo = `=== D1 RASHI ASCENDANT (LAGNA) ===
• Lagna Ascendant Sign: ${chart.lagna_sign} (${chart.lagna_degree?.toFixed(3) ?? "0.000"}°)
• House Cusps:
${chart.houses?.map((h) => `  - House ${h.number}: ${h.sign} (Lord: ${h.lord || "N/A"}${h.occupants?.length ? `, Occupants: ${h.occupants.join(", ")}` : ""})`).join("\n") || "N/A"}`;

  const planetsInfo = `=== ALL 9 PLANETARY COORDINATES & STATES ===
${chart.planets?.map((p) => `• ${p.name}: ${p.sign} at ${p.degree_in_sign?.toFixed(3) ?? "0.000"}° | House ${p.house} | Sign Index ${p.sign_index}${p.retrograde ? " | [RETROGRADE ℞]" : ""}${p.combust ? " | [COMBUST]" : ""}${p.dignity ? ` | Dignity: ${p.dignity}` : ""}${p.avastha ? ` | Avastha: ${p.avastha}` : ""}`).join("\n") || "N/A"}`;

  const panchangInfo = chart.panchang
    ? `=== PANCHANG ASTRONOMICAL METRICS ===
• Tithi: ${chart.panchang.tithi_name} (Index ${chart.panchang.tithi_index}, ${chart.panchang.paksha} Paksha)
• Nakshatra: ${chart.panchang.nakshatra} (Pada ${chart.panchang.nakshatra_pada}, Lord: ${chart.panchang.nakshatra_lord})
• Yoga: ${chart.panchang.yoga} | Karana: ${chart.panchang.karana}
• Vara: ${chart.panchang.vara} (Lord: ${chart.panchang.vara_lord})
• Moon Sign: ${chart.panchang.moon_sign} (Lord: ${chart.panchang.moon_sign_lord})`
    : "";

  const avakhadaInfo = chart.avakhada
    ? `=== AVAKHADA CHAKRA & ATMA QUALITIES ===
• Varna: ${chart.avakhada.varna}
• Vashya: ${chart.avakhada.vashya}
• Yoni: ${chart.avakhada.yoni}
• Gana: ${chart.avakhada.gana}
• Nadi: ${chart.avakhada.nadi}
• Sign: ${chart.avakhada.sign}
• Nakshatra: ${chart.avakhada.nakshatra} (Charan ${chart.avakhada.charan})`
    : "";

  const vargasInfo = chart.vargas && chart.vargas.length > 0
    ? `=== 16 DIVISIONAL VARGA CHARTS (D1 to D60) ===
${chart.vargas.map((v) => `• ${v.code} (${v.name}): Lagna in ${v.lagna_sign} | Placements: ${v.placements.map((p) => `${p.planet} in H${p.house}`).join(", ")}`).join("\n")}`
    : "";

  const dashaInfo = chart.dasha?.periods && chart.dasha.periods.length > 0
    ? `=== VIMSHOTTARI DASHA TIME LORDS TIMELINE ===
${chart.dasha.periods.map((d) => `• ${d.lord} Level ${d.level} Dasha: ${d.start || "Start"} ➔ ${d.end || "End"}`).join("\n")}`
    : "";

  return [
    birthInfo,
    lagnaInfo,
    planetsInfo,
    panchangInfo,
    avakhadaInfo,
    vargasInfo,
    dashaInfo,
  ]
    .filter(Boolean)
    .join("\n\n");
}
