/**
 * A sidereal ephemeris small enough to run in the browser.
 *
 * JPL's Keplerian elements for the classical planets, Meeus' truncated
 * lunar series, the mean node for Rahu/Ketu, and the ascendant from local
 * sidereal time. Lahiri ayanamsa reduces tropical to sidereal.
 *
 * Accurate to a fraction of a degree, which puts every graha in the right
 * sign and house. It is NOT the Swiss Ephemeris — real charts are cast
 * server-side, and this only drives the marketing page's live display.
 */

export const BODIES = [
  "Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu",
] as const;

export type Body = (typeof BODIES)[number];
export type Sky = Record<Body | "Lagna", number> & { at: Date };

export const AB: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
};

export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const SIGN3 = [
  "Ari", "Tau", "Gem", "Can", "Leo", "Vir",
  "Lib", "Sco", "Sag", "Cap", "Aqu", "Pis",
];

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const norm: (x: number) => number = d => ((d % 360) + 360) % 360;

/* a, e, I, L, longPeri, longNode  +  per-century rates */
const ELEMENTS: Record<string, number[]> = {
  Mercury: [0.38709927, 0.20563593, 7.00497902, 252.25032350,  77.45779628,  48.33076593,
            0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081],
  Venus:   [0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718,  76.67984255,
            0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418],
  Earth:   [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193,  0.0,
            0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364,  0.0],
  Mars:    [1.52371034, 0.09339410, 1.84969142,   -4.55343205, -23.94362959, 49.55953891,
            0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343],
  Jupiter: [5.20288700, 0.04838624, 1.30439695,   34.39644051,  14.72847983, 100.47390909,
            -0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106],
  Saturn:  [9.53667594, 0.05386179, 2.48599187,   49.95424423,  92.59887831, 113.66242448,
            -0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794],
};

/* heliocentric ecliptic rectangular coordinates, in au */
function helio(name: string, T: number) {
  const e0 = ELEMENTS[name];
  const a = e0[0] + e0[6] * T, e = e0[1] + e0[7] * T, I = (e0[2] + e0[8] * T) * D2R;
  const L = e0[3] + e0[9] * T, wBar = e0[4] + e0[10] * T, O = (e0[5] + e0[11] * T) * D2R;
  const w = (wBar - (e0[5] + e0[11] * T)) * D2R;
  let M = norm(L - wBar) * D2R;
  if (M > Math.PI) M -= 2 * Math.PI;

  let E = M + e * Math.sin(M);                 // Kepler, Newton–Raphson
  for (let i = 0; i < 8; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-10) break;
  }
  const xp = a * (Math.cos(E) - e);
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E);

  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(O), sO = Math.sin(O),
        cI = Math.cos(I), sI = Math.sin(I);
  return {
    x: (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    y: (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    z: (sw * sI) * xp + (cw * sI) * yp,
  };
}

/* Lahiri: 23.85° at J2000, precessing about 50.29″ a year */
const ayanamsa = (T: number) => 23.85 + 1.3972 * T;

function positions(date: Date): Record<string, number> {
  const JD = date.getTime() / 86400000 + 2440587.5;
  const T = (JD - 2451545.0) / 36525;
  const d = JD - 2451545.0;
  const ay = ayanamsa(T);
  const earth = helio("Earth", T);
  const out: Record<string, number> = {};

  /* Sun: the Earth's heliocentric longitude, turned around */
  out["Sun"] = norm(Math.atan2(-earth.y, -earth.x) * R2D - ay);

  for (const name of ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]) {
    const p = helio(name, T);
    out[name] = norm(Math.atan2(p.y - earth.y, p.x - earth.x) * R2D - ay);
  }

  /* Moon — Meeus, truncated */
  const Lp = 218.316 + 13.176396 * d, M = (134.963 + 13.064993 * d) * D2R,
        F = (93.272 + 13.229350 * d) * D2R;
  out["Moon"] = norm(Lp + 6.289 * Math.sin(M) - 1.274 * Math.sin(M - 2 * F)
                  + 0.658 * Math.sin(2 * F) - ay);

  /* the lunar nodes: Rahu, and Ketu opposite it */
  const node = norm(125.0445479 - 0.0529539 * d);
  out["Rahu"] = norm(node - ay);
  out["Ketu"] = norm(node + 180 - ay);

  /* ascendant, for Kathmandu */
  const lat = 27.7172 * D2R, lon = 85.324;
  const gmst = norm(280.46061837 + 360.98564736629 * d + 0.000387933 * T * T);
  const lst = norm(gmst + lon) * D2R;
  const eps = (23.439291 - 0.0130042 * T) * D2R;
  const asc = Math.atan2(Math.cos(lst),
    -(Math.sin(lst) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps))) * R2D;
  out["Lagna"] = norm(norm(asc + 180) - ay);

  return out;
}

/* Which of the nine padas of its own sign a longitude falls in. The
   epsilon is not decoration: k * 10/3 is not exactly representable, so
   a longitude sitting on a pada boundary floors into the pada below
   it and the graha lands in the wrong navamsa. */
export const pada = (lon: number) => Math.min(8, Math.floor((lon % 30) / (10 / 3) + 1e-9));
export const navamsa = (lon: number) => (Math.floor(lon / 30) * 9 + pada(lon)) % 12;

/* D1 reads the degree within the rashi; D9 the ninth-part expanded to
   a full sign, which is the degree an astrologer would quote. */
export const degIn = (lon: number, isD9: boolean) =>
  isD9 ? Math.max(0, (lon % 30 - pada(lon) * (10 / 3)) * 9) : lon % 30;

export function sky(now: Date): Sky {
  return { ...(positions(now) as Record<string, number>), at: now } as Sky;
}
