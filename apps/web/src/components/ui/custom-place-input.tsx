"use client";

import { useState, useRef, useEffect } from "react";
import { searchPlaces, DEFAULT_POPULAR_PLACES } from "@/features/kundali/api/places.api";
import type { Place } from "@/features/kundali/types";

interface CustomPlaceInputProps {
  value: string;
  onChange: (place: Place) => void;
  placeholder?: string;
}

export function CustomPlaceInput({
  value,
  onChange,
  placeholder = "Search city, e.g. Kathmandu or San Francisco",
}: CustomPlaceInputProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Place[]>(DEFAULT_POPULAR_PLACES);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    let active = true;
    searchPlaces(query).then((res) => {
      if (active) setSuggestions(res);
    });
    return () => {
      active = false;
    };
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        type="text"
        required
        value={query}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        placeholder={placeholder}
        className="w-full rounded-[8px] border border-white/10 bg-[#090A10] px-3.5 py-2.5 text-xs text-[#F8FAFC] placeholder-[#94A3B8]/40 focus:border-[#E5A93C] focus:outline-none transition"
      />

      {/* Floating Suggestions Menu */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-[8px] border border-white/10 bg-[#161B2B] p-1.5 shadow-2xl space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] border-b border-white/5">
            Select Birthplace Coordinates & Timezone
          </div>
          {suggestions.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setQuery(p.label);
                onChange(p);
                setIsOpen(false);
              }}
              className="w-full rounded-[6px] px-2.5 py-2 text-left transition hover:bg-white/5 flex items-center justify-between group"
            >
              <div>
                <span className="block text-xs font-bold text-[#F8FAFC] group-hover:text-[#F3C766]">
                  📍 {p.label}
                </span>
                <span className="block text-[10px] text-[#94A3B8]">
                  TZ: {p.tz_name} · Lat: {p.latitude.toFixed(2)}°, Lng: {p.longitude.toFixed(2)}°
                </span>
              </div>
              <span className="rounded bg-[#090A10] px-2 py-0.5 text-[10px] font-bold text-[#E5A93C] border border-white/10">
                {p.country_code}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
