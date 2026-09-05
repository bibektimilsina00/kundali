"use client";

import { useState } from "react";
import type { ChatMessage } from "../types";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { speakText, stopSpeech } from "@/lib/utils/audio-speaker";
import type { Language } from "@/lib/i18n/translations";
import { Volume2, VolumeX, Copy, Check, Sparkles } from "lucide-react";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  masterAstrologerLabel: string;
  groundedInChartLabel: string;
  language?: Language;
  onHighlightHouse?: (house: number) => void;
}

export function ChatMessageBubble({
  message,
  masterAstrologerLabel,
  groundedInChartLabel,
  language = "en",
  onHighlightHouse,
}: ChatMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleCopy = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      stopSpeech();
      setIsPlayingAudio(true);
      speakText(message.text, {
        language,
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => setIsPlayingAudio(false),
      });
    }
  };

  const isUser = message.sender === "user";

  if (isUser) {
    return (
      <div className="flex flex-col items-end space-y-1.5 ml-auto max-w-[85%] sm:max-w-[78%] animate-fade-in group">
        <div className="relative rounded-[14px] rounded-tr-[2px] bg-gradient-to-r from-[#E5A93C] via-[#F3C766] to-[#E5A93C] p-3.5 sm:p-4 text-xs sm:text-sm font-semibold text-[#090A10] shadow-[0_4px_25px_rgba(229,169,60,0.22)] border border-[#F3C766]/60 leading-relaxed transition-all">
          <p className="whitespace-pre-wrap">{message.text}</p>

          {/* Floating Copy Action on Hover */}
          <button
            onClick={handleCopy}
            className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-[6px] bg-[#161B2B] border border-white/10 text-[#94A3B8] hover:text-[#F3C766] text-[10px]"
            title="Copy message"
          >
            {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          </button>
        </div>
        <span className="text-[10px] font-medium text-[#94A3B8]/60 px-1">{message.timestamp}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start space-y-2 max-w-[92%] sm:max-w-[88%] animate-fade-in group">
      {/* Header Avatar & Metadata Bar */}
      <div className="flex items-center justify-between w-full px-1">
        <div className="flex items-center gap-2">
          <div className="relative size-6 rounded-full bg-gradient-to-br from-[#E5A93C] to-[#F3C766] text-[#090A10] flex items-center justify-center font-serif text-[11px] font-bold shadow-md ring-2 ring-[#E5A93C]/30">
            <span>🕉️</span>
          </div>
          <span className="text-xs font-serif font-bold text-[#E5A93C] tracking-wide">
            {masterAstrologerLabel}
          </span>
          <span className="text-[10px] text-[#94A3B8]/60">• {message.timestamp}</span>
        </div>

        {/* Quick Action Tools: Speak Audio & Copy */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleAudio}
            className={`p-1.5 rounded-[6px] border text-[11px] transition-all cursor-pointer ${
              isPlayingAudio
                ? "bg-[#E5A93C]/20 border-[#E5A93C] text-[#F3C766]"
                : "bg-[#090A10] border-white/10 text-[#94A3B8] hover:text-[#F8FAFC] hover:border-white/20"
            }`}
            title={isPlayingAudio ? "Stop Audio" : "Listen Audio"}
          >
            {isPlayingAudio ? (
              <VolumeX className="size-3.5 text-amber-300 animate-pulse" />
            ) : (
              <Volume2 className="size-3.5 text-[#94A3B8]" />
            )}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-[6px] bg-[#090A10] border border-white/10 text-[#94A3B8] hover:text-[#F8FAFC] hover:border-white/20 text-[11px] transition-all cursor-pointer"
            title="Copy Astrologer Response"
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Astrologer Message Card Body with Markdown */}
      <div className="w-full rounded-[14px] rounded-tl-[2px] border border-white/10 bg-gradient-to-br from-[#161B2B] via-[#121625] to-[#0D0F19] p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-[#F8FAFC] shadow-xl space-y-3 relative">
        <MarkdownRenderer content={message.text} />

        {/* Grounded Message Bubbles */}
        {message.astrologicalBasis && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-[11px]">
            <span className="text-[#E5A93C] font-semibold flex items-center gap-1">
              <span>📍</span> {groundedInChartLabel}:
            </span>
            <button
              onClick={() => {
                if (onHighlightHouse) {
                  const house = message.text.includes("7th") ? 7 : 10;
                  onHighlightHouse(house);
                }
              }}
              className="rounded-[8px] bg-[#090A10] border border-[#E5A93C]/40 px-2.5 py-1 text-[#F3C766] hover:bg-[#E5A93C]/15 hover:border-[#E5A93C] transition shadow-sm font-medium flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Sparkles className="size-3 text-[#E5A93C]" />
              <span>{message.astrologicalBasis}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
