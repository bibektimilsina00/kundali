"use client";

import Link from "next/link";
import { CustomLanguageSelector } from "@/components/ui/custom-language-selector";
import { Sparkles } from "lucide-react";

export function MainNavbar() {
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

        {/* Right: Reusable Custom Language Selector */}
        <CustomLanguageSelector />
      </div>
    </header>
  );
}
