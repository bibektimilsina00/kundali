"use client";

import Link from "next/link";
import { useTranslation, type Language } from "@/lib/i18n/language-context";
import { Sparkles, Globe, ShieldCheck, Compass, Radio, Layers } from "lucide-react";

export function MainFooter() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <footer className="border-t border-white/10 bg-[#090A10] text-xs text-[#94A3B8] transition-all">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/5">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="grid size-7.5 place-items-center rounded-[8px] bg-[#E5A93C] text-[#090A10] font-bold shadow-sm transition group-hover:scale-105">
                <Sparkles className="size-4 text-[#090A10]" />
              </div>
              <span className="font-serif font-bold text-sm text-[#F8FAFC]">KUNDALI.AI</span>
            </Link>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Precision Sidereal Swiss Ephemeris calculations, Vimshottari Dasha timelines, and real-time AI Astrologer.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="font-serif text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="size-3.5 text-[#E5A93C]" /> Features
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#form" className="hover:text-[#F3C766] transition">
                  {t.freeKundali}
                </a>
              </li>
              <li>
                <Link href="/reading" className="hover:text-[#F3C766] transition">
                  {t.vedicReading}
                </Link>
              </li>
              <li>
                <Link href="/reading/live" className="hover:text-[#F3C766] transition flex items-center gap-1.5">
                  <Radio className="size-3 text-rose-400" />
                  Live AI Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Vargas & Calculations */}
          <div className="space-y-2.5">
            <h4 className="font-serif text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-[#E5A93C]" /> Engine Accuracy
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-[#94A3B8] flex items-center gap-1.5">
                <Layers className="size-3 text-[#F3C766]" /> Swiss Ephemeris 0.001° Sidereal
              </li>
              <li className="text-[#94A3B8]">Lahiri Ayanamsa Standard</li>
              <li className="text-[#94A3B8]">16 Divisional Vargas (D1 - D60)</li>
            </ul>
          </div>

          {/* Language Switcher */}
          <div className="space-y-2.5">
            <h4 className="font-serif text-xs font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="size-3.5 text-[#E5A93C]" /> Language
            </h4>
            <div className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#161B2B] border border-white/10 px-3 py-1.5 text-xs text-[#F8FAFC]">
              <Globe className="size-3.5 text-[#E5A93C]" />
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
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#94A3B8]/70">
          <p>© {new Date().getFullYear()} Kundali AI. Calculated via Swiss Ephemeris Lahiri Sidereal Ayanamsa.</p>
          <p>All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
