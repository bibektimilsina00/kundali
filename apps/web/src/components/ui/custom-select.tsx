"use client";

import { useState, useRef, useEffect } from "react";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
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
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-[8px] border border-white/10 bg-[#090A10] px-3 py-2.5 text-xs font-semibold text-[#F8FAFC] hover:border-[#E5A93C] focus:border-[#E5A93C] focus:outline-none transition"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg
          className={`size-3.5 shrink-0 text-[#94A3B8] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#E5A93C]" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover Options Menu */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-[8px] border border-white/10 bg-[#161B2B] p-1 shadow-2xl">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full rounded-[6px] px-3 py-1.5 text-left text-xs font-semibold transition ${
                  isSelected
                    ? "bg-[#E5A93C] text-[#090A10]"
                    : "text-[#94A3B8] hover:bg-white/5 hover:text-[#F8FAFC]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
