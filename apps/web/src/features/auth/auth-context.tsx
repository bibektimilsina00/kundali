"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface SavedKundali {
  id: string;
  user_id: string;
  name: string;
  gender: string;
  dob: string;
  tob: string;
  lat: number;
  lon: number;
  tz_offset: number;
  place_name: string;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup";
  savedKundalis: SavedKundali[];
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  saveKundaliToVault: (data: Omit<SavedKundali, "id" | "user_id" | "created_at">) => Promise<SavedKundali>;
  refreshSavedKundalis: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "kundali_auth_token";
const USER_KEY = "kundali_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [savedKundalis, setSavedKundalis] = useState<SavedKundali[]>([]);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to load auth credentials", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      refreshSavedKundalis();
    } else {
      setSavedKundalis([]);
    }
  }, [token]);

  const openAuthModal = (mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (email: string, pass: string) => {
    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || "Login failed. Check your credentials.");
    }

    const data = await res.json();
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    closeAuthModal();
  };

  const signup = async (email: string, pass: string, name: string) => {
    const res = await fetch("/api/v1/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass, full_name: name }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || "Signup failed.");
    }

    const data = await res.json();
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    closeAuthModal();
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSavedKundalis([]);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const refreshSavedKundalis = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/v1/vault/kundalis", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setSavedKundalis(list);
        }
      }
    } catch (e) {
      console.error("Failed to fetch saved Kundalis", e);
    }
  };

  const saveKundaliToVault = async (
    data: Omit<SavedKundali, "id" | "user_id" | "created_at">
  ): Promise<SavedKundali> => {
    if (!token) {
      openAuthModal("login");
      throw new Error("Please sign in to save your Kundali to Cloud Vault.");
    }

    const res = await fetch("/api/v1/vault/kundalis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || err.error || "Failed to save Kundali.");
    }

    const saved = await res.json();
    setSavedKundalis((prev) => [saved, ...prev]);
    return saved;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        savedKundalis,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
        saveKundaliToVault,
        refreshSavedKundalis,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
