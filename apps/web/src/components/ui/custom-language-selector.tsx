"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation, type Language } from "@/lib/i18n/language-context";
import { Globe, ChevronDown, Check, Languages } from "lucide-react";

export const LANGUAGES: { code: Language; label: string; flag: string; nativeName: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧", nativeName: "English" },
  { code: "ne", label: "Nepali", flag: "🇳🇵", nativeName: "नेपाली" },
  { code: "hi", label: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
];

interface CustomLanguageSelectorProps {
  value?: Language;
  onChange?: (lang: Language) => void;
  className?: string;
  dropUp?: boolean;
  size?: "sm" | "md";
}

export function CustomLanguageSelector({
  value,
  onChange,
  className = "",
  dropUp = false,
  size = "md",
}: CustomLanguageSelectorProps) {
  const { language: contextLang, setLanguage: contextSetLang } = useTranslation();
  const currentLangCode = value ?? contextLang;

  const handleSelect = (langCode: Language) => {
    if (onChange) {
      onChange(langCode);
    } else {
      contextSetLang(langCode);
    }
    setDropdownOpen(false);
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = LANGUAGES.find((l) => l.code === currentLangCode) || LANGUAGES[0];

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

  const isSm = size === "sm";

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={`flex items-center justify-between gap-2 rounded-[8px] bg-[#161B2B] border border-white/15 text-xs font-bold text-[#F8FAFC] shadow-inner hover:border-[#E5A93C]/50 hover:bg-[#1E2538] transition duration-200 active:scale-95 cursor-pointer ${
          isSm ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-2 text-xs"
        }`}
        aria-label="Select Application Language"
        aria-expanded={dropdownOpen}
      >
        <div className="flex items-center gap-2">
          <Languages className={`${isSm ? "size-3.5" : "size-4"} text-[#E5A93C] shrink-0`} />
          <span className="text-[#F3C766] font-medium">{activeLang.flag}</span>
          <span className="truncate">{activeLang.nativeName}</span>
        </div>
        <ChevronDown
          className={`size-3.5 text-[#94A3B8] transition-transform duration-200 shrink-0 ${
            dropdownOpen ? "rotate-180 text-[#E5A93C]" : ""
          }`}
        />
      </button>

      {/* Floating Glassmorphic Dropdown Menu */}
      {dropdownOpen && (
        <div
          className={`absolute ${
            dropUp ? "bottom-full mb-2" : "top-full mt-2"
          } right-0 w-44 sm:w-48 overflow-hidden rounded-[8px] border border-[#E5A93C]/30 bg-[#161B2B]/95 p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 z-50`}
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] border-b border-white/10 flex items-center justify-between">
            <span>Select Language</span>
            <Globe className="size-3 text-[#E5A93C]" />
          </div>

          <div className="pt-1 space-y-1">
            {LANGUAGES.map((lang) => {
              const isSelected = currentLangCode === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`flex w-full items-center justify-between rounded-[6px] px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    isSelected
                      ? "bg-[#E5A93C]/15 text-[#F3C766] border border-[#E5A93C]/30"
                      : "text-[#CBD5E1] hover:bg-white/5 hover:text-[#F8FAFC] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                  </div>
                  {isSelected && <Check className="size-3.5 text-[#E5A93C]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Alias for convenience
