import { ZODIAC } from "./zodiac";

/**
 * Decorative zodiac wheel. Twelve 30° sectors, generated from ZODIAC rather
 * than hand-drawn, so the geometry can't drift out of order.
 *
 * Purely ornamental: aria-hidden, and it carries no chart data. The real
 * North Indian chart lives in features/kundali.
 */
export function ZodiacWheel({ className = "" }: { className?: string }) {
  const R = 100;
  const rings = [100, 78, 52];

  return (
    <svg
      viewBox="-110 -110 220 220"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {rings.map((r) => (
        <circle
          key={r}
          cx="0"
          cy="0"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
        />
      ))}

      {ZODIAC.map((sign, i) => {
        // sectors start at 12 o'clock and run clockwise
        const a0 = (i * 30 - 90) * (Math.PI / 180);
        const mid = ((i + 0.5) * 30 - 90) * (Math.PI / 180);
        return (
          <g key={sign.name}>
            <line
              x1={Math.cos(a0) * rings[2]}
              y1={Math.sin(a0) * rings[2]}
              x2={Math.cos(a0) * R}
              y2={Math.sin(a0) * R}
              stroke="currentColor"
              strokeWidth="0.75"
            />
            <text
              x={Math.cos(mid) * 89}
              y={Math.sin(mid) * 89}
              textAnchor="middle"
              dominantBaseline="central"
              fill="currentColor"
              fontSize="11"
            >
              {sign.glyph}
            </text>
          </g>
        );
      })}

      {/* inner rosette — 24 spokes */}
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15) * (Math.PI / 180);
        return (
          <line
            key={i}
            x1={Math.cos(a) * 34}
            y1={Math.sin(a) * 34}
            x2={Math.cos(a) * 52}
            y2={Math.sin(a) * 52}
            stroke="currentColor"
            strokeWidth="0.5"
          />
        );
      })}

      {/* the square inside the circle — the North Indian chart motif */}
      <rect
        x={-24}
        y={-24}
        width={48}
        height={48}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
      />
      <path
        d="M-24 0 L0 -24 L24 0 L0 24 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
      />
    </svg>
  );
}
