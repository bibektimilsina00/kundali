"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation, type Language } from "@/lib/i18n/language-context";

export function MainNavbar() {
  const { language, setLanguage, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090A10]/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="grid size-9.5 place-items-center rounded-[8px] bg-gradient-to-br from-[#F3C766] via-[#E5A93C] to-[#C88A22] text-[#090A10] font-bold shadow-md shadow-[#E5A93C]/10 transition-transform duration-300 group-hover:scale-105">
            <svg className="size-5.5 text-[#090A10]" viewBox="0 0 24 24" fill="none">
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
          <div>
            <span className="block font-serif text-base font-bold tracking-wider text-[#F8FAFC] group-hover:text-[#F3C766] transition">
              KUNDALI.AI
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#E5A93C]">
              Precision Sidereal Astronomy &amp; AI
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#CBD5E1]">
          <a href="#form" className="hover:text-[#F3C766] transition">
            {t.freeKundali}
          </a>
          <Link
            href="/reading/live"
            className="hover:text-[#F3C766] transition flex items-center gap-1.5 rounded-full bg-[#161B2B] border border-white/10 px-3 py-1 text-[#F8FAFC]"
          >
            <span className="inline-block size-2 rounded-full bg-rose-500 animate-pulse" />
            Live AI Astrologer
          </Link>
          <Link href="/reading" className="hover:text-[#F3C766] transition">
            {t.vedicReading}
          </Link>
        </nav>

        {/* Right Actions: Language Switcher + Primary CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Custom Language Pill */}
          <div className="flex items-center gap-1.5 rounded-[8px] bg-[#161B2B] border border-white/10 px-3 py-1.5 text-xs font-semibold text-[#F8FAFC] hover:border-[#E5A93C]/40 transition">
            <span className="text-sm">🌐</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-[#F3C766] text-xs font-bold focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-[#161B2B] text-white">
                English 🇬🇧
              </option>
              <option value="ne" className="bg-[#161B2B] text-white">
                नेपाली 🇳🇵
              </option>
              <option value="hi" className="bg-[#161B2B] text-white">
                हिन्दी 🇮🇳
              </option>
            </select>
          </div>

          <a
            href="#form"
            className="rounded-[8px] bg-gradient-to-r from-[#E5A93C] to-[#F3C766] px-4 py-2 text-xs font-bold text-[#090A10] shadow-md shadow-[#E5A93C]/10 transition-all hover:opacity-95 hover:shadow-lg"
          >
            ✨ {t.freeKundali}
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Language Pill */}
          <div className="flex items-center gap-1 rounded-[6px] bg-[#161B2B] border border-white/10 px-2 py-1 text-xs text-[#F3C766]">
            <span>🌐</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-xs font-bold focus:outline-none"
            >
              <option value="en" className="bg-[#161B2B] text-white">EN</option>
              <option value="ne" className="bg-[#161B2B] text-white">NE</option>
              <option value="hi" className="bg-[#161B2B] text-white">HI</option>
            </select>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="grid size-9 place-items-center rounded-[8px] border border-white/10 bg-[#161B2B] text-[#F8FAFC]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <svg className="size-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            ) : (
              <svg className="size-5 fill-current" viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#161B2B] px-6 py-4 space-y-3 text-xs font-semibold text-[#CBD5E1] animate-in slide-in-from-top-2">
          <a
            href="#form"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F8FAFC] border-b border-white/5"
          >
            ✨ {t.freeKundali}
          </a>
          <Link
            href="/reading/live"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-rose-400 border-b border-white/5"
          >
            <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
            Live AI Consultation
          </Link>
          <Link
            href="/reading"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F8FAFC]"
          >
            {t.vedicReading}
          </Link>
        </div>
      )}
    </header>
  );
}
