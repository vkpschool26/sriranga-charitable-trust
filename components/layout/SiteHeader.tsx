"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/site";
import { displayPhone, telHref } from "@/lib/format";

interface SiteHeaderProps {
  shortName: string;
  trustName: string;
  tagline: string;
  phone: string | null;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href);
}

export function SiteHeader({ shortName, trustName, tagline, phone }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-paper/90 backdrop-blur-md" : "border-b border-transparent bg-paper"
      }`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
        <Logo shortName={shortName} trustName={trustName} tagline={tagline} />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative rounded-full px-3.5 py-2 text-[0.92rem] font-medium transition-colors ${
                      active ? "text-brand" : "text-ink/75 hover:text-brand"
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span aria-hidden="true" className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-leaf" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/donate/" variant="primary" size="sm" className="px-5">
            Donate
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-brand hover:bg-brand-50 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto bg-paper lg:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto max-w-6xl px-5 pb-10 pt-4 sm:px-8">
          <ul className="divide-y divide-line border-y border-line">
            {[{ href: "/", label: "Home" }, ...NAV_LINKS].map((link) => {
              const active = link.href === "/" ? pathname === "/" : isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between py-4 font-display text-2xl ${
                      active ? "text-brand" : "text-ink/80"
                    }`}
                  >
                    {link.label}
                    <span aria-hidden="true" className={`h-2 w-2 rounded-full ${active ? "bg-leaf" : "bg-transparent"}`} />
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 flex flex-col gap-3">
            <ButtonLink href="/donate/" size="lg">Donate</ButtonLink>
            <ButtonLink href="/get-involved/" variant="outline" size="lg">Get Involved</ButtonLink>
          </div>
          {phone && (
            <p className="mt-8 text-sm text-muted">
              Call us:{" "}
              <a href={telHref(phone)} className="font-semibold text-brand">
                {displayPhone(phone)}
              </a>
            </p>
          )}
        </nav>
      </div>
    </header>
  );
}
