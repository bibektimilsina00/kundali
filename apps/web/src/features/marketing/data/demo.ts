/**
 * Everything the marketing page displays, as data.
 *
 * The demo built these lists with innerHTML; here they are typed and the
 * components map over them. Illustrative content — the sample chart is a
 * genuine 14 June 1975 Kathmandu birth, not a visitor's.
 */

export type House = {
  n: number; d: string; c: [number, number];
  sign: string; lord: string;
  p: { name: string; nakshatra: string; deg: string; retro?: boolean }[];
};

export const HOUSES: House[] = [
  { n: 1,  d: "M50 0 L75 25 L50 50 L25 25 Z",   c: [50, 20], sign: "Cancer",      lord: "Moon",    p: [{ name: "Moon", nakshatra: "Ashlesha", deg: "23.4°" }] },
  { n: 2,  d: "M50 0 L25 25 L0 0 Z",            c: [25, 10], sign: "Leo",         lord: "Sun",     p: [] },
  { n: 3,  d: "M0 0 L25 25 L0 50 Z",            c: [10, 25], sign: "Virgo",       lord: "Mercury", p: [] },
  { n: 4,  d: "M0 50 L25 25 L50 50 L25 75 Z",   c: [25, 50], sign: "Libra",       lord: "Venus",   p: [{ name: "Jupiter", nakshatra: "Swati", deg: "12.1°" }] },
  { n: 5,  d: "M0 50 L25 75 L0 100 Z",          c: [10, 75], sign: "Scorpio",     lord: "Mars",    p: [] },
  { n: 6,  d: "M0 100 L25 75 L50 100 Z",        c: [25, 90], sign: "Sagittarius", lord: "Jupiter", p: [{ name: "Ketu", nakshatra: "Mula", deg: "4.8°" }] },
  { n: 7,  d: "M50 100 L25 75 L50 50 L75 75 Z", c: [50, 80], sign: "Capricorn",   lord: "Saturn",  p: [{ name: "Sun", nakshatra: "Mrigashira", deg: "29.0°" }, { name: "Mercury", nakshatra: "Ardra", deg: "8.2°" }] },
  { n: 8,  d: "M50 100 L75 75 L100 100 Z",      c: [75, 90], sign: "Aquarius",    lord: "Saturn",  p: [] },
  { n: 9,  d: "M100 100 L75 75 L100 50 Z",      c: [90, 75], sign: "Pisces",      lord: "Jupiter", p: [] },
  { n: 10, d: "M100 50 L75 75 L50 50 L75 25 Z", c: [75, 50], sign: "Aries",       lord: "Mars",    p: [{ name: "Saturn", nakshatra: "Krittika", deg: "18.6°", retro: true }] },
  { n: 11, d: "M100 50 L75 25 L100 0 Z",        c: [90, 25], sign: "Taurus",      lord: "Venus",   p: [] },
  { n: 12, d: "M100 0 L75 25 L50 0 Z",          c: [75, 10], sign: "Gemini",      lord: "Mercury", p: [{ name: "Venus", nakshatra: "Punarvasu", deg: "2.5°" }, { name: "Mars", nakshatra: "Ardra", deg: "15.9°" }, { name: "Rahu", nakshatra: "Mula", deg: "4.8°" }] },
];

export type ReadingSection = { title: string; summary: string; body: string; refs: string[] };

