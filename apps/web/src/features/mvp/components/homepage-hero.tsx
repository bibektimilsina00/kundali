"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ModernDatePicker } from "@/components/ui/modern-date-picker";
import { ModernTimePicker } from "@/components/ui/modern-time-picker";
import { CustomPlaceInput } from "@/components/ui/custom-place-input";
import { createKundali } from "@/features/kundali/api/kundali.api";
import { saveKundaliToStorage } from "@/features/kundali/store/kundali-store";
import type { BirthDetailsIn, Place } from "@/features/kundali/types";
import { AD_MONTHS, BS_MONTHS, convertBsToAd } from "@/lib/utils/date-converter";
import { GeneratingScreen } from "@/features/mvp/components/generating-screen";
import { useTranslation } from "@/lib/i18n/language-context";
import { Language } from "@/lib/i18n/translations";

export function HomepageHero() {
  const router = useRouter();
  const { language, setLanguage, t } = useTranslation();
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [era, setEra] = useState<"AD" | "BS">("AD");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [ampm, setAmPm] = useState<"AM" | "PM">("AM");
  const [approximateTime, setApproximateTime] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client Validation
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!day || !month || !year) {
      newErrors.date = "Please select day, month, and year of birth";
    }
    if (!hour || !minute) {
      newErrors.time = "Please select birth hour and minute";
    }
    if (!selectedPlace) {
      newErrors.place = "Please search and select your birthplace";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    let h = parseInt(hour, 10);
    if (ampm === "PM" && h < 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    const formattedTime = `${String(h).padStart(2, "0")}:${minute.padStart(2, "0")}`;

    let formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    if (era === "BS") {
      const converted = convertBsToAd(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10));
      formattedDate = converted.iso;
    }

    const birthDetails: BirthDetailsIn = {
      name: name.trim(),
      date: formattedDate as any,
      time: formattedTime,
      tz_name: selectedPlace!.tz_name,
      latitude: selectedPlace!.latitude,
      longitude: selectedPlace!.longitude,
      place_label: selectedPlace!.label,
      time_accuracy: approximateTime ? "approximate" : "exact",
    };

    try {
      const chart = await createKundali(birthDetails);
      saveKundaliToStorage(birthDetails, chart);
    } catch (err) {
      console.error("Failed to generate Kundali", err);
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <GeneratingScreen onComplete={() => router.push("/reading")} />;
  }

  return (
    <div className="min-h-dvh bg-[#090A10] text-[#94A3B8]">
      {/* 1. Header (Sticky Top Nav) */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090A10]">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3.5">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-[8px] bg-[#E5A93C] text-[#090A10] font-bold shadow-md transition hover:bg-[#F3C766]">
              <svg className="size-5.5 text-[#090A10]" viewBox="0 0 24 24" fill="none">
                {/* 8 Celestial Sunburst Rays */}
                <path
                  d="M12 1.5v2.5M12 20v2.5M1.5 12h2.5M20 12h2.5M4.58 4.58l1.77 1.77M17.65 17.65l1.77 1.77M4.58 19.42l1.77-1.77M17.65 6.35l1.77-1.77"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Sun Disk Core */}
                <circle cx="12" cy="12" r="5.2" fill="currentColor" />
                {/* Crescent Moon Arc Cutout */}
                <path
                  d="M13.8 8.2a4.5 4.5 0 0 0 0 7.6 4.2 4.2 0 1 1 0-7.6z"
                  fill="#090A10"
                />
              </svg>
            </div>
            <div>
              <span className="block font-serif text-base font-bold tracking-wider text-[#F8FAFC]">
                KUNDALI.AI
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#E5A93C]">
                Precision Vedic Astronomy &amp; AI
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#CBD5E1]">
            <a href="#features" className="hover:text-[#F3C766] transition">Features</a>
            <a href="#vargas" className="hover:text-[#F3C766] transition">Divisional Vargas</a>
            <Link href="/reading/live" className="hover:text-[#F3C766] transition flex items-center gap-1.5">
              <span className="inline-block size-2 rounded-full bg-rose-500 animate-pulse" />
              Live AI Consultation
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Selector in Header */}
            <div className="flex items-center gap-1.5 rounded-[8px] bg-[#161B2B] border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-[#F8FAFC]">
              <span>🌐</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-[#F3C766] text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-[#161B2B] text-white">English 🇬🇧</option>
                <option value="ne" className="bg-[#161B2B] text-white">नेपाली 🇳🇵</option>
                <option value="hi" className="bg-[#161B2B] text-white">हिन्दी 🇮🇳</option>
              </select>
            </div>

            <Link
              href="/reading"
              className="rounded-[8px] border border-white/10 bg-[#161B2B] px-4 py-2 text-xs font-bold text-[#F8FAFC] transition hover:border-[#E5A93C]"
            >
              {t.vedicReading}
            </Link>
            <a
              href="#form"
              className="rounded-[8px] bg-[#E5A93C] px-4 py-2 text-xs font-bold text-[#090A10] transition hover:bg-[#F3C766]"
            >
              {t.freeKundali}
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT SIDE: Sacred Geometry Vector Art & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#F8FAFC] leading-[1.2]">
              {t.heroTitle}
            </h1>

            <p className="text-base text-[#CBD5E1] leading-relaxed max-w-xl">
              {t.heroSub}
            </p>

            {/* Sacred Geometry Astrological Illustration Art */}
            <div className="relative my-4 rounded-[8px] border border-white/10 bg-[#161B2B] p-6 overflow-hidden">
              <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-[#E5A93C]/10 blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* SVG Mandala Artwork */}
                <div className="relative size-36 shrink-0 flex items-center justify-center">
                  <svg className="size-full stroke-[#E5A93C]" viewBox="0 0 200 200" fill="none">
                    <circle cx="100" cy="100" r="95" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                    <circle cx="100" cy="100" r="75" stroke="#F3C766" strokeWidth="1.2" />
                    <rect x="25" y="25" width="150" height="150" strokeWidth="1.5" />
                    <line x1="25" y1="25" x2="175" y2="175" strokeWidth="1" />
                    <line x1="175" y1="25" x2="25" y2="175" strokeWidth="1" />
                    <polygon points="100,25 175,100 100,175 25,100" strokeWidth="1.5" strokeDasharray="4 2" />
                    <circle cx="100" cy="100" r="8" fill="#E5A93C" />
                  </svg>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#F8FAFC]">
                    <span className="text-[#E5A93C]">🌌 {t.feature1Title}</span>
                  </div>
                  <p className="text-[#94A3B8] leading-relaxed">
                    {t.feature1Desc}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="rounded-[6px] border border-white/10 bg-[#090A10] px-2 py-1 text-[10px] font-semibold text-[#F3C766]">D1 Lagna</span>
                    <span className="rounded-[6px] border border-white/10 bg-[#090A10] px-2 py-1 text-[10px] font-semibold text-[#F3C766]">D9 Navamsha</span>
                    <span className="rounded-[6px] border border-white/10 bg-[#090A10] px-2 py-1 text-[10px] font-semibold text-[#F3C766]">16 Vargas</span>
                    <span className="rounded-[6px] border border-white/10 bg-[#090A10] px-2 py-1 text-[10px] font-semibold text-[#F3C766]">Vimshottari Dasha</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-3.5 text-xs space-y-1">
                <span className="block text-[#E5A93C] font-bold text-sm">⚡ {t.feature1Title}</span>
                <span className="text-[#94A3B8]">{t.feature1Desc}</span>
              </div>
              <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-3.5 text-xs space-y-1">
                <span className="block text-[#E5A93C] font-bold text-sm">🪔 {t.feature2Title}</span>
                <span className="text-[#94A3B8]">{t.feature2Desc}</span>
              </div>
              <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-3.5 text-xs space-y-1">
                <span className="block text-[#6366F1] font-bold text-sm">🎙️ {t.feature3Title}</span>
                <span className="text-[#94A3B8]">{t.feature3Desc}</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Intake Form with Clean Custom Select Pickers & AD/BS Toggle */}
          <div className="lg:col-span-5" id="form">
            <div className="rounded-[8px] border border-[#E5A93C]/40 bg-[#161B2B] p-6 sm:p-7 space-y-5 shadow-2xl">
              <div className="border-b border-white/10 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#F8FAFC]">{t.birthDetails}</h2>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    {t.heroTagline}
                  </p>
                </div>
              </div>

              <form onSubmit={handleGenerate} className="space-y-4.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    {t.fullName} <span className="text-[#E5A93C]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    placeholder={t.fullName}
                    className={`w-full rounded-[8px] border bg-[#090A10] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:outline-none transition ${
                      errors.name ? "border-rose-500" : "border-white/10 focus:border-[#E5A93C]"
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.name}</p>}
                </div>

                {/* Gender 3-way toggle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    Gender
                  </label>
                  <div className="grid grid-cols-3 gap-2 rounded-[8px] border border-white/10 bg-[#090A10] p-1">
                    {(["male", "female", "other"] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`rounded-[6px] py-1.5 text-xs font-bold capitalize transition ${
                          gender === g
                            ? "bg-[#E5A93C] text-[#090A10]"
                            : "text-[#94A3B8] hover:text-[#F8FAFC]"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modern Date of Birth Calendar Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    {t.birthDate} <span className="text-[#E5A93C]">*</span>
                  </label>
                  <ModernDatePicker
                    era={era}
                    onEraChange={(newEra) => setEra(newEra)}
                    day={day}
                    month={month}
                    year={year}
                    onDateChange={(d, m, y) => {
                      setDay(d);
                      setMonth(m);
                      setYear(y);
                      if (errors.date) setErrors({ ...errors, date: "" });
                    }}
                    error={errors.date}
                  />
                  {errors.date && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.date}</p>}
                </div>

                {/* Modern Time of Birth Visual Clock Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    {t.birthTime} <span className="text-[#E5A93C]">*</span>
                  </label>
                  <ModernTimePicker
                    hour={hour}
                    minute={minute}
                    ampm={ampm}
                    approximateTime={approximateTime}
                    onTimeChange={(h, m, ap) => {
                      setHour(h);
                      setMinute(m);
                      setAmPm(ap);
                      if (errors.time) setErrors({ ...errors, time: "" });
                    }}
                    onApproximateChange={(approx) => setApproximateTime(approx)}
                    error={errors.time}
                  />
                  {errors.time && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.time}</p>}
                </div>

                {/* Custom Place of Birth Autocomplete */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#CBD5E1] mb-1.5">
                    {t.birthPlace} <span className="text-[#E5A93C]">*</span>
                  </label>
                  <CustomPlaceInput
                    value={selectedPlace?.label ?? ""}
                    placeholder={t.birthPlace}
                    onChange={(p) => {
                      setSelectedPlace(p);
                      if (errors.place) setErrors({ ...errors, place: "" });
                    }}
                  />
                  {errors.place && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.place}</p>}
                </div>

                {/* Primary CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-[8px] bg-[#E5A93C] hover:bg-[#F3C766] py-3.5 text-sm font-bold text-[#090A10] transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-md mt-1"
                >
                  <span>✨ {t.calculateKundali}</span>
                  <span className="text-base">→</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Feature Showcase Section */}
      <section className="border-t border-white/10 bg-[#0D101A] py-16" id="features">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5A93C]">Engine Architecture</span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#F8FAFC]">
              Designed for Absolute Astronomical Accuracy
            </h2>
            <p className="text-sm text-[#94A3B8]">
              Combining Swiss Ephemeris sidereal calculation standards with state-of-the-art AI intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-6 space-y-4 transition hover:border-[#E5A93C]/50">
              <div className="size-12 rounded-[8px] bg-[#090A10] border border-white/10 flex items-center justify-center text-2xl text-[#E5A93C]">
                🪐
              </div>
              <h3 className="font-serif text-base font-bold text-[#F8FAFC]">Swiss Ephemeris Core</h3>
              <p className="text-xs leading-relaxed text-[#94A3B8]">
                Computes planetary degrees, house cusps, retrogrades, and historical IANA timezone offsets with 0.001° accuracy.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-6 space-y-4 transition hover:border-[#E5A93C]/50">
              <div className="size-12 rounded-[8px] bg-[#090A10] border border-white/10 flex items-center justify-center text-2xl text-[#F3C766]">
                📊
              </div>
              <h3 className="font-serif text-base font-bold text-[#F8FAFC]">Dual D1 &amp; D9 Charts</h3>
              <p className="text-xs leading-relaxed text-[#94A3B8]">
                Side-by-side North Indian and South Indian interactive charts with house inspector and smart multi-column layout.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-6 space-y-4 transition hover:border-[#E5A93C]/50">
              <div className="size-12 rounded-[8px] bg-[#090A10] border border-white/10 flex items-center justify-center text-2xl text-[#6366F1]">
                🎙️
              </div>
              <h3 className="font-serif text-base font-bold text-[#F8FAFC]">Spoken Audio &amp; Voice</h3>
              <p className="text-xs leading-relaxed text-[#94A3B8]">
                OpenRouter TTS audio narration with natural voice speed controls and real-time live voice consultation.
              </p>
            </div>

            {/* Card 4 */}
            <div className="rounded-[8px] border border-white/10 bg-[#161B2B] p-6 space-y-4 transition hover:border-[#E5A93C]/50">
              <div className="size-12 rounded-[8px] bg-[#090A10] border border-white/10 flex items-center justify-center text-2xl text-[#E5A93C]">
                📜
              </div>
              <h3 className="font-serif text-base font-bold text-[#F8FAFC]">16 Varga Divisions</h3>
              <p className="text-xs leading-relaxed text-[#94A3B8]">
                Complete breakdown of divisional charts from D1 Rashi up to D60 Shashtiamsa with Vimshottari time lord timelines.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="border-t border-white/10 bg-[#090A10] py-8 text-xs text-[#94A3B8]">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-6 place-items-center rounded-[6px] bg-[#E5A93C] text-[#090A10]">
              <svg className="size-4 text-[#090A10]" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 1.5v2.5M12 20v2.5M1.5 12h2.5M20 12h2.5M4.58 4.58l1.77 1.77M17.65 17.65l1.77 1.77M4.58 19.42l1.77-1.77M17.65 6.35l1.77-1.77"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="12" r="5.2" fill="currentColor" />
                <path
                  d="M13.8 8.2a4.5 4.5 0 0 0 0 7.6 4.2 4.2 0 1 1 0-7.6z"
                  fill="#090A10"
                />
              </svg>
            </div>
            <span className="font-serif font-bold text-[#F8FAFC]">KUNDALI.AI</span>
            <span>· Precision Vedic Astronomy &amp; AI</span>
          </div>
          <p className="text-center sm:text-right text-[11px]">
            Calculated via Swiss Ephemeris Lahiri Sidereal Ayanamsa · All Rights Reserved © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
