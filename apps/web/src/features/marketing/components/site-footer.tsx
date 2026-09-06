"use client";

import Link from "next/link";

import { useTranslation } from "@/lib/i18n/language-context";
import { AB, BODIES, SIGN3 } from "@/features/marketing/ephemeris";
import { useSky } from "@/features/marketing/hooks/use-sky";

/**
 * The footer opens on the sky the page opened on — the same live
 * ephemeris the hero charts read, so the two can never disagree — and
 * closes on the colophon, which is what an almanac states.
 */
export function SiteFooter() {
  const sky = useSky();
  const { language, setLanguage } = useTranslation();

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08]">
      {/* A horizon, so the page closes the way it opened. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_75%_100%_at_50%_0%,rgba(229,169,60,.06),transparent_72%)]"></div>
    
      {/* The sky at the moment you are reading this. Same ephemeris the
           hero charts use, so the page ends on live data rather than a
           copyright line. */}
      <div className="relative border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-7 gap-y-3 px-8 py-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Right now</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11.5px]">
            {sky
              ? BODIES.map((b) => (
                  <span key={b} className="whitespace-nowrap">
                    <span className="text-faint">{AB[b]}</span>{" "}
                    <span className="tabular-nums text-gold2">
                      {SIGN3[Math.floor(sky[b] / 30)]} {(sky[b] % 30).toFixed(1)}°
                    </span>
                  </span>
                ))
              : <span className="text-faint">Computing…</span>}
          </div>
        </div>
      </div>
    
      <div className="relative mx-auto max-w-[1360px] px-8 py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand and colophon */}
          <div>
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 100 100" className="size-7 text-gold" fill="none" stroke="currentColor">
                <g strokeWidth="3.2" strokeLinejoin="round"><rect x="12" y="12" width="76" height="76" rx="1.5"/><path d="M50 12 L88 50 L50 88 L12 50 Z"/><path d="M12 12 L88 88 M88 12 L12 88" strokeWidth="2" opacity=".55"/></g>
                <path d="M50 12 L69 31 L50 50 L31 31 Z" fill="currentColor" stroke="none"/>
              </svg>
              <span className="font-logo text-[14px] font-bold tracking-[0.18em] text-paper">NAKHATRA</span>
            </div>
            <p className="mt-5 max-w-xs text-[13.5px] leading-[1.75] text-muted">
              Vedic astrology where the ephemeris does the arithmetic and the astrologer
              does the reading — and never the other way round.
            </p>
    
            <dl className="mt-7 max-w-xs border-t border-white/[0.08] font-mono text-[11px]">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] py-2"><dt className="text-faint">Ephemeris</dt><dd className="text-muted">Swiss Ephemeris</dd></div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] py-2"><dt className="text-faint">Ayanamsa</dt><dd className="text-muted">Lahiri · Chitrapaksha</dd></div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/[0.05] py-2"><dt className="text-faint">Houses</dt><dd className="text-muted">Whole sign</dd></div>
              <div className="flex items-baseline justify-between gap-4 py-2"><dt className="text-faint">Nodes</dt><dd className="text-muted">Mean</dd></div>
            </dl>
          </div>
    
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Platform</h3>
            <ul className="mt-5 space-y-3 text-[13.5px]">
              <li><a href="#chart" className="text-muted transition-colors hover:text-paper">Create a kundali</a></li>
              <li><a href="#reading" className="text-muted transition-colors hover:text-paper">Read the analysis</a></li>
              <li><a href="#ask" className="text-muted transition-colors hover:text-paper">Ask the astrologer</a></li>
              <li><a href="#milan" className="text-muted transition-colors hover:text-paper">Kundali Milan</a></li>
              <li>
                <a href="#astrologers" className="inline-flex items-center gap-2 text-muted transition-colors hover:text-paper">
                  Consult a jyotish
                  <span className="rounded-[3px] border border-gold/35 px-1 py-px font-mono text-[8.5px] font-bold uppercase tracking-[0.12em] text-gold">Soon</span>
                </a>
              </li>
            </ul>
          </div>
    
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Learn</h3>
            <ul className="mt-5 space-y-3 text-[13.5px]">
              <li><a href="#how" className="text-muted transition-colors hover:text-paper">How it works</a></li>
              <li><a href="#accuracy" className="text-muted transition-colors hover:text-paper">Why charts disagree</a></li>
              <li><a href="#faq" className="text-muted transition-colors hover:text-paper">Questions</a></li>
              <li><span className="cursor-default text-faint" title="Coming soon">The 27 nakshatras<span className="ml-1.5 rounded-[3px] border border-white/12 px-1 py-px font-mono text-[8px] uppercase tracking-[0.12em] text-faint">Soon</span></span></li>
              <li><span className="cursor-default text-faint" title="Coming soon">Vimshottari dasha<span className="ml-1.5 rounded-[3px] border border-white/12 px-1 py-px font-mono text-[8px] uppercase tracking-[0.12em] text-faint">Soon</span></span></li>
            </ul>
          </div>
    
          <div>
            <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Company</h3>
            <ul className="mt-5 space-y-3 text-[13.5px]">
              <li><span className="cursor-default text-faint" title="Coming soon">About<span className="ml-1.5 rounded-[3px] border border-white/12 px-1 py-px font-mono text-[8px] uppercase tracking-[0.12em] text-faint">Soon</span></span></li>
              <li><a href="mailto:support@nakhatra.com" className="text-muted transition-colors hover:text-paper">Support</a></li>
              <li><Link href="/privacy" className="text-muted transition-colors hover:text-paper">Privacy</Link></li>
              <li><Link href="/terms" className="text-muted transition-colors hover:text-paper">Terms</Link></li>
              <li><a href="mailto:hello@nakhatra.com?subject=Astrologer%20application" className="text-muted transition-colors hover:text-paper">Apply as an astrologer</a></li>
            </ul>
          </div>
        </div>
    
        <div className="mt-14 flex flex-col-reverse items-start justify-between gap-6 border-t border-white/[0.08] pt-7 sm:flex-row sm:items-center">
          <p className="text-[12.5px] text-faint">© 2026 Nakhatra · Built in Kathmandu, 27.71° N 85.32° E</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px]">
            {([["en", "English"], ["ne", "नेपाली"], ["hi", "हिन्दी"]] as const).map(([code, label]) => (
          <button
            key={code}
            type="button"
            onClick={() => setLanguage(code)}
            aria-pressed={language === code}
            className={language === code ? "text-paper" : "text-faint transition-colors hover:text-paper"}
          >
            {label}
          </button>
        ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
