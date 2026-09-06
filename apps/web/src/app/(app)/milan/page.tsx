"use client";

import React, { useState } from "react";
import { MainNavbar } from "@/components/layout/main-navbar";
import { CustomPlaceInput } from "@/components/ui/custom-place-input";
import { useSession } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useSavedKundalis } from "@/features/vault/hooks/use-vault";
import type { SavedKundali } from "@/features/vault/types";
import { placeFromSavedKundali } from "@/features/milan/from-saved-kundali";
import { useCalculateMatch } from "@/features/milan/hooks/use-calculate-match";
import type { MilanResponse } from "@/features/milan/types";
import { trackEvent } from "@/providers/posthog-provider";
import { Place } from "@/features/kundali/types";
import {
  HeartHandshake,
  Sparkles,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  BookmarkCheck,
  Info,
} from "lucide-react";

const DEFAULT_PLACE: Place = {
  id: 1,
  label: "Kathmandu, Nepal",
  name: "Kathmandu",
  country_code: "NP",
  country: "Nepal",
  tz_name: "Asia/Kathmandu",
  latitude: 27.7172,
  longitude: 85.324,
  admin1: "Bagmati",
  matched_as: "Kathmandu",
};

export default function MilanPage() {
  const { user } = useSession();
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const { data: savedKundalis = [] } = useSavedKundalis();

  // Groom (Var) State
  const [groomName, setGroomName] = useState("Var (Groom)");
  const [groomDob, setGroomDob] = useState("1995-08-15");
  const [groomTob, setGroomTob] = useState("08:30");
  const [groomPlace, setGroomPlace] = useState<Place>(DEFAULT_PLACE);

  // Bride (Vadhu) State
  const [brideName, setBrideName] = useState("Vadhu (Bride)");
  const [brideDob, setBrideDob] = useState("1997-11-20");
  const [brideTob, setBrideTob] = useState("14:15");
  const [bridePlace, setBridePlace] = useState<Place>(DEFAULT_PLACE);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MilanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const calculateMatch = useCalculateMatch();

  const handleSelectGroomSaved = (k: SavedKundali) => {
    const place = placeFromSavedKundali(k);
    if (!place) {
      setError(
        `"${k.name}" was saved before birthplace timezones were recorded. ` +
          "Pick the birthplace below so the chart is calculated correctly.",
      );
    }
    setGroomName(k.name);
    setGroomDob(k.dob);
    setGroomTob(k.tob.slice(0, 5));
    if (place) setGroomPlace(place);
  };

  const handleSelectBrideSaved = (k: SavedKundali) => {
    const place = placeFromSavedKundali(k);
    if (!place) {
      setError(
        `"${k.name}" was saved before birthplace timezones were recorded. ` +
          "Pick the birthplace below so the chart is calculated correctly.",
      );
    }
    setBrideName(k.name);
    setBrideDob(k.dob);
    setBrideTob(k.tob.slice(0, 5));
    if (place) setBridePlace(place);
  };

  const handleCalculateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        groom_name: groomName,
        groom: {
          name: groomName,
          date: groomDob,
          time: groomTob.length === 5 ? `${groomTob}:00` : groomTob,
          latitude: groomPlace.latitude,
          longitude: groomPlace.longitude,
          tz_name: groomPlace.tz_name,
          place_label: groomPlace.label,
          time_accuracy: "exact" as const,
        },
        bride_name: brideName,
        bride: {
          name: brideName,
          date: brideDob,
          time: brideTob.length === 5 ? `${brideTob}:00` : brideTob,
          latitude: bridePlace.latitude,
          longitude: bridePlace.longitude,
          tz_name: bridePlace.tz_name,
          place_label: bridePlace.label,
          time_accuracy: "exact" as const,
        },
      };

      setResult(await calculateMatch.mutateAsync(payload));
    } catch (err) {
      // `errData.error` is the envelope object; throwing it rendered as
      // "[object Object]". ApiError parses it and carries a usable message.
      setError(err instanceof Error ? err.message : "Failed to calculate match.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A10] text-[#F8FAFC]">
      <MainNavbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Header Hero */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5A93C]/30 bg-[#E5A93C]/10 px-3.5 py-1 text-xs font-bold text-[#F3C766]">
            <HeartHandshake className="size-4 text-[#E5A93C]" />
            Vedic Ashtakoota Matchmaking
          </div>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-[#F8FAFC] sm:text-4xl">
            Kundali Milan & Marriage Compatibility
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl mx-auto">
            Analyze 36-Guna Ashta Kuta compatibility, Kuja (Manglik) Dosha, and spiritual alignment between Var & Vadhu.
          </p>
        </div>

        {/* Input Cards Grid */}
        <form onSubmit={handleCalculateMatch} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Var (Groom) Card */}
            <div className="rounded-[16px] border border-[#E5A93C]/30 bg-[#161B2B] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 rounded-bl-[12px] bg-[#E5A93C]/20 px-3 py-1 text-[11px] font-bold text-[#F3C766]">
                Var (Groom)
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="grid size-8 place-items-center rounded-full bg-[#E5A93C]/20 text-[#E5A93C]">
                  👦
                </div>
                <h3 className="font-serif text-lg font-bold text-white">Groom Details</h3>
              </div>

              {/* Saved Kundalis Quick Picker */}
              {user && savedKundalis.length > 0 && (
                <div className="mb-4 rounded-[10px] border border-white/10 bg-[#090A10] p-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <BookmarkCheck className="size-3 text-[#E5A93C]" /> Select from Cloud Vault
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {savedKundalis.map((k: SavedKundali) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => handleSelectGroomSaved(k)}
                        className="rounded-[6px] border border-white/10 bg-[#161B2B] px-2.5 py-1 text-xs text-slate-200 hover:border-[#E5A93C] hover:text-[#F3C766] transition"
                      >
                        {k.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Groom Name</label>
                  <input
                    type="text"
                    required
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    className="w-full rounded-[8px] border border-white/10 bg-[#090A10] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E5A93C] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Birth Date</label>
                    <input
                      type="date"
                      required
                      value={groomDob}
                      onChange={(e) => setGroomDob(e.target.value)}
                      className="w-full rounded-[8px] border border-white/10 bg-[#090A10] px-3.5 py-2.5 text-xs text-white focus:border-[#E5A93C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Birth Time</label>
                    <input
                      type="time"
                      required
                      value={groomTob}
                      onChange={(e) => setGroomTob(e.target.value)}
                      className="w-full rounded-[8px] border border-white/10 bg-[#090A10] px-3.5 py-2.5 text-xs text-white focus:border-[#E5A93C] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Birth Place</label>
                  <CustomPlaceInput
                    value={groomPlace.label}
                    onChange={(p) => setGroomPlace(p)}
                    placeholder="Search city for Groom"
                  />
                </div>
              </div>
            </div>

            {/* Vadhu (Bride) Card */}
            <div className="rounded-[16px] border border-[#E5A93C]/30 bg-[#161B2B] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 rounded-bl-[12px] bg-[#E5A93C]/20 px-3 py-1 text-[11px] font-bold text-[#F3C766]">
                Vadhu (Bride)
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="grid size-8 place-items-center rounded-full bg-[#E5A93C]/20 text-[#E5A93C]">
                  👧
                </div>
                <h3 className="font-serif text-lg font-bold text-white">Bride Details</h3>
              </div>

              {/* Saved Kundalis Quick Picker */}
              {user && savedKundalis.length > 0 && (
                <div className="mb-4 rounded-[10px] border border-white/10 bg-[#090A10] p-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <BookmarkCheck className="size-3 text-[#E5A93C]" /> Select from Cloud Vault
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {savedKundalis.map((k: SavedKundali) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => handleSelectBrideSaved(k)}
                        className="rounded-[6px] border border-white/10 bg-[#161B2B] px-2.5 py-1 text-xs text-slate-200 hover:border-[#E5A93C] hover:text-[#F3C766] transition"
                      >
                        {k.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bride Name</label>
                  <input
                    type="text"
                    required
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    className="w-full rounded-[8px] border border-white/10 bg-[#090A10] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E5A93C] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Birth Date</label>
                    <input
                      type="date"
                      required
                      value={brideDob}
                      onChange={(e) => setBrideDob(e.target.value)}
                      className="w-full rounded-[8px] border border-white/10 bg-[#090A10] px-3.5 py-2.5 text-xs text-white focus:border-[#E5A93C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Birth Time</label>
                    <input
                      type="time"
                      required
                      value={brideTob}
                      onChange={(e) => setBrideTob(e.target.value)}
                      className="w-full rounded-[8px] border border-white/10 bg-[#090A10] px-3.5 py-2.5 text-xs text-white focus:border-[#E5A93C] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Birth Place</label>
                  <CustomPlaceInput
                    value={bridePlace.label}
                    onChange={(p) => setBridePlace(p)}
                    placeholder="Search city for Bride"
                  />
                </div>
              </div>
            </div>
          </div>

          {!user && (
            <div className="flex items-center justify-between rounded-[12px] border border-[#E5A93C]/20 bg-[#E5A93C]/5 px-4 py-3 text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <Info className="size-4 text-[#E5A93C]" />
                Sign in to save these Kundalis to your Cloud Vault and access past readings.
              </span>
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="font-bold text-[#E5A93C] hover:underline"
              >
                Sign In
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-[10px] border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-[12px] bg-gradient-to-r from-[#E5A93C] via-[#F3C766] to-[#B87A14] px-8 py-3.5 text-sm font-bold text-[#090A10] shadow-lg shadow-[#E5A93C]/20 transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="inline-block size-4 animate-spin rounded-full border-2 border-[#090A10] border-t-transparent" />
                  Analyzing 36 Guna Alignment...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Calculate Kundali Milan Compatibility
                </>
              )}
            </button>
          </div>
        </form>

        {/* RESULTS SECTION */}
        {result && (
          <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Scorecard Banner */}
            <div className="rounded-[20px] border border-[#E5A93C]/40 bg-gradient-to-b from-[#161B2B] to-[#090A10] p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                <div className="text-center sm:text-left">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#E5A93C]">
                    Matchmaking Synthesis
                  </span>
                  <h2 className="mt-1 font-serif text-2xl font-bold text-white sm:text-3xl">
                    {result.groom_name} & {result.bride_name}
                  </h2>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="size-4" />
                    {result.recommendation}
                  </div>
                </div>

                {/* Score Gauge Circle */}
                <div className="relative flex flex-col items-center">
                  <div className="grid size-32 place-items-center rounded-full border-4 border-[#E5A93C] bg-[#161B2B] shadow-inner shadow-[#E5A93C]/30">
                    <div className="text-center">
                      <span className="block font-serif text-3xl font-extrabold text-[#F3C766]">
                        {result.total_guna}
                      </span>
                      <span className="block text-2xs font-semibold text-slate-400">
                        out of 36 Gunas
                      </span>
                    </div>
                  </div>
                  <span className="mt-2 text-xs font-bold text-[#E5A93C]">
                    {result.percentage}% Compatibility
                  </span>
                </div>
              </div>
            </div>

            {/* Manglik Dosha Comparison */}
            <div className="rounded-[16px] border border-white/10 bg-[#161B2B] p-6 shadow-xl">
              <h3 className="font-serif text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="size-5 text-[#E5A93C]" />
                Kuja (Manglik) Dosha Analysis
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-[12px] border border-white/5 bg-[#090A10] p-4">
                  <span className="text-xs font-bold text-slate-400 block mb-1">
                    {result.groom_name} (Groom)
                  </span>
                  {result.groom_manglik.is_manglik ? (
                    <div className="text-amber-400 font-semibold text-sm">
                      ⚠️ Manglik (House {result.groom_manglik.houses.join(", ")})
                    </div>
                  ) : (
                    <div className="text-emerald-400 font-semibold text-sm">
                      ✅ Non-Manglik
                    </div>
                  )}
                </div>

                <div className="rounded-[12px] border border-white/5 bg-[#090A10] p-4">
                  <span className="text-xs font-bold text-slate-400 block mb-1">
                    {result.bride_name} (Bride)
                  </span>
                  {result.bride_manglik.is_manglik ? (
                    <div className="text-amber-400 font-semibold text-sm">
                      ⚠️ Manglik (House {result.bride_manglik.houses.join(", ")})
                    </div>
                  ) : (
                    <div className="text-emerald-400 font-semibold text-sm">
                      ✅ Non-Manglik
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-[10px] border border-[#E5A93C]/20 bg-[#E5A93C]/10 p-3.5 text-xs text-[#F3C766]">
                <strong>Manglik Verdict:</strong> {result.manglik_compatibility.reason}
              </div>
            </div>

            {/* 8-Kuta Table */}
            <div className="rounded-[16px] border border-white/10 bg-[#161B2B] p-6 shadow-xl overflow-hidden">
              <h3 className="font-serif text-lg font-bold text-white mb-4">
                Ashta Kuta Breakdown (36 Guna Detailed Analysis)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 bg-[#090A10]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Kuta Category</th>
                      <th className="px-4 py-3 font-semibold">Score</th>
                      <th className="px-4 py-3 font-semibold">Progress</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {result.kutas.map((k) => (
                      <tr key={k.name} className="hover:bg-white/5 transition">
                        <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">
                          {k.name}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#F3C766] whitespace-nowrap">
                          {k.obtained} / {k.max_points}
                        </td>
                        <td className="px-4 py-3.5 w-40">
                          <div className="h-2 w-full rounded-full bg-[#090A10] overflow-hidden border border-white/10">
                            <div
                              className="h-full bg-gradient-to-r from-[#E5A93C] to-[#F3C766]"
                              style={{ width: `${(k.obtained / k.max_points) * 100}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">{k.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
