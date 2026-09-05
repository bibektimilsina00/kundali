import { SiteHeader } from "@/components/ui/site-header";
import { KundaliPanel } from "@/features/kundali/components/kundali-panel";

/**
 * Routing and layout only. All logic lives in `features/`
 * (docs/architecture.md §8).
 */
export default function KundaliPage() {
  return (
    <div className="min-h-dvh bg-cream">
      <SiteHeader />

      <main className="mx-auto w-full max-w-[1180px] px-4 py-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#E5A93C]/40 bg-[#161B2B] p-4 text-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <span className="text-xl">✨</span>
            <div>
              <h3 className="font-bold text-sm">Experience Narrative Readings & Live AI Astrologer</h3>
              <p className="text-xs text-muted">
                Precision Vedic Chart ➔ Deep Narrative & Audio Playback ➔ 🔴 Live Mode Chat Desk
              </p>
            </div>
          </div>
          <a
            href="/reading"
            className="rounded-lg bg-[#E5A93C] px-4 py-2 text-xs font-bold text-[#090A10] transition hover:bg-[#F3C766]"
          >
            Launch Reading & Live Mode ➔
          </a>
        </div>

        <KundaliPanel />
      </main>

      <footer className="pattern-lattice mt-8 border-t border-line-strong bg-surface">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-8">
          <p className="max-w-2xl text-xs leading-relaxed text-muted">
            Lahiri (Chitrapaksha) ayanamsa · whole-sign houses · mean nodes ·
            Vimshottari dasha. Positions are computed from the Swiss Ephemeris,
            never estimated.
          </p>
          <p className="mt-2 text-2xs uppercase tracking-wide text-dim">
            Birth details are never logged
          </p>
        </div>
      </footer>
    </div>
  );
}
