/** The 12 rashis, in order. Glyphs are Unicode (U+2648–U+2653) — no icon font,
 * no sprite sheet, no network request. */
export const ZODIAC = [
  { name: "Aries", sa: "Mesha", glyph: "♈" },
  { name: "Taurus", sa: "Vrishabha", glyph: "♉" },
  { name: "Gemini", sa: "Mithuna", glyph: "♊" },
  { name: "Cancer", sa: "Karka", glyph: "♋" },
  { name: "Leo", sa: "Simha", glyph: "♌" },
  { name: "Virgo", sa: "Kanya", glyph: "♍" },
  { name: "Libra", sa: "Tula", glyph: "♎" },
  { name: "Scorpio", sa: "Vrischika", glyph: "♏" },
  { name: "Sagittarius", sa: "Dhanu", glyph: "♐" },
  { name: "Capricorn", sa: "Makara", glyph: "♑" },
  { name: "Aquarius", sa: "Kumbha", glyph: "♒" },
  { name: "Pisces", sa: "Meena", glyph: "♓" },
] as const;