export const READING: ReadingSection[] = [
  {
    title: "Personality & Intellect",
    summary: "Distinctive Cancer Ascendant mindset driven by Water elemental focus and Ashlesha Nakshatra lunar qualities.",
    body: "Your birth chart features a Cancer Ascendant rising at 15.93°, shaping your fundamental approach to life with integrity, purpose and strong personal principles. Your Moon is placed in Cancer under Ashlesha Nakshatra (Pada 2), granting high mental acuity and emotional depth in social and professional environments.",
    refs: ["Cancer Ascendant (15.93°)", "Moon in Cancer (Ashlesha Pada 2)", "Deva Gana · Water Tatva"],
  },
  {
    title: "Strengths & Growth Areas",
    summary: "Extraordinary capacity for deep focus balanced against periodic mental overthinking.",
    body: "Remarkable perseverance, strategic foresight and a natural aptitude for mastering complex technical or financial systems. With active energy in house 6 (Sagittarius), beware of over-analysing minor setbacks or absorbing unnecessary workplace friction.",
    refs: ["Ruler of House 1 (Moon)", "Planetary spread across Kendras"],
  },
  {
    title: "Career & Financial Outlook",
    summary: "Prominent trajectory aligned with Aries leadership, strategic management or independent consulting.",
    body: "Your tenth house of career falls in Aries, ruled by Mars, with Saturn placed there retrograde. This configuration favours executive authority and analytical consulting, and rewards autonomy over rigid micromanagement.",
    refs: ["10th House in Aries (Lord: Mars)", "Saturn ℞ in the 10th", "Mercury Mahadasha"],
  },
  {
    title: "Love & Marriage",
    summary: "Intellectual partnership and shared life values under Capricorn relationship influence.",
    body: "Your seventh house is located in Capricorn, ruled by Saturn, with the Sun and Mercury placed there. Your ideal partner is communicative and emotionally steady, likely met through professional or educational settings.",
    refs: ["7th House in Capricorn", "Venus in Gemini (House 12)"],
  },
  {
    title: "Foreign Travel & Spirituality",
    summary: "Active twelfth house in Gemini indicating foreign connections and international growth.",
    body: "With Venus, Mars and Rahu in your twelfth house, overseas travel or long-distance relocation plays a meaningful role in your destiny. Spiritually you lean toward introspection and philosophy over ritual.",
    refs: ["12th House in Gemini", "Rahu in the 12th"],
  },
  {
    title: "Current Dasha & Periods",
    summary: "Navigating Mercury Mahadasha ➔ Ketu Antardasha.",
    body: "You are currently under Mercury Mahadasha, directing focus toward strategic growth and foundational life progress. This period favours disciplined execution and expanding key professional skills.",
    refs: ["Mercury Mahadasha (1964 → 1981)", "Calculated from Ashlesha"],
  },
  {
    title: "Remedial Measures",
    summary: "Tailored Vedic remedies for Cancer Ascendant and Cancer Moon placement.",
    body: "Offer water to the morning sun and recite the Gayatri Mantra for mental clarity. Silver and pearl-white bring focus for a Cancer Ascendant. Supporting educational causes on Mondays brings planetary grace.",
    refs: ["Ascendant Ruler: Moon"],
  },
];

export const CONTENTS = [
  "Personality & Intellect", "Strengths & Growth", "Career & Finance",
  "Love & Marriage", "Travel & Spirituality", "Current Dasha", "Remedies",
];

export type ChatTurn = { who: "u" } | { who: "a"; refs: string[] };

export const CHAT: ({ text: string } & ChatTurn)[] = [
  { who: "u", text: "Is this a good year to change jobs?" },
  {
    who: "a",
    text: "You are running <strong class='text-paper'>Mercury Mahadasha</strong>, and Saturn sits retrograde in your tenth. That favours a considered move rather than a sudden one — negotiate, do not leap.",
    refs: ["Saturn ℞ in the 10th", "10th lord: Mars", "Mercury Mahadasha"],
  },
  { who: "u", text: "What about the timing?" },
  {
    who: "a",
    text: "Mercury runs to <strong class='text-paper'>January 1981</strong> in this cycle. The Ketu antardasha inside it is the restless stretch; act before it, or wait it out.",
    refs: ["Vimshottari dasha", "Ketu antardasha", "Moon in Ashlesha 2"],
  },
];

/** [name, scored, maximum]. The maxima sum to 36; the scores to 28. */
export const KUTAS: [string, number, number][] = [
  ["Varna", 1, 1], ["Vashya", 2, 2], ["Tara", 3, 3], ["Yoni", 3, 4],
  ["Graha Maitri", 5, 5], ["Gana", 6, 6], ["Bhakoot", 0, 7], ["Nadi", 8, 8],
];

export const FAQS: [string, string][] = [
  ["Do I need to know my exact birth time?", "The closer the better. The ascendant moves about one degree every four minutes, so an hour of uncertainty can shift your lagna into the next sign. Tick <em class='not-italic text-paper'>I do not know the exact time</em> if you are unsure, and the reading leans on the Moon rather than the ascendant."],
  ["Which system does this use?", "Sidereal, with the Lahiri (Chitrapaksha) ayanamsa, whole-sign houses and mean nodes — the standard combination in Indian and Nepali Jyotish. Divisional charts follow classical Parashari rules."],
  ["Can I enter a Bikram Sambat date?", "Yes. Switch the date field to <em class='not-italic text-paper'>BS</em> and it converts to the Gregorian date before anything is calculated."],
  ["Is it free?", "Casting a chart and reading it is free, with no account. Paid plans cover saved charts, longer conversations and — when it opens — consultations with human astrologers."],
  ["Is the AI making the astrology up?", "It cannot compute anything. Positions, houses, nakshatras and dasha dates come from the ephemeris and are handed to the model as finished data. Every section names the placements behind it, so you can check."],
  ["Is my birth data private?", "It is never written to logs, never put in error messages and never sent to analytics. It does go to the AI provider that writes your reading, because that is how the reading is written."],
  ["Do I need an account?", "Not to calculate a chart and read it. An account is for saving charts and keeping your conversations."],
];
