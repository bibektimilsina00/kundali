"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
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

  const handleGoogleSignIn = () => {
    // Quick demo login or Google OAuth link
    setEmail("demo.user@kundali.ai");
    setPassword("demopass123");
  };

  return (
    <div className="relative w-full max-w-[440px] z-20 mx-auto">
      {/* Central Login Card */}
      <div className="overflow-hidden rounded-[20px] border border-white/10 bg-[#12141D]/95 backdrop-blur-2xl shadow-2xl shadow-black/80 transition-all">
        
        {/* Main Card Content */}
        <div className="p-7 sm:p-8">
          
          {/* App Logo Badge */}
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-[14px] bg-gradient-to-br from-[#F3C766] via-[#E5A93C] to-[#B87A14] text-[#090A10] shadow-lg shadow-[#E5A93C]/25 transition-transform duration-300 hover:scale-105">
            <Sparkles className="size-6 text-[#090A10] stroke-[2.2]" />
          </div>

          {/* Heading & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#F8FAFC]">
              {mode === "login" ? "Sign in to Kundali.AI" : "Create your Kundali account"}
            </h1>
            <p className="mt-1 text-xs text-[#94A3B8]">
              {mode === "login"
                ? "Welcome back! Please sign in to continue"
                : "Welcome! Fill in your details to get started"}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="relative flex w-full items-center justify-center gap-3 rounded-[10px] border border-white/10 bg-[#1A1D2A] px-4 py-2.5 text-xs font-semibold text-[#F8FAFC] transition duration-200 hover:border-white/20 hover:bg-[#222638]"
            >
              {/* Google G Logo */}
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.3 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.18 0 10.02 0 12s.46 3.82 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
              <span className="absolute right-3 rounded bg-[#E5A93C]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#F3C766] border border-[#E5A93C]/30">
                Fast
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-[#12141D] px-3 text-[11px] text-[#94A3B8]">
              or
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 rounded-[10px] border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-[10px] border border-white/10 bg-[#1A1D2A] py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:border-[#E5A93C] focus:outline-none focus:ring-1 focus:ring-[#E5A93C] transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-[10px] border border-white/10 bg-[#1A1D2A] py-2.5 pl-10 pr-3.5 text-xs text-white placeholder-slate-500 focus:border-[#E5A93C] focus:outline-none focus:ring-1 focus:ring-[#E5A93C] transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#CBD5E1]">
                  Password
                </label>
                {mode === "login" && (
                  <span className="text-[11px] text-[#E5A93C] hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-[10px] border border-white/10 bg-[#1A1D2A] py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-500 focus:border-[#E5A93C] focus:outline-none focus:ring-1 focus:ring-[#E5A93C] transition"
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

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#E5A93C] via-[#F3C766] to-[#B87A14] py-3 text-xs font-bold text-[#090A10] shadow-md shadow-[#E5A93C]/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-[#090A10] border-t-transparent" />
              ) : mode === "login" ? (
                <>
                  <span>Continue</span>
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="size-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Sub-Card Section */}
        <div className="border-t border-white/10 bg-[#0E1017] px-7 py-4 text-center text-xs text-[#94A3B8]">
          {mode === "login" ? (
            <span>
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="font-bold text-[#E5A93C] hover:underline"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="font-bold text-[#E5A93C] hover:underline"
              >
                Sign in
              </button>
            </span>
          )}
        </div>

        {/* Security Badge Footer */}
        <div className="border-t border-white/5 bg-[#0A0B10] py-2.5 text-center text-[10px] font-medium text-[#64748B] flex items-center justify-center gap-1.5">
          <ShieldCheck className="size-3.5 text-[#E5A93C]" />
          <span>Secured by Kundali Vault Encrypted Auth</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#090A10] text-[#F8FAFC] flex flex-col justify-between relative overflow-hidden font-body">
      
      {/* Top Header Bar */}
      <header className="relative z-30 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="grid size-8 place-items-center rounded-[8px] bg-gradient-to-br from-[#F3C766] via-[#E5A93C] to-[#B87A14] text-[#090A10] font-bold shadow-md shadow-[#E5A93C]/15">
            <Sparkles className="size-4 text-[#090A10] stroke-[2.2]" />
          </div>
          <span className="font-serif text-sm font-bold tracking-wider text-[#F8FAFC]">
            KUNDALI.AI
          </span>
        </Link>

        <Link
          href="/kundali"
          className="text-xs font-semibold text-[#E5A93C] hover:underline flex items-center gap-1"
        >
          Free Kundali <ArrowRight className="size-3" />
        </Link>
      </header>

      {/* BACKGROUND GRAPHICS: Left & Right Polygonal Zodiac Panels */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Central Golden Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-[#E5A93C]/10 blur-[140px]" />
        
        {/* Left Side Polygonal Graphic Panel */}
        <div className="hidden lg:block absolute left-[-8%] top-1/2 -translate-y-1/2 w-[38%] h-[75%] border border-[#E5A93C]/20 bg-gradient-to-r from-[#161B2B]/40 to-transparent backdrop-blur-sm [clip-path:polygon(0_0,85%_0,100%_50%,85%_100%,0_100%)]">
          <div className="p-12 space-y-6 opacity-40">
            <div className="font-serif text-xs uppercase tracking-[0.3em] text-[#E5A93C]">
              Vedic Sidereal Astronomy
            </div>
            <div className="text-3xl font-serif font-extrabold text-white leading-tight">
              Precision Planetary Ephemeris & Dasha
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#E5A93C]" />
                <span>36-Guna Ashtakoota Marriage Matching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#E5A93C]" />
                <span>Conversational Real-time AI Astrologer</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 text-[#E5A93C]" />
                <span>Complete Vimshottari Dasha Timeline</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Polygonal Graphic Panel */}
        <div className="hidden lg:block absolute right-[-8%] top-1/2 -translate-y-1/2 w-[38%] h-[75%] border border-[#E5A93C]/20 bg-gradient-to-l from-[#161B2B]/40 to-transparent backdrop-blur-sm [clip-path:polygon(15%_0,100%_0,100%_100%,15%_100%,0_50%)]">
          <div className="p-12 space-y-6 opacity-40 text-right">
            <div className="font-serif text-xs uppercase tracking-[0.3em] text-[#E5A93C]">
              Vedic Cloud Vault
            </div>
            <div className="text-3xl font-serif font-extrabold text-white leading-tight">
              Encrypted Multi-Chart Storage
            </div>
            <div className="space-y-2 text-xs text-slate-300 flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span>Save Unlimited Family Kundalis</span>
                <CheckCircle2 className="size-3.5 text-[#E5A93C]" />
              </div>
              <div className="flex items-center gap-2">
                <span>Synchronized Across Web & Mobile</span>
                <CheckCircle2 className="size-3.5 text-[#E5A93C]" />
              </div>
              <div className="flex items-center gap-2">
                <span>Instant Kuja (Manglik) Dosha Audit</span>
                <CheckCircle2 className="size-3.5 text-[#E5A93C]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-xs text-slate-400">Loading auth portal...</div>}>
          <LoginFormContent />
        </Suspense>
      </main>

      {/* Footer Bar */}
      <footer className="relative z-30 py-6 text-center text-xs text-[#64748B]">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <span>© 2026 Kundali.AI</span>
          <span className="text-slate-700">·</span>
          <Link href="#" className="hover:text-slate-300 transition">Support</Link>
          <span className="text-slate-700">·</span>
          <Link href="#" className="hover:text-slate-300 transition">Privacy</Link>
          <span className="text-slate-700">·</span>
          <Link href="#" className="hover:text-slate-300 transition">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
