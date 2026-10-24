import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CauseIcon } from "@/components/ui/CauseIcon";
import { Container } from "@/components/ui/Container";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { PageHeader } from "@/components/public/PageHeader";
import { DonateInvolveCTA } from "@/components/public/DonateInvolveCTA";
import { FUNDING_NOTE, HOW_WE_WORK } from "@/lib/content/defaults";
import { getBlocks, getCauses, getSettings, getTrustees } from "@/lib/data/public";
import { formatDate, paragraphs } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story, mission and Board of Trustees of Sri Ranga Charitable Trust (SRC Trust), a registered charitable trust in Manchaladore, Gubbi Taluk, Tumkur District.",
  alternates: { canonical: "/about-us/" },
};

export default async function AboutPage() {
  const [settings, blocks, causes, trustees] = await Promise.all([
    getSettings(),
    getBlocks(),
    getCauses(),
    getTrustees(),
  ]);
  const story = blocks["about.story"];
  const mission = blocks["about.mission"];
  const vision = blocks["about.vision"];

  const facts = [
    { label: "Name", value: settings.trust_name },
    { label: "Also known as", value: settings.short_name },
    { label: "Founded", value: formatDate(settings.founded_on) },
    { label: "Registered", value: formatDate(settings.registration_date) },
    { label: "Registration no.", value: settings.registration_no },
    { label: "Registering office", value: settings.registrar },
    { label: "Registered office", value: settings.address },
  ].filter((f) => f.value);

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="Rooted in Manchaladore. Committed to people in need."
        intro={mission.body}
      />

      {/* Story + registration facts */}
      <section aria-labelledby="story-heading" className="py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="story-heading" className="font-display text-4xl font-medium text-brand sm:text-5xl">
              {story.title}
            </h2>
            <div className="prose-trust mt-8 text-lg leading-relaxed text-ink/80">
              {paragraphs(story.body).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          <aside aria-label="Registration details" className="lg:col-span-5">
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-7 sm:p-8 lg:sticky lg:top-28">
              <Eyebrow>Registration</Eyebrow>
              <dl className="mt-6 divide-y divide-line">
                {facts.map((f) => (
                  <div key={f.label} className="grid grid-cols-5 gap-4 py-3.5 text-sm">
                    <dt className="col-span-2 text-muted">{f.label}</dt>
                    <dd className="col-span-3 font-medium text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </Container>
      </section>

      {/* Mission & vision */}
      <section aria-label="Mission and vision" className="pb-20 sm:pb-28">
        <Container className="grid gap-5 md:grid-cols-2">
          <div data-reveal className="rounded-[1.75rem] bg-brand p-8 text-white sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">{mission.title}</p>
            <p className="font-display mt-5 text-2xl leading-snug sm:text-3xl">{mission.body}</p>
          </div>
          <div data-reveal className="rounded-[1.75rem] bg-leaf-50 p-8 sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf-deep">{vision.title}</p>
            <p className="font-display mt-5 text-2xl leading-snug text-brand sm:text-3xl">{vision.body}</p>
          </div>
        </Container>
      </section>

      {/* Objectives */}
      <section aria-labelledby="objectives-heading" className="border-y border-line bg-white py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5" id="objectives-heading">
            <SectionHeading
              eyebrow="Our objectives"
              title="What our founding deed commits us to"
              intro="The Trust's registered deed sets out the charitable objectives it exists to pursue. These are our commitments — we will report our work against them as it begins."
            />
            <p className="mt-8 leading-relaxed text-muted">{FUNDING_NOTE}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {causes.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/what-we-do/#${c.slug}`}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-line p-5 transition-colors hover:border-sky/50 hover:bg-brand-50/50"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
                    <CauseIcon name={c.icon} className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="font-semibold text-brand">{c.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">{c.summary}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* How we work */}
      <section aria-labelledby="how-heading" className="py-20 sm:py-28">
        <Container>
          <div id="how-heading">
            <SectionHeading eyebrow="How we work" title="Accountable by design" />
          </div>
          <dl className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_WE_WORK.map((item) => (
              <div key={item.title} data-reveal className="rounded-[var(--radius-card)] border border-line bg-white p-6">
                <dt className="font-display text-lg font-medium text-brand">{item.title}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted">{item.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Board of Trustees */}
      <section id="trustees" aria-labelledby="trustees-heading" className="bg-white py-20 sm:py-28">
        <Container>
          <div id="trustees-heading">
            <SectionHeading
              eyebrow="Board of Trustees"
              title="The people who guide the Trust"
              intro="The Trust is governed by its Board of Trustees, who serve without remuneration."
            />
          </div>
          {trustees.length > 0 ? (
            <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trustees.map((t) => (
                <li key={t.id} data-reveal className="flex flex-col rounded-[var(--radius-card)] border border-line bg-paper p-7">
                  <div className="flex items-center gap-5">
                    <Avatar name={t.name} photoPath={t.photo_path} photoAlt={t.photo_alt} size={84} />
                    <div>
                      <h3 className="font-display text-xl font-medium leading-tight text-brand">{t.name}</h3>
                      <p className="mt-1.5 text-sm font-medium text-leaf-deep">{t.designation}</p>
                    </div>
                  </div>
                  {t.bio && <p className="mt-5 leading-relaxed text-muted">{t.bio}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-12 rounded-[var(--radius-card)] border border-dashed border-line p-10 text-center text-muted">
              Trustee profiles will be published here shortly.
            </div>
          )}
          <p className="mt-12">
            <Link href="/contact/" className="inline-flex items-center gap-2 font-semibold text-brand hover:text-sky">
              Contact the Trust <ArrowIcon />
            </Link>
          </p>
        </Container>
      </section>

      <DonateInvolveCTA upiId={settings.upi_id} />
    </>
  );
}
