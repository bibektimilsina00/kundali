"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MainNavbar } from "@/components/layout/main-navbar";
import { useAuth } from "@/features/auth/auth-context";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ShieldCheck,
  BookmarkCheck,
  MessageSquare,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const { user, login, signup } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push("/reading");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password, fullName);
      }
      router.push("/reading");
    } catch (err: any) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
      {/* Left / Top: Main Auth Card */}
      <div className="lg:col-span-7 rounded-[24px] border border-[#E5A93C]/30 bg-[#161B2B]/90 backdrop-blur-xl p-6 sm:p-10 shadow-2xl shadow-[#E5A93C]/10">
        
        {/* Header / Logo */}
        <div className="text-center sm:text-left mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#E5A93C]/30 bg-[#E5A93C]/10 px-3.5 py-1 text-xs font-bold text-[#F3C766] mb-3">
            <Sparkles className="size-4 text-[#E5A93C]" />
            Vedic AI Cloud Vault
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-white tracking-tight">
            {mode === "login" ? "Welcome Back to Kundali.AI" : "Create Your Vault Account"}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            {mode === "login"
              ? "Sign in to access your saved birth charts and conversation history."
              : "Join thousands of seekers receiving precision sidereal astrology."}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="mb-6 grid grid-cols-2 rounded-[12px] border border-white/10 bg-[#090A10] p-1.5">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-[8px] py-2.5 text-xs font-bold transition ${
              mode === "login"
                ? "bg-gradient-to-r from-[#E5A93C] to-[#B87A14] text-[#090A10] shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="size-4" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 rounded-[8px] py-2.5 text-xs font-bold transition ${
              mode === "signup"
                ? "bg-gradient-to-r from-[#E5A93C] to-[#B87A14] text-[#090A10] shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="size-4" />
            Create Account
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 rounded-[12px] border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300 flex items-center gap-2">
            <span className="grid size-5 place-items-center rounded-full bg-red-500/20 text-red-400 font-bold">
              !
            </span>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-[12px] border border-white/10 bg-[#090A10] py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#E5A93C] focus:outline-none focus:ring-1 focus:ring-[#E5A93C] transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-[12px] border border-white/10 bg-[#090A10] py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#E5A93C] focus:outline-none focus:ring-1 focus:ring-[#E5A93C] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-[12px] border border-white/10 bg-[#090A10] py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 focus:border-[#E5A93C] focus:outline-none focus:ring-1 focus:ring-[#E5A93C] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-[#E5A93C] via-[#F3C766] to-[#B87A14] py-3.5 text-sm font-bold text-[#090A10] shadow-lg shadow-[#E5A93C]/20 transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block size-5 animate-spin rounded-full border-2 border-[#090A10] border-t-transparent" />
            ) : mode === "login" ? (
              <>
                <LogIn className="size-4" />
                Sign In to Vault
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                Create Free Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {mode === "login" ? (
            <>
              Don't have a Kundali account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-bold text-[#E5A93C] hover:underline"
              >
                Register now
              </button>
            </>
          ) : (
            <>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-bold text-[#E5A93C] hover:underline"
              >
                Sign In instead
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right / Side Panel: Features Highlight */}
      <div className="lg:col-span-5 space-y-6">
        <div className="rounded-[24px] border border-white/10 bg-[#161B2B]/50 p-6 sm:p-8 space-y-6">
          <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#E5A93C]" />
            Your Vedic Cloud Vault
          </h2>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex gap-3 items-start">
              <div className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#E5A93C]/10 text-[#E5A93C]">
                <BookmarkCheck className="size-4" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-0.5">Save Multiple Birth Charts</h3>
                <p className="text-slate-400 leading-relaxed">
                  Store personal, family, and friend Kundalis with exact birth time & coordinates.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#E5A93C]/10 text-[#E5A93C]">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-0.5">Persistent AI Astrologer History</h3>
                <p className="text-slate-400 leading-relaxed">
                  Never lose deep conversations, career forecasts, or transit guidance.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="grid size-8 shrink-0 place-items-center rounded-[8px] bg-[#E5A93C]/10 text-[#E5A93C]">
                <HeartHandshake className="size-4" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-0.5">36-Guna Ashtakoota Milan</h3>
                <p className="text-slate-400 leading-relaxed">
                  Select two saved Kundalis instantly for marriage and relationship compatibility.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Free & Secure Account</span>
            <Link href="/kundali" className="text-[#E5A93C] font-semibold flex items-center gap-1 hover:underline">
              Free Kundali <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#090A10] text-[#F8FAFC] flex flex-col relative overflow-hidden">
      <MainNavbar />

      {/* Decorative Radial Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-[#E5A93C]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 size-[300px] rounded-full bg-amber-600/10 blur-[100px] pointer-events-none" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <Suspense fallback={<div className="text-xs text-slate-400">Loading...</div>}>
          <LoginFormContent />
        </Suspense>
      </main>
    </div>
  );
}
