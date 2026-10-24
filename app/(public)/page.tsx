import type { Metadata } from "next";
import Link from "next/link";
import { HeroArcArt } from "@/components/brand/ArcArt";
import { ArrowIcon, ButtonLink } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { CauseIcon } from "@/components/ui/CauseIcon";
import { Container } from "@/components/ui/Container";
import { Eyebrow, SectionHeading } from "@/components/ui/SectionHeading";
import { ActivityCard } from "@/components/public/ActivityCard";
import { CauseStatus } from "@/components/public/CauseStatus";
import { DonateInvolveCTA } from "@/components/public/DonateInvolveCTA";
import { HOW_WE_WORK } from "@/lib/content/defaults";
import { getActivities, getBlocks, getCauses, getSettings, getTrustees } from "@/lib/data/public";
import { formatDate, paragraphs } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [settings, blocks, causes, trustees, activities] = await Promise.all([
    getSettings(),
    getBlocks(),
    getCauses(),
    getTrustees(),
    getActivities(3),
  ]);
  const hero = blocks["home.hero"];
  const intro = blocks["home.intro"];
  const vision = blocks["about.vision"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: settings.trust_name,
    alternateName: settings.short_name,
    slogan: settings.tagline,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/src-mark-512.png`,
    telephone: settings.phone ? `+91${settings.phone.replace(/\D/g, "").slice(-10)}` : undefined,
    foundingDate: settings.founded_on ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sri Maradiranganatha Nilaya, Manchaladore",
      addressLocality: "Gubbi Taluk, Tumkur District",
      addressRegion: "Karnataka",
      postalCode: "572117",
      addressCountry: "IN",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-leaf/10 blur-3xl" />
        <Container className="relative grid items-center gap-12 pb-20 pt-10 sm:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-28">
          <div className="lg:col-span-7">
            <Eyebrow>{settings.trust_name} · Gubbi, Tumkur</Eyebrow>
            <h1 className="font-display mt-6 text-[3.2rem] leading-[0.98] font-medium text-brand sm:text-7xl lg:text-[5.4rem]">
              {hero.title}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{hero.body}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/donate/" size="lg">
                Donate <ArrowIcon />
              </ButtonLink>
              <ButtonLink href="/get-involved/" variant="outline" size="lg">
                Get involved
              </ButtonLink>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
            <HeroArcArt className="h-auto w-full" />
          </div>
        </Container>
        {settings.registration_no && (
          <div className="border-y border-line bg-white/70">
            <Container className="flex flex-wrap items-center gap-x-8 gap-y-2 py-4 text-sm text-muted">
              <span className="font-semibold text-brand">Registered charitable trust</span>
              <span>Reg. No. {settings.registration_no}</span>
              {settings.registration_date && <span>Registered {formatDate(settings.registration_date)}</span>}
              {settings.registrar && <span>{settings.registrar}</span>}
            </Container>
          </div>
        )}
      </section>

      {/* Who we are */}
      <section aria-labelledby="intro-heading" className="bg-white py-20 sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div data-reveal className="lg:col-span-6">
            <Eyebrow>Who we are</Eyebrow>
            <h2 id="intro-heading" className="font-display mt-5 text-[2.2rem] leading-[1.1] font-medium text-brand sm:text-5xl">
              {intro.title}
            </h2>
          </div>
          <div data-reveal className="lg:col-span-6 lg:pt-12">
            <div className="prose-trust text-lg leading-relaxed text-ink/80">
              {paragraphs(intro.body).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            {vision.body && (
              <blockquote className="mt-10 border-l-4 border-leaf pl-6">
                <p className="font-display text-2xl leading-snug text-brand italic">“{vision.body}”</p>
              </blockquote>
            )}
            <Link href="/about-us/" className="mt-10 inline-flex items-center gap-2 font-semibold text-brand hover:text-sky">
              Read our story <ArrowIcon />
            </Link>
          </div>
        </Container>
      </section>

      {/* Causes */}
      {causes.length > 0 && (
        <section aria-labelledby="causes-heading" className="py-20 sm:py-28">
          <Container>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div id="causes-heading">
                <SectionHeading
                  eyebrow="Our causes"
                  title="Where we have committed to help"
                  intro="These are the areas our founding deed commits us to. Each is marked as a planned focus until work on the ground begins."
                />
              </div>
              <ButtonLink href="/what-we-do/" variant="ghost" className="self-start md:self-auto">
                All causes <ArrowIcon />
              </ButtonLink>
            </div>
            <ol className="mt-14 grid border-t border-line md:grid-cols-2 md:gap-x-12">
              {causes.map((cause, i) => (
                <li key={cause.slug} data-reveal className="border-b border-line">
                  <Link
                    href={`/what-we-do/#${cause.slug}`}
                    className="group flex gap-5 py-7 transition-colors sm:gap-6"
                  >
                    <span className="font-display w-8 shrink-0 pt-1 text-sm text-muted tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                      <CauseIcon name={cause.icon} />
                    </span>
                    <span className="flex-1">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="font-display text-xl font-medium text-brand">{cause.title}</span>
                        <CauseStatus status={cause.status} />
                      </span>
                      <span className="mt-2 block leading-relaxed text-muted">{cause.summary}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {/* How we work */}
      <section aria-labelledby="work-heading" className="relative overflow-hidden bg-brand py-20 text-white sm:py-28">
        <svg aria-hidden="true" viewBox="0 0 400 400" className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 opacity-10">
          <path d="M40 360 C 40 180, 180 40, 360 40" fill="none" stroke="#8bcb55" strokeWidth="36" strokeLinecap="round" />
        </svg>
        <Container className="relative grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5" id="work-heading">
            <SectionHeading
              tone="dark"
              eyebrow="How we work"
              title="Accountability, written into our founding deed."
              intro="These commitments come directly from the Trust's registered deed."
            />
          </div>
          <dl className="grid gap-px overflow-hidden rounded-[var(--radius-card)] bg-white/10 sm:grid-cols-2 lg:col-span-7">
            {HOW_WE_WORK.map((item, i) => (
              <div key={item.title} data-reveal className="bg-brand p-7 sm:p-8">
                <dt className="flex items-center gap-3 font-display text-xl font-medium">
                  <span className="text-sm text-leaf tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {item.title}
                </dt>
                <dd className="mt-3 leading-relaxed text-white/70">{item.body}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Trustees (only when published) */}
      {trustees.length > 0 && (
        <section aria-labelledby="trustees-heading" className="bg-white py-20 sm:py-28">
          <Container>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div id="trustees-heading">
                <SectionHeading eyebrow="Board of Trustees" title="The people behind the Trust" />
              </div>
              <ButtonLink href="/about-us/#trustees" variant="ghost" className="self-start md:self-auto">
                Meet the board <ArrowIcon />
              </ButtonLink>
            </div>
            <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
              {trustees.map((t) => (
                <li key={t.id} data-reveal className="text-center">
                  <Avatar name={t.name} photoPath={t.photo_path} photoAlt={t.photo_alt} size={112} className="mx-auto" />
                  <p className="font-display mt-4 text-lg leading-tight text-brand">{t.name}</p>
                  <p className="mt-1 text-sm text-muted">{t.designation}</p>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Latest activities (only when published) */}
      {activities.length > 0 && (
        <section aria-labelledby="activities-heading" className="py-20 sm:py-28">
          <Container>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div id="activities-heading">
                <SectionHeading eyebrow="Gallery & activities" title="Latest from the Trust" />
              </div>
              <ButtonLink href="/gallery/" variant="ghost" className="self-start md:self-auto">
                View all <ArrowIcon />
              </ButtonLink>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((a) => (
                <ActivityCard key={a.id} activity={a} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <DonateInvolveCTA upiId={settings.upi_id} />
    </>
  );
}
