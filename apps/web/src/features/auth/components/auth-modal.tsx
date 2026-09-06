"use client";

import React, { useState } from "react";
import { useLogin, useSignup } from "@/features/auth/hooks/use-auth";
import { loginSchema, signupSchema } from "@/features/auth/schema/auth-forms";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { X, Lock, Mail, User, Sparkles, LogIn, UserPlus } from "lucide-react";

export function AuthModal() {
  const isAuthModalOpen = useAuthStore((s) => s.isAuthModalOpen);
  const authModalMode = useAuthStore((s) => s.authModalMode);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const login = useLogin();
  const signup = useSignup();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === "login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate before the round trip so a short password is caught here
      // rather than as a 422 the user has to interpret.
      if (isLogin) {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        await login.mutateAsync(parsed.data);
      } else {
        const parsed = signupSchema.safeParse({
          email,
          password,
          full_name: fullName,
        });
        if (!parsed.success) throw new Error(parsed.error.issues[0].message);
        await signup.mutateAsync(parsed.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-[16px] border border-[#E5A93C]/30 bg-[#090A10] p-6 shadow-2xl shadow-[#E5A93C]/10 sm:p-8">
        {/* Top Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-[12px] bg-gradient-to-br from-[#F3C766] via-[#E5A93C] to-[#B87A14] text-[#090A10] shadow-lg shadow-[#E5A93C]/20">
            <Sparkles className="size-6 stroke-[2.2]" />
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#F8FAFC]">
            {isLogin ? "Sign In to Kundali Vault" : "Create Your Vault Account"}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {isLogin
              ? "Access your saved Kundalis and full conversation history."
              : "Sync your charts across devices and unlock Vedic matchmaking."}
          </p>
        </div>

        {/* Form Error */}
        {error && (
          <div className="mb-4 rounded-[8px] border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-[10px] border border-white/10 bg-[#161B2B] py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-[#E5A93C] focus:outline-none focus:ring-1 focus:ring-[#E5A93C]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-[10px] border border-white/10 bg-[#161B2B] py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-[#E5A93C] focus:outline-none focus:ring-1 focus:ring-[#E5A93C]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-[10px] border border-white/10 bg-[#161B2B] py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-[#E5A93C] focus:outline-none focus:ring-1 focus:ring-[#E5A93C]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#E5A93C] to-[#B87A14] py-3 text-sm font-bold text-[#090A10] shadow-md transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? (
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-[#090A10] border-t-transparent" />
            ) : isLogin ? (
              <>
                <LogIn className="size-4" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Modal Footer Switcher */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => openAuthModal("signup")}
                className="font-bold text-[#E5A93C] hover:underline"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => openAuthModal("login")}
                className="font-bold text-[#E5A93C] hover:underline"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
