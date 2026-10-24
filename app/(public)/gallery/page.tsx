import type { Metadata } from "next";
import { ArrowIcon, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/public/PageHeader";
import { ActivityCard } from "@/components/public/ActivityCard";
import { getActivities } from "@/lib/data/public";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Gallery & Activities",
  description: "Photographs and updates from the activities of Sri Ranga Charitable Trust.",
  alternates: { canonical: "/gallery/" },
};

export default async function GalleryPage() {
  const activities = await getActivities();

  return (
    <>
      <PageHeader
        eyebrow="Gallery & activities"
        title="Our work, as it happens."
        intro="Photographs and updates from the Trust's activities and events."
      />
      <section className="py-16 sm:py-24">
        <Container>
          {activities.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activities.map((a, i) => (
                <ActivityCard key={a.id} activity={a} priority={i < 3} />
              ))}
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-[1.75rem] border border-line bg-white px-6 py-16 text-center sm:px-16 sm:py-24">
              <svg aria-hidden="true" viewBox="0 0 160 110" className="mx-auto h-24 w-36">
                <path d="M26 96 C 26 44, 66 20, 80 56 C 94 20, 134 44, 134 96" fill="none" stroke="#3189d5" strokeWidth="8" strokeLinecap="round" />
                <circle cx="50" cy="24" r="10" fill="#3189d5" />
                <circle cx="110" cy="24" r="10" fill="#8bcb55" />
              </svg>
              <h2 className="font-display mt-8 text-3xl font-medium text-brand">Our first activities will be shared here soon.</h2>
              <p className="mx-auto mt-4 max-w-lg leading-relaxed text-muted">
                Sri Ranga Charitable Trust was registered in December 2025. As our work begins, photographs and updates
                from every activity will appear on this page.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href="/get-involved/">
                  Get involved <ArrowIcon />
                </ButtonLink>
                <ButtonLink href="/what-we-do/" variant="outline">
                  See our causes
                </ButtonLink>
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
