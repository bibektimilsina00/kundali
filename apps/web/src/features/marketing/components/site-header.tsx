"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { useSession } from "@/features/auth/hooks/use-auth";

/**
 * The site header: two dropdown menus, four links, and a mobile panel.
 *
 * Menus open on hover and on click, close on Escape, on an outside click,
 * and when focus leaves them — a hover-only menu is unreachable by
 * keyboard, and a panel hidden with opacity alone still takes focus.
 */
export function SiteHeader() {
  const navRef = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);
  const [mobOpen, setMobOpen] = useState(false);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);
  const { user } = useSession();

  useEffect(() => {
    const onScroll = () => setStuck(scrollY > 40);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = navRef.current;
    if (!root) return;
    const menus = [...root.querySelectorAll<HTMLElement>(".navmenu")];
    const timers = new Map<HTMLElement, number>();

    const set = (m: HTMLElement, open: boolean) => {
      m.dataset.open = String(open);
      m.querySelector(".navbtn")?.setAttribute("aria-expanded", String(open));
    };
    const closeAll = (except: HTMLElement | null) =>
      menus.forEach((m) => m !== except && set(m, false));

    const off: Array<() => void> = [];
    menus.forEach((m) => {
      const btn = m.querySelector<HTMLElement>(".navbtn");
      const enter = () => {
        clearTimeout(timers.get(m));
        closeAll(m);
        set(m, true);
      };
      // A short delay, or the diagonal move from button into panel closes it.
      const leave = () => timers.set(m, window.setTimeout(() => set(m, false), 120));
      const click = (e: Event) => {
        e.preventDefault();
        const open = m.dataset.open !== "true";
        closeAll(m);
        set(m, open);
      };
      const blur = (e: FocusEvent) => {
        if (!m.contains(e.relatedTarget as Node)) set(m, false);
      };
      m.addEventListener("pointerenter", enter);
      m.addEventListener("pointerleave", leave);
      m.addEventListener("focusout", blur);
      btn?.addEventListener("click", click);
      off.push(() => {
        m.removeEventListener("pointerenter", enter);
        m.removeEventListener("pointerleave", leave);
        m.removeEventListener("focusout", blur);
        btn?.removeEventListener("click", click);
      });
    });

    const esc = (e: KeyboardEvent) => e.key === "Escape" && closeAll(null);
    const outside = (e: MouseEvent) =>
      !(e.target as HTMLElement).closest(".navmenu") && closeAll(null);
    addEventListener("keydown", esc);
    addEventListener("click", outside);

    return () => {
      off.forEach((f) => f());
      timers.forEach(clearTimeout);
      removeEventListener("keydown", esc);
      removeEventListener("click", outside);
    };
  }, []);

  return (
    <div ref={navRef as React.RefObject<HTMLDivElement>}>
      <header
            id="hdr"
            className={`fixed inset-x-0 top-0 z-50 transition-all duration-300${
              stuck ? " border-b border-white/[0.07] bg-ink/85 backdrop-blur" : ""
            }`}
          >
        <div className="mx-auto flex max-w-[1360px] items-center justify-between px-8 py-4">
          <div className="flex items-center gap-9">
          <a href="#top" className="flex items-center gap-2.5">
            <svg viewBox="0 0 100 100" className="size-7 text-gold" fill="none" stroke="currentColor">
              <g strokeWidth="3.2" strokeLinejoin="round"><rect x="12" y="12" width="76" height="76" rx="1.5"/><path d="M50 12 L88 50 L50 88 L12 50 Z"/><path d="M12 12 L88 88 M88 12 L12 88" strokeWidth="2" opacity=".55"/></g>
              <path d="M50 12 L69 31 L50 50 L31 31 Z" fill="currentColor" stroke="none"/>
            </svg>
            <span className="font-logo text-sm font-bold tracking-[0.18em] text-paper">NAKHATRA</span>
          </a>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            <div className="navmenu relative">
              <button type="button" className="navbtn flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-paper" aria-expanded="false" aria-haspopup="true">Features <svg className="navchev size-3 transition-transform" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 4.5 6 7.5l3-3"/></svg></button>
              <div className="navpanel absolute left-0 top-full pt-3">
                <div className="w-[560px] rounded-[8px] border border-white/12 bg-[#0B0E18]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
                  <div className="grid grid-cols-2 gap-0.5"><a href="#chart" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M12 3.5 20.5 12 12 20.5 3.5 12Z"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Create a kundali</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Nine grahas, twelve bhavas, sixteen vargas.</span>
                  </span>
                </a><a href="#reading" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Read the analysis</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Seven sections, each citing its placements.</span>
                  </span>
                </a><a href="#ask" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a7.5 7.5 0 0 1-10.9 6.7L4 20l1.3-4.1A7.5 7.5 0 1 1 20 12Z"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Ask the astrologer</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">By text or out loud, in three languages.</span>
                  </span>
                </a><a href="#milan" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.2-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.8-7 9-7 9Z"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Kundali Milan</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Ashtakoota across all eight kutas.</span>
                  </span>
                </a><a href="#astrologers" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><path d="M16.5 6.5a3.2 3.2 0 0 1 0 6"/><path d="M18 19.5a5.5 5.5 0 0 0-2-4.3"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Consult a jyotish<span className="ml-2 rounded-[3px] border border-gold/35 px-1 py-px font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-gold">Soon</span></span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">A verified human, holding your chart.</span>
                  </span>
                </a></div>
                  <div className="mt-1 flex items-center justify-between gap-4 rounded-[6px] border-t border-white/[0.08] px-3 py-2.5">
                    <span className="text-[12px] text-faint">One chart, carried through all of it.</span>
                    <a href="#form" className="shrink-0 text-[12.5px] font-semibold text-gold transition-colors hover:text-gold2">Start free →</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="navmenu relative">
              <button type="button" className="navbtn flex items-center gap-1.5 rounded-[6px] px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-paper" aria-expanded="false" aria-haspopup="true">Learn <svg className="navchev size-3 transition-transform" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 4.5 6 7.5l3-3"/></svg></button>
              <div className="navpanel absolute left-0 top-full pt-3">
                <div className="w-[560px] rounded-[8px] border border-white/12 bg-[#0B0E18]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
                  <div className="grid grid-cols-2 gap-0.5"><span title="Coming soon" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05] cursor-default opacity-70">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4.5h14v15H5z"/><path d="M8 9h8M8 12.5h8M8 16h5"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Blog</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Jyotish explained, one idea at a time.</span>
                  </span>
                </span><span title="Coming soon" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05] cursor-default opacity-70">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.2v5l3 1.8"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">The 27 nakshatras</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">What each one governs, and its pada.</span>
                  </span>
                </span><span title="Coming soon" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05] cursor-default opacity-70">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 3.5H20V12l-8.4 8.4a1.5 1.5 0 0 1-2.1 0l-6.4-6.4a1.5 1.5 0 0 1 0-2.1L11.5 3.5Z"/><circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Vimshottari dasha</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">How the 120-year cycle is reckoned.</span>
                  </span>
                </span><a href="#how" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17.5 9 12l3.5 3.5L20 7"/><path d="M15.5 7H20v4.5"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">How it works</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Why the maths and the meaning stay apart.</span>
                  </span>
                </a><a href="#accuracy" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.3 2.5 3.5 5.3 3.5 8.5S14.3 18 12 20.5C9.7 18 8.5 15.2 8.5 12S9.7 6 12 3.5Z"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Why charts disagree</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Time zones, and what they cost you.</span>
                  </span>
                </a></div>
                </div>
              </div>
            </div>

            <span className="cursor-default rounded-[6px] px-3 py-2 text-[13.5px] text-faint" title="Coming soon">Pricing <span className="ml-1 rounded-[3px] border border-white/12 px-1 py-px font-mono text-[8px] uppercase tracking-[0.12em]">Soon</span></span>
            <span className="cursor-default rounded-[6px] px-3 py-2 text-[13.5px] text-faint" title="Coming soon">Blog <span className="ml-1 rounded-[3px] border border-white/12 px-1 py-px font-mono text-[8px] uppercase tracking-[0.12em]">Soon</span></span>
            <a href="#astrologers" className="flex items-center gap-2 rounded-[6px] px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-paper">For astrologers</a>
          </nav>
          </div>

          <div className="flex items-center gap-3 text-[13px]">
            <span className="hidden text-faint xl:inline">EN · नेपाली · हिन्दी</span>
            {user ? (
        <Link href="/kundali" className="hidden text-muted transition-colors hover:text-paper sm:inline">
          My charts
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="hidden text-muted transition-colors hover:text-paper sm:inline"
        >
          Sign in
        </button>
      )}
            <a href="#form" className="rounded-[8px] bg-gold px-4 py-2 font-semibold text-ink transition hover:bg-gold2">Start free</a>
            <button type="button" id="mobbtn" onClick={() => setMobOpen((v) => !v)} className="-mr-1 rounded-[6px] p-1.5 text-muted transition-colors hover:text-paper lg:hidden" aria-expanded="false" aria-controls="mobnav" aria-label="Menu">
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
            </button>
          </div>
        </div>

        {/* The links above are useless on a phone without this. */}
        <div id="mobnav" hidden={!mobOpen} className="border-t border-white/[0.08] bg-[#0B0E18]/97 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto max-w-[1360px] px-8 py-5" aria-label="Mobile" onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setMobOpen(false);
            }}>
            <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2"><a href="#chart" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="1.5"/><path d="M12 3.5 20.5 12 12 20.5 3.5 12Z"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Create a kundali</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Nine grahas, twelve bhavas, sixteen vargas.</span>
                  </span>
                </a><a href="#reading" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Read the analysis</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Seven sections, each citing its placements.</span>
                  </span>
                </a><a href="#ask" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12a7.5 7.5 0 0 1-10.9 6.7L4 20l1.3-4.1A7.5 7.5 0 1 1 20 12Z"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Ask the astrologer</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">By text or out loud, in three languages.</span>
                  </span>
                </a><a href="#milan" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.2-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.8-7 9-7 9Z"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Kundali Milan</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Ashtakoota across all eight kutas.</span>
                  </span>
                </a><a href="#astrologers" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0"/><path d="M16.5 6.5a3.2 3.2 0 0 1 0 6"/><path d="M18 19.5a5.5 5.5 0 0 0-2-4.3"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Consult a jyotish<span className="ml-2 rounded-[3px] border border-gold/35 px-1 py-px font-mono text-[8px] font-bold uppercase tracking-[0.12em] text-gold">Soon</span></span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">A verified human, holding your chart.</span>
                  </span>
                </a><span title="Coming soon" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05] cursor-default opacity-70">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4.5h14v15H5z"/><path d="M8 9h8M8 12.5h8M8 16h5"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Blog</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Jyotish explained, one idea at a time.</span>
                  </span>
                </span><span title="Coming soon" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05] cursor-default opacity-70">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.2v5l3 1.8"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">The 27 nakshatras</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">What each one governs, and its pada.</span>
                  </span>
                </span><span title="Coming soon" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05] cursor-default opacity-70">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11.5 3.5H20V12l-8.4 8.4a1.5 1.5 0 0 1-2.1 0l-6.4-6.4a1.5 1.5 0 0 1 0-2.1L11.5 3.5Z"/><circle cx="16" cy="8" r="1.2" fill="currentColor" stroke="none"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Vimshottari dasha</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">How the 120-year cycle is reckoned.</span>
                  </span>
                </span><a href="#how" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17.5 9 12l3.5 3.5L20 7"/><path d="M15.5 7H20v4.5"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">How it works</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Why the maths and the meaning stay apart.</span>
                  </span>
                </a><a href="#accuracy" className="group/i flex gap-3 rounded-[6px] p-2.5 transition-colors hover:bg-white/[0.05]">
                  <span className="mt-px shrink-0 text-faint transition-colors group-hover/i:text-gold"><svg className="size-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.3 2.5 3.5 5.3 3.5 8.5S14.3 18 12 20.5C9.7 18 8.5 15.2 8.5 12S9.7 6 12 3.5Z"/></svg></span>
                  <span className="min-w-0">
                    <span className="flex items-center text-[13.5px] font-medium text-paper">Why charts disagree</span>
                    <span className="mt-0.5 block text-[12px] leading-[1.55] text-faint">Time zones, and what they cost you.</span>
                  </span>
                </a></div>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.08] pt-4 text-[13.5px]">
              <span className="cursor-default text-faint" title="Coming soon">Pricing <span className="ml-1 rounded-[3px] border border-white/12 px-1 py-px font-mono text-[8px] uppercase tracking-[0.12em]">Soon</span></span>
              <a href="#astrologers" className="text-muted transition-colors hover:text-paper">For astrologers</a>
              <button
          type="button"
          onClick={() => { setMobOpen(false); openAuthModal("login"); }}
          className="text-muted transition-colors hover:text-paper"
        >
          Sign in
        </button>
              <span className="ml-auto font-mono text-[11px] text-faint">EN · नेपाली · हिन्दी</span>
            </div>
          </nav>
        </div>
      </header>
    </div>
  );
}
