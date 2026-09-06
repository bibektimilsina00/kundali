/**
 * Rasterise every brand asset from SVG source.
 *
 *   node scripts/generate-brand-assets.mjs
 *
 * Outputs are generated, not hand-made — re-run this after changing the mark
 * rather than editing a PNG. `brand/` holds the SVG sources; everything it
 * writes into `public/` is disposable.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";

const GOLD = "#E5A93C";
const GOLD_LIGHT = "#F3C766";
const INK = "#090A10";
const PAPER = "#F8FAFC";

/** The mark itself, as geometry. `scale` shrinks it inside its box for padding. */
const mark = ({ stroke = GOLD, fill = GOLD_LIGHT, width = 2.6, diagonals = true }) => `
  <g fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round">
    <rect x="12" y="12" width="76" height="76" rx="1.5" />
    <path d="M50 12 L88 50 L50 88 L12 50 Z" />
    ${diagonals ? `<path d="M12 12 L88 88 M88 12 L12 88" stroke-width="${width * 0.62}" opacity="0.55" />` : ""}
  </g>
  <path d="M50 12 L69 31 L50 50 L31 31 Z" fill="${fill}" />`;

/**
 * A square app icon. `inset` is the fraction of the canvas left empty around
 * the mark — Android maskable icons crop to a circle, so they need far more.
 */
const appIcon = ({ inset = 0.16, radius = 0.18, background = INK, strokeWidth = 2.6, diagonals = true }) => {
  const size = 100;
  const box = size * (1 - inset * 2);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * radius}" fill="${background}" />
  <g transform="translate(${size * inset} ${size * inset}) scale(${box / size})">
    ${mark({ width: strokeWidth, diagonals })}
  </g>
</svg>`;
};

/** Open Graph card. Read at ~500px wide in most feeds, so nothing small. */
const ogCard = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="glow" cx="50%" cy="38%" r="62%">
      <stop offset="0%" stop-color="#1D2338" />
      <stop offset="100%" stop-color="${INK}" />
    </radialGradient>
    <linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0" />
      <stop offset="50%" stop-color="${GOLD}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#glow)" />

  <g transform="translate(525 92) scale(1.5)">
    ${mark({ width: 2.6 })}
  </g>

  <text x="600" y="404" text-anchor="middle" fill="${PAPER}"
        font-family="Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, serif"
        font-size="82" letter-spacing="15">NAKHATRA</text>

  <rect x="380" y="448" width="440" height="1.5" fill="url(#rule)" />

  <text x="600" y="502" text-anchor="middle" fill="${GOLD}"
        font-family="Helvetica, Arial, sans-serif"
        font-size="23" font-weight="600" letter-spacing="6.5">PRECISION SIDEREAL ASTROLOGY</text>

  <text x="600" y="551" text-anchor="middle" fill="#94A3B8"
        font-family="Helvetica, Arial, sans-serif" font-size="24" letter-spacing="0.6">
    Your chart, computed exactly. Your questions, answered from it.
  </text>
</svg>`;

/** Play Store feature graphic — wide, mark left, type right. */
const featureGraphic = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 500">
  <defs>
    <radialGradient id="g2" cx="26%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#1D2338" />
      <stop offset="100%" stop-color="${INK}" />
    </radialGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#g2)" />
  <g transform="translate(96 160) scale(1.8)">
    ${mark({ width: 2.6 })}
  </g>
  <text x="360" y="238" fill="${PAPER}"
        font-family="Palatino, 'Palatino Linotype', 'Book Antiqua', Georgia, serif"
        font-size="66" letter-spacing="12">NAKHATRA</text>
  <text x="364" y="288" fill="${GOLD}"
        font-family="Helvetica, Arial, sans-serif"
        font-size="19" font-weight="600" letter-spacing="5.4">PRECISION SIDEREAL ASTROLOGY</text>
  <text x="364" y="336" fill="#94A3B8"
        font-family="Helvetica, Arial, sans-serif" font-size="21">
    Vedic charts computed by ephemeris, read back by AI.
  </text>
</svg>`;

const targets = [
  // Browser favicons. Google Search Console wants a multiple of 48.
  // No diagonals below 64px: they fill the interior and the mark reads as a
  // blob. The square and inner diamond alone still carry the silhouette.
  { out: "public/favicon-16.png", size: 16, svg: appIcon({ inset: 0.16, radius: 0.12, strokeWidth: 6, diagonals: false }) },
  { out: "public/favicon-32.png", size: 32, svg: appIcon({ inset: 0.18, radius: 0.16, strokeWidth: 5, diagonals: false }) },
  { out: "public/favicon-48.png", size: 48, svg: appIcon({ inset: 0.18, radius: 0.18, strokeWidth: 4.2, diagonals: false }) },
  { out: "public/favicon-96.png", size: 96, svg: appIcon({ inset: 0.18, radius: 0.2, strokeWidth: 3.2 }) },

  // iOS home screen. No rounding — iOS masks it itself, and a pre-rounded
  // icon gets rounded twice and looks pinched.
  { out: "public/apple-touch-icon.png", size: 180, svg: appIcon({ inset: 0.2, radius: 0, strokeWidth: 3 }) },

  // PWA / Android / Play Store listing.
  { out: "public/icon-192.png", size: 192, svg: appIcon({ inset: 0.18, radius: 0.2, strokeWidth: 2.9 }) },
  { out: "public/icon-512.png", size: 512, svg: appIcon({ inset: 0.16, radius: 0.18, strokeWidth: 2.8 }) },

  // Maskable: Android crops to a circle, so keep everything well inside.
  { out: "public/icon-maskable-192.png", size: 192, svg: appIcon({ inset: 0.3, radius: 0, strokeWidth: 3.4, diagonals: false }) },
  { out: "public/icon-maskable-512.png", size: 512, svg: appIcon({ inset: 0.3, radius: 0, strokeWidth: 3.2 }) },

  // App Store requires a square with no transparency.
  { out: "brand/app-store-1024.png", size: 1024, svg: appIcon({ inset: 0.18, radius: 0, strokeWidth: 2.6 }) },

  // Social + store art.
  { out: "public/og-image.png", width: 1200, height: 630, svg: ogCard() },
  { out: "brand/play-feature-graphic.png", width: 1024, height: 500, svg: featureGraphic() },
];

for (const t of targets) {
  const width = t.width ?? t.size;
  const height = t.height ?? t.size;
  await mkdir(dirname(join(process.cwd(), t.out)), { recursive: true });
  await sharp(Buffer.from(t.svg), { density: 384 })
    .resize(width, height, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(t.out);
  console.log(`  ${t.out.padEnd(38)} ${width}x${height}`);
}

// Keep the SVG sources beside the generated art so the mark has one home.
await writeFile("brand/mark.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${mark({})}\n</svg>\n`);
await writeFile("brand/og-image.svg", ogCard() + "\n");
console.log("\nSources written to brand/. Re-run this script after changing the mark.");
