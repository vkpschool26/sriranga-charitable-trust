import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { PageHeader } from "@/components/public/PageHeader";
import { EnquiryForm } from "@/components/public/EnquiryForm";
import { getSettings } from "@/lib/data/public";
import { displayPhone, telHref } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Sri Ranga Charitable Trust — Sri Maradiranganatha Nilaya, Manchaladore, Gubbi Taluk, Tumkur District, Karnataka 572117. Phone 8095032044.",
  alternates: { canonical: "/contact/" },
};

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader eyebrow="Contact" title="We'd love to hear from you." intro="Call us, visit our registered office, or send a message using the form below." />

      <section className="py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            {settings.phone && (
              <a
                href={telHref(settings.phone)}
                className="group block rounded-[var(--radius-card)] bg-brand p-8 text-white transition-colors hover:bg-brand-900"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">Phone</p>
                <p className="font-display mt-3 text-3xl">{displayPhone(settings.phone)}</p>
                <p className="mt-2 text-sm text-white/70">Tap to call</p>
              </a>
            )}
            {settings.address && (
              <div className="rounded-[var(--radius-card)] border border-line bg-white p-8">
                <Eyebrow>Registered office</Eyebrow>
                <address className="mt-4 not-italic leading-relaxed text-ink/80">
                  <span className="font-semibold text-brand">{settings.trust_name}</span>
                  <br />
                  {settings.address}
                </address>
                {settings.map_url && (
                  <a
                    href={settings.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 font-semibold text-brand hover:text-sky"
                  >
                    View on Google Maps
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                      <path d="M8 4H4v12h12v-4M11 4h5v5M16 4l-7 7" />
                    </svg>
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <h2 className="font-display text-3xl font-medium text-brand">Send us a message</h2>
            <div className="mt-8">
              <EnquiryForm kind="contact" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
