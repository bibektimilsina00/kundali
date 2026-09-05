"use client";

import Link from "next/link";
import { useTranslation, type Language } from "@/lib/i18n/language-context";

export function MainFooter() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <footer className="border-t border-white/10 bg-[#090A10] text-xs text-[#94A3B8] transition-all">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/5">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="grid size-7.5 place-items-center rounded-[6px] bg-[#E5A93C] text-[#090A10] font-bold shadow-sm">
                <svg className="size-4.5 text-[#090A10]" viewBox="0 0 24 24" fill="none">
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
              <span className="font-serif font-bold text-sm text-[#F8FAFC]">KUNDALI.AI</span>
            </Link>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Precision Sidereal Swiss Ephemeris calculations, Vimshottari Dasha timelines, and real-time AI Astrologer.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="font-serif text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">Features</h4>
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
                <Link href="/reading/live" className="hover:text-[#F3C766] transition">
                  Live AI Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Vargas & Calculations */}
          <div className="space-y-2.5">
            <h4 className="font-serif text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">Engine Accuracy</h4>
            <ul className="space-y-2 text-xs">
              <li className="text-[#94A3B8]">Swiss Ephemeris 0.001° Sidereal</li>
              <li className="text-[#94A3B8]">Lahiri Ayanamsa Standard</li>
              <li className="text-[#94A3B8]">16 Divisional Vargas (D1 - D60)</li>
            </ul>
          </div>

          {/* Language Switcher */}
          <div className="space-y-2.5">
            <h4 className="font-serif text-xs font-bold text-[#F8FAFC] uppercase tracking-wider">Language</h4>
            <div className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#161B2B] border border-white/10 px-3 py-1.5 text-xs text-[#F8FAFC]">
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
