"use client";

import { KundaliPanel } from "@/features/kundali/components/kundali-panel";

const STEPS: [string, string, string][] = [
  ["01", "Your chart is cast", "Nine grahas, twelve bhavas, sixteen vargas — from the ephemeris, in about a second."],
  ["02", "Seven sections are written", "Personality, career, relationships, dasha and remedies, each citing its placements."],
  ["03", "You ask whatever is left", "By text or out loud, in English, नेपाली or हिन्दी."],
];

/**
 * Casting a chart is the first thing the site should let you do, so it sits
 * directly under the hero.
 *
 * The form itself is the app's own `KundaliPanel` — the real BS/AD date
 * picker, time picker, place lookup and accuracy control, posting to the
 * real endpoint. The marketing page frames it; it does not reimplement it.
 */
export function CreateKundaliSection() {
  return (
    <section id="form" className="scroll-mt-24 py-24">
      <div className="mx-auto grid max-w-[1360px] items-start gap-14 px-8 lg:grid-cols-2 lg:gap-20">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Begin</span>
          <h2 className="mt-4 font-disp text-[30px] font-bold leading-[1.12] tracking-[-0.015em] text-paper sm:text-[38px]">
            Four fields, about a minute
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-[1.85] text-muted">
            The closer your birth time, the better. The ascendant moves a degree every four
            minutes, so an hour of uncertainty can shift your lagna into the next sign — mark it
            approximate if you are unsure, and the reading leans on the Moon instead.
          </p>

          <div className="mt-10">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Then, immediately</div>
            <ul className="mt-3 max-w-lg border-t border-white/[0.09]">
              {STEPS.map(([n, title, body]) => (
                <li key={n} className="flex gap-4 border-b border-white/[0.07] py-4 last:border-0">
                  <span className="mt-px font-mono text-[11px] tabular-nums text-gold">{n}</span>
                  <span>
                    <span className="block text-[13.5px] font-medium text-paper">{title}</span>
                    <span className="mt-1 block text-[13px] leading-[1.65] text-faint">{body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="mt-9 max-w-lg border-t border-white/[0.09] text-[14px]">
            {[
              "No account needed to see your chart",
              "Bikram Sambat dates supported",
              "Birth data never written to logs",
            ].map((line) => (
              <div key={line} className="flex items-baseline gap-3 border-b border-white/[0.07] py-3.5">
                <span className="text-gold">✓</span>
                <span className="text-muted">{line}</span>
              </div>
            ))}
          </dl>

          <p className="mt-6 max-w-lg text-[12.5px] leading-[1.65] text-faint">
            Your birthplace is stored by zone name — <span className="font-mono text-muted">Asia/Kathmandu</span>,
            not an offset — then looked up for your date.{" "}
            <a href="#accuracy" className="underline decoration-white/25 underline-offset-4 transition-colors hover:text-gold">
              Why that matters
            </a>.
          </p>
        </div>

        <div className="lg:pt-2">
          <KundaliPanel />
        </div>
      </div>
    </section>
  );
}
