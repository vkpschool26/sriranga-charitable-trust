import type { Metadata } from "next";
import Image from "next/image";
import { CauseIcon } from "@/components/ui/CauseIcon";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/public/PageHeader";
import { CauseStatus } from "@/components/public/CauseStatus";
import { DonateInvolveCTA } from "@/components/public/DonateInvolveCTA";
import { getCauses, getSettings } from "@/lib/data/public";
import { paragraphs } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Our Causes",
  description:
    "Education, healthcare, women and children, food and basic needs, senior citizens, community welfare and housing — the causes Sri Ranga Charitable Trust is committed to.",
  alternates: { canonical: "/what-we-do/" },
};

export default async function CausesPage() {
  const [settings, causes] = await Promise.all([getSettings(), getCauses()]);

  return (
    <>
      <PageHeader
        eyebrow="Our causes"
        title="The work we have committed to."
        intro="Our registered trust deed sets out the areas Sri Ranga Charitable Trust exists to serve. We are at the beginning of this work: each cause below shows whether it is a planned focus or already active."
      >
        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-muted">
          <CauseStatus status="planned" /> <span>Committed to in our deed; work not yet started</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <CauseStatus status="active" /> <span>Work under way</span>
        </div>
      </PageHeader>

      {causes.length > 0 && (
        <nav aria-label="Causes on this page" className="sticky top-20 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
          <Container className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
            {causes.map((c) => (
              <a
                key={c.slug}
                href={`#${c.slug}`}
                className="shrink-0 rounded-full border border-line bg-white px-4 py-1.5 text-sm font-medium text-ink/75 transition-colors hover:border-brand hover:text-brand"
              >
                {c.title}
              </a>
            ))}
          </Container>
        </nav>
      )}

      <div className="py-10 sm:py-16">
        {causes.map((cause, i) => {
          const image = publicImageUrl(cause.image_path);
          return (
            <section
              key={cause.slug}
              id={cause.slug}
              aria-labelledby={`${cause.slug}-title`}
              className="scroll-mt-40"
            >
              <Container className="grid gap-8 border-b border-line py-14 last:border-0 sm:py-20 lg:grid-cols-12 lg:gap-12">
                <div data-reveal className="lg:col-span-5">
                  <div className="flex items-center gap-4">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white">
                      <CauseIcon name={cause.icon} className="h-7 w-7" />
                    </span>
                    <span className="font-display text-sm text-muted tabular-nums">
                      {String(i + 1).padStart(2, "0")} / {String(causes.length).padStart(2, "0")}
                    </span>
                  </div>
                  <h2 id={`${cause.slug}-title`} className="font-display mt-6 text-3xl leading-tight font-medium text-brand sm:text-4xl">
                    {cause.title}
                  </h2>
                  <div className="mt-4">
                    <CauseStatus status={cause.status} />
                  </div>
                  <p className="mt-6 text-lg leading-relaxed text-ink/80">{cause.summary}</p>
                </div>
                <div data-reveal className="lg:col-span-7">
                  {image && (
                    <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[var(--radius-card)] bg-brand-50">
                      <Image
                        src={image}
                        alt={cause.image_alt ?? ""}
                        fill
                        sizes="(min-width: 1024px) 55vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="prose-trust rounded-[var(--radius-card)] border border-line bg-white p-7 leading-relaxed text-muted sm:p-9">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-leaf-deep">
                      {cause.status === "active" ? "What we do" : "What we aim to do"}
                    </p>
                    {paragraphs(cause.description).map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </div>
              </Container>
            </section>
          );
        })}
      </div>

      <DonateInvolveCTA upiId={settings.upi_id} />
    </>
  );
}
