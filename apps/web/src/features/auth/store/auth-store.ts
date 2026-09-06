"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { UserProfile } from "@/features/auth/types";

/**
 * Session identity and auth-modal state. UI and identity only — no server data.
 * The saved-kundali list is server state and lives in TanStack Query
 * (`features/vault`), not here.
 */
interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup";
  setSession: (token: string, user: UserProfile) => void;
  clearSession: () => void;
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthModalOpen: false,
      authModalMode: "login",
      setSession: (token, user) => set({ token, user, isAuthModalOpen: false }),
      clearSession: () => set({ token: null, user: null }),
      openAuthModal: (mode = "login") =>
        set({ isAuthModalOpen: true, authModalMode: mode }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),
    }),
    {
      name: "nakhatra-auth",
      // Modal state is per-visit; persisting it would reopen the dialog on load.
      // ponytail: the token is persisted to localStorage, which matches the
      // behaviour this replaces. It is readable by any injected script — moving
      // it to an httpOnly cookie set by the proxy is the real fix, and is a
      // session-behaviour change that does not belong in a refactor.
      partialize: (s) => ({ token: s.token, user: s.user }),
    },
  ),
);

/** Bearer headers for an authenticated call, or `{}` when signed out. */
export function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
