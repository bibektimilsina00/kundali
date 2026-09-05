"use client";

import { useState, useRef, useEffect } from "react";

interface ModernTimePickerProps {
  hour: string;
  minute: string;
  ampm: "AM" | "PM";
  approximateTime: boolean;
  onTimeChange: (h: string, m: string, ap: "AM" | "PM") => void;
  onApproximateChange: (approx: boolean) => void;
  error?: string;
}

const PRESET_TIMES = [
  { label: "🌅 Morning", h: "06", m: "00", ap: "AM" as const },
  { label: "☀️ Noon", h: "12", m: "00", ap: "PM" as const },
  { label: "🌇 Evening", h: "06", m: "00", ap: "PM" as const },
  { label: "🌙 Night", h: "10", m: "00", ap: "PM" as const },
];

export function ModernTimePicker({
  hour,
  minute,
  ampm,
  approximateTime,
  onTimeChange,
  onApproximateChange,
  error,
}: ModernTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const curHour = hour || "07";
  const curMinute = minute || "30";
  const curAmPm = ampm || "AM";

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

  const formatDisplayTime = () => {
    if (!hour || !minute) return "Select Time of Birth";
    return `${hour}:${minute} ${ampm} ${approximateTime ? "(Approx)" : ""}`;
  };

  const adjustMinute = (delta: number) => {
    let m = parseInt(curMinute, 10) + delta;
    if (m >= 60) m = 0;
    if (m < 0) m = 59;
    onTimeChange(curHour, String(m).padStart(2, "0"), curAmPm);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-[8px] border bg-[#090A10] px-4 py-3 text-xs font-semibold text-[#F8FAFC] transition hover:border-[#E5A93C] focus:outline-none ${
          error ? "border-rose-500" : isOpen ? "border-[#E5A93C] ring-1 ring-[#E5A93C]" : "border-white/10"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base text-[#E5A93C]">🕒</span>
          <span className={hour && minute ? "text-[#F8FAFC] font-medium" : "text-[#94A3B8]/50"}>
            {formatDisplayTime()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#161B2B] px-2 py-0.5 text-[10px] font-bold text-[#E5A93C] border border-white/10">
            {curAmPm}
          </span>
          <svg
            className={`size-4 text-[#94A3B8] transition-transform duration-200 ${isOpen ? "rotate-180 text-[#E5A93C]" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Floating Popover Time Picker Modal */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full max-w-sm rounded-[8px] border border-[#E5A93C]/30 bg-[#161B2B] p-4 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header Digital Clock Readout & AM/PM Toggle */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-1 font-mono text-2xl font-bold tracking-widest text-[#F3C766]">
              <span>{curHour}</span>
              <span className="animate-pulse">:</span>
              <span>{curMinute}</span>
              <span className="text-xs text-[#E5A93C] ml-1">{curAmPm}</span>
            </div>

            {/* AM / PM Segmented Control */}
            <div className="flex rounded-[6px] border border-white/10 bg-[#090A10] p-1 text-xs font-bold">
              {(["AM", "PM"] as const).map((ap) => (
                <button
                  key={ap}
                  type="button"
                  onClick={() => onTimeChange(curHour, curMinute, ap)}
                  className={`rounded-[4px] px-3 py-1 transition ${
                    curAmPm === ap
                      ? "bg-[#E5A93C] text-[#090A10]"
                      : "text-[#94A3B8] hover:text-[#F8FAFC]"
                  }`}
                >
                  {ap}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Presets Strip */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Quick Time Presets</span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_TIMES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onTimeChange(preset.h, preset.m, preset.ap)}
                  className="rounded-[6px] border border-white/10 bg-[#090A10] py-1.5 px-2 text-[11px] font-semibold text-[#CBD5E1] hover:border-[#E5A93C] hover:text-[#F3C766] transition flex items-center justify-between"
                >
                  <span>{preset.label}</span>
                  <span className="text-[10px] text-[#94A3B8]">{preset.h}:{preset.m} {preset.ap}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hours Picker Grid (1-12) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Select Hour</span>
            <div className="grid grid-cols-6 gap-1 text-center">
              {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => {
                const isSelected = curHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onTimeChange(h, curMinute, curAmPm)}
                    className={`rounded-[6px] py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? "bg-[#E5A93C] text-[#090A10] shadow"
                        : "text-[#CBD5E1] hover:bg-white/10 hover:text-[#F8FAFC]"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minutes Picker Grid (00..55) & Fine Control */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Select Minute</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustMinute(-1)}
                  className="size-6 rounded border border-white/10 bg-[#090A10] text-xs font-bold text-[#F8FAFC] hover:border-[#E5A93C]"
                >
                  -
                </button>
                <span className="text-xs font-bold font-mono text-[#F3C766] px-1">{curMinute}</span>
                <button
                  type="button"
                  onClick={() => adjustMinute(1)}
                  className="size-6 rounded border border-white/10 bg-[#090A10] text-xs font-bold text-[#F8FAFC] hover:border-[#E5A93C]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-1 text-center">
              {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => {
                const isSelected = curMinute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onTimeChange(curHour, m, curAmPm)}
                    className={`rounded-[6px] py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? "bg-[#E5A93C] text-[#090A10] shadow"
                        : "text-[#CBD5E1] hover:bg-white/10 hover:text-[#F8FAFC]"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Approximate Checkbox & Done Button */}
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <label className="flex items-center gap-2 text-xs text-[#94A3B8] cursor-pointer">
              <input
                type="checkbox"
                checked={approximateTime}
                onChange={(e) => onApproximateChange(e.target.checked)}
                className="rounded border-white/20 bg-[#090A10] text-[#E5A93C] focus:ring-0"
              />
              <span>Approximate time</span>
            </label>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-[6px] bg-[#E5A93C] px-4 py-1.5 text-xs font-bold text-[#090A10] transition hover:bg-[#F3C766]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
