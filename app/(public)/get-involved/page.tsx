import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { PageHeader } from "@/components/public/PageHeader";
import { EnquiryForm } from "@/components/public/EnquiryForm";
import { WAYS_TO_HELP } from "@/lib/content/defaults";
import { getBlocks, getSettings } from "@/lib/data/public";
import { displayPhone, paragraphs, telHref } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "Volunteer, partner with or support Sri Ranga Charitable Trust. Send us an enquiry and a member of the Trust will get back to you.",
  alternates: { canonical: "/get-involved/" },
};

const icons: Record<string, React.ReactNode> = {
  volunteer: <path d="M12 20.5s-7.5-4.6-7.5-10.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 2.5c0 5.8-7.5 10.4-7.5 10.4Z" />,
  partner: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  support: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 9.2h6M9 12h6M10.5 9.2c2.4 0 3 2.8 0 2.8H9l4.5 4.6" />
    </>
  ),
};

export default async function GetInvolvedPage() {
  const [settings, blocks] = await Promise.all([getSettings(), getBlocks()]);
  const intro = blocks["involved.intro"];

  return (
    <>
      <PageHeader eyebrow="Get involved" title={intro.title ?? "Stand with us"} intro={paragraphs(intro.body)[0]} />

      <section aria-labelledby="ways-heading" className="py-20 sm:py-24">
        <Container>
          <h2 id="ways-heading" className="sr-only">
            Ways to get involved
          </h2>
          <ul className="grid gap-5 md:grid-cols-3">
            {WAYS_TO_HELP.map((way, i) => (
              <li
                key={way.key}
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 90}ms` } as React.CSSProperties}
                className="rounded-[var(--radius-card)] border border-line bg-white p-8"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {icons[way.key]}
                  </svg>
                </span>
                <h3 className="font-display mt-6 text-2xl font-medium text-brand">{way.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{way.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="form-heading" className="border-t border-line bg-white py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Eyebrow>Enquiry</Eyebrow>
            <h2 id="form-heading" className="font-display mt-5 text-4xl leading-tight font-medium text-brand">
              Tell us how you&apos;d like to help.
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              Share a few details and a member of the Trust will get back to you.
            </p>
            {settings.phone && (
              <p className="mt-8 rounded-2xl bg-paper p-5 text-sm text-muted">
                Prefer to talk?
                <br />
                <a href={telHref(settings.phone)} className="font-display mt-1 inline-block text-xl text-brand">
                  {displayPhone(settings.phone)}
                </a>
              </p>
            )}
          </div>
          <div className="lg:col-span-8">
            <EnquiryForm kind="volunteer" />
          </div>
        </Container>
      </section>
    </>
  );
}
