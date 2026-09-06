/**
 * Gaṇita and Phalita — why the maths and the meaning stay apart.
 *
 * Markup is the landing demo's, unchanged.
 */
export function HowSection() {
  return (
    <section id="how" className="py-24">
      <div className="mx-auto max-w-[1360px] px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">How it works</span>
          <h2 className="mt-4 font-disp text-[30px] font-bold leading-[1.12] tracking-[-0.015em] text-paper sm:text-[38px]">The maths and the meaning<br className="hidden sm:block" /> are kept apart</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-[1.7] text-muted">Most AI astrology asks one model to do both, and a model will happily invent a position that sounds right. Here it never gets the chance.</p>
        </div>

        {/* gap-px over a lit background draws the rule between them. */}
        <div className="reveal mx-auto grid max-w-5xl gap-px overflow-hidden rounded-[8px] bg-white/[0.09] md:grid-cols-2">
          <div className="relative overflow-hidden bg-ink px-8 py-10 sm:px-10">
            <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-3 select-none text-[76px] font-bold leading-none text-white/[0.035]">गणित</span>
            <div className="relative">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-gold">Gaṇita — the reckoning</div>
              <h3 className="mt-4 font-disp text-[21px] font-bold text-paper">The ephemeris calculates</h3>
              <p className="mt-3.5 text-[14px] leading-[1.8] text-muted">Your birth moment becomes universal time using the zone your birthplace kept <em className="not-italic text-paper">that year</em>. Swiss Ephemeris gives every longitude. Lahiri ayanamsa, whole-sign houses, mean nodes. The same inputs always give the same chart.</p>
            </div>
          </div>
          <div className="relative overflow-hidden bg-ink px-8 py-10 sm:px-10">
            <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-3 select-none text-[76px] font-bold leading-none text-white/[0.035]">फलित</span>
            <div className="relative">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-gold">Phalita — the reading</div>
              <h3 className="mt-4 font-disp text-[21px] font-bold text-paper">The astrologer reads it</h3>
              <p className="mt-3.5 text-[14px] leading-[1.8] text-muted">The finished chart is handed over as data. It interprets, compares and explains — but is never asked to work out a degree or a date, so it <em className="not-italic text-paper">cannot</em> get one wrong.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
