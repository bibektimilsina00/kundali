import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";

import { QueryProvider } from "@/providers/query-provider";
import { LanguageProvider } from "@/lib/i18n/language-context";

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
  return (
    <html lang="en" className={`${cinzel.variable} ${body.variable} dark`}>
      <body className="font-body antialiased bg-[#090A10] text-[#94A3B8] min-h-dvh">
        <LanguageProvider>
          <QueryProvider>{children}</QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
