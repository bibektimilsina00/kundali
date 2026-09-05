import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";
import Script from "next/script";

import { AuthProvider } from "@/features/auth/auth-context";
import { AuthModal } from "@/features/auth/auth-modal";
import { QueryProvider } from "@/providers/query-provider";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { PostHogProvider } from "@/providers/posthog-provider";

import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-serif-face",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kundali AI — Precision Vedic Astrology & Live AI Astrologer",
  description:
    "Experience personalized Vedic Kundali readings through deep narrative analysis, natural audio playback, and live conversational AI.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiHost = process.env.NEXT_PUBLIC_UMAMI_HOST || "https://cloud.umami.is/script.js";

  return (
    <html lang="en" className={`${cinzel.variable} ${body.variable} dark`}>
      <body className="font-body antialiased bg-[#090A10] text-[#94A3B8] min-h-dvh">
        <PostHogProvider>
          <LanguageProvider>
            <AuthProvider>
              <QueryProvider>
                {children}
                <AuthModal />
              </QueryProvider>
            </AuthProvider>
          </LanguageProvider>
        </PostHogProvider>
        {umamiWebsiteId && (
          <Script
            src={umamiHost}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
