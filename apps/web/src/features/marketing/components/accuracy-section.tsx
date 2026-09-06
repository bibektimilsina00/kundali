/**
 * Why charts disagree: Kathmandu's offset, and what it costs.
 *
 * Markup is the landing demo's, unchanged.
 */
export function AccuracySection() {
  return (
    <section id="accuracy" className="relative overflow-hidden py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_70%_50%,rgba(229,169,60,.05),transparent_72%)]"></div>
      <div className="relative mx-auto max-w-[1360px] px-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-gold">Why charts disagree</span>
        <h2 className="mt-5 max-w-3xl font-disp text-[34px] font-bold leading-[1.08] tracking-[-0.02em] text-paper sm:text-[52px]">
          Kathmandu has not<br className="hidden sm:block" /> always been +5:45
        </h2>

        {/* The argument is the section, so it gets the type rather than a card. */}
        <div className="reveal mt-14 grid gap-10 border-y border-white/[0.09] py-10 sm:grid-cols-3">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-faint">Today&rsquo;s offset</div>
            <div className="mt-2 font-mono text-[30px] leading-none text-rose-400/85">+05:45</div>
          </div>
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-faint">Actual, in 1975</div>
            <div className="mt-2 font-mono text-[30px] leading-none text-gold2">+05:30</div>
          </div>
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-faint">Δ ascendant</div>
            <div className="mt-2 font-mono text-[30px] leading-none text-paper">3.75°</div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 text-[15px] leading-[1.85] text-muted md:grid-cols-2 md:gap-14">
          <p>Nepal kept +5:30 until 1986, and local mean time of +5:41:16 before that. A 1975 birth calculated with today&rsquo;s offset lands fifteen minutes off — roughly <strong className="font-semibold text-paper">3.75° of ascendant</strong>, which is enough to move a lagna into the wrong sign and quietly invalidate everything read from it.</p>
          <p>So we store the zone by name and look up what it meant on your date, rather than storing a number that was only true this decade. A small thing that decides whether the rest of the chart is worth reading.</p>
        </div>
      </div>
    </section>
  );
}
