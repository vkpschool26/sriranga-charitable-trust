import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS } from "@/lib/site";
import { displayPhone, formatDate, telHref } from "@/lib/format";
import type { SiteSettingsRow } from "@/types/database";

export function SiteFooter({ settings }: { settings: SiteSettingsRow }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-auto overflow-hidden bg-brand-900 text-white">
      <svg aria-hidden="true" viewBox="0 0 600 600" className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] opacity-[0.07]">
        <circle cx="300" cy="300" r="260" fill="none" stroke="#8bcb55" strokeWidth="40" />
        <circle cx="300" cy="300" r="170" fill="none" stroke="#3189d5" strokeWidth="40" />
      </svg>
      <Container className="relative grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo shortName={settings.short_name} trustName={settings.trust_name} tagline={settings.tagline} showTagline="always" tone="dark" />
          <p className="mt-6 max-w-sm leading-relaxed text-white/70">{settings.footer_note}</p>
        </div>

        <nav aria-label="Footer" className="md:col-span-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Explore</h2>
          <ul className="mt-5 space-y-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/80 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/donate/" className="text-white/80 transition-colors hover:text-white">
                Donate
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Reach us</h2>
          <address className="mt-5 space-y-4 not-italic text-white/80">
            {settings.address && <p className="leading-relaxed">{settings.address}</p>}
            {settings.phone && (
              <p>
                <a href={telHref(settings.phone)} className="font-semibold text-white hover:text-leaf">
                  {displayPhone(settings.phone)}
                </a>
              </p>
            )}
          </address>
          {settings.registration_no && (
            <p className="mt-6 text-sm leading-relaxed text-white/55">
              Registered trust · Reg. No. {settings.registration_no}
              {settings.registration_date && <> · {formatDate(settings.registration_date)}</>}
              {settings.registrar && <> · {settings.registrar}</>}
            </p>
          )}
        </div>
      </Container>
      <div className="relative border-t border-white/10">
        <Container className="flex flex-col gap-3 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.trust_name}. All rights reserved.
          </p>
          <Link href="/privacy-policy/" className="hover:text-white">
            Privacy Policy
          </Link>
        </Container>
      </div>
    </footer>
  );
}
