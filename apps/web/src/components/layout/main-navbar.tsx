"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslation, type Language } from "@/lib/i18n/language-context";
import { Globe, ChevronDown, Check, Sparkles, Languages } from "lucide-react";

const LANGUAGES: { code: Language; label: string; flag: string; nativeName: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧", nativeName: "English" },
  { code: "ne", label: "Nepali", flag: "🇳🇵", nativeName: "नेपाली" },
  { code: "hi", label: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
];

export function MainNavbar() {
  const { language, setLanguage } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#090A10]/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-8 py-3">
        {/* Left: Branding */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="grid size-9 place-items-center rounded-[8px] bg-gradient-to-br from-[#F3C766] via-[#E5A93C] to-[#B87A14] text-[#090A10] font-bold shadow-md shadow-[#E5A93C]/15 transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="size-5 text-[#090A10] stroke-[2.2]" />
          </div>
          <div>
            <span className="block font-serif text-base font-bold tracking-wider text-[#F8FAFC] group-hover:text-[#F3C766] transition">
              KUNDALI.AI
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-[#E5A93C]">
              Precision Sidereal Astronomy
            </span>
          </div>
        </Link>

        {/* Right ONLY: Premium Custom Language Switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-[8px] bg-[#161B2B] border border-white/15 px-3.5 py-2 text-xs font-bold text-[#F8FAFC] shadow-inner hover:border-[#E5A93C]/50 hover:bg-[#1E2538] transition duration-200 active:scale-95"
            aria-label="Select Application Language"
          >
            <Languages className="size-4 text-[#E5A93C]" />
            <span className="text-[#F3C766] font-medium">{activeLang.flag}</span>
            <span>{activeLang.nativeName}</span>
            <ChevronDown
              className={`size-3.5 text-[#94A3B8] transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-[#E5A93C]" : ""
              }`}
            />
          </button>

          {/* Floating Glassmorphic Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-[8px] border border-white/15 bg-[#161B2B]/95 p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]/70 border-b border-white/10 flex items-center justify-between">
                <span>Select Language</span>
                <Globe className="size-3 text-[#E5A93C]" />
              </div>
              <div className="pt-1 space-y-1">
                {LANGUAGES.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-[6px] px-3 py-2 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-[#E5A93C]/15 text-[#F3C766] border border-[#E5A93C]/30"
                          : "text-[#CBD5E1] hover:bg-white/5 hover:text-[#F8FAFC]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      {isSelected && <Check className="size-4 text-[#E5A93C]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
