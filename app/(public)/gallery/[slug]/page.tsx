import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { PhotoGallery } from "@/components/public/PhotoGallery";
import { getActivity } from "@/lib/data/public";
import { formatDate, paragraphs } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";

export const revalidate = 300;

// Activities are created from the admin dashboard; render them on demand.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/gallery/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivity(slug);
  if (!activity) return { title: "Activity not found" };
  const cover = publicImageUrl(activity.photos[0]?.storage_path);
  return {
    title: activity.title,
    description: activity.summary,
    alternates: { canonical: `/gallery/${activity.slug}/` },
    openGraph: {
      type: "article",
      title: activity.title,
      description: activity.summary,
      images: cover ? [{ url: cover, alt: activity.photos[0].alt_text }] : undefined,
    },
  };
}

export default async function ActivityPage({ params }: PageProps<"/gallery/[slug]">) {
  const { slug } = await params;
  const activity = await getActivity(slug);
  if (!activity) notFound();

  const photos = activity.photos
    .map((p) => ({
      id: p.id,
      url: publicImageUrl(p.storage_path) ?? "",
      alt: p.alt_text,
      caption: p.caption,
      width: p.width,
      height: p.height,
    }))
    .filter((p) => p.url);

  return (
    <article>
      <header className="border-b border-line bg-white">
        <Container className="py-14 sm:py-20">
          <Link href="/gallery/" className="text-sm font-medium text-muted hover:text-brand">
            ← Gallery &amp; activities
          </Link>
          <div className="mt-8">
            <Eyebrow>
              <time dateTime={activity.activity_date}>{formatDate(activity.activity_date)}</time>
              {activity.location && <> · {activity.location}</>}
            </Eyebrow>
          </div>
          <h1 className="font-display mt-5 max-w-3xl text-4xl leading-tight font-medium text-brand sm:text-6xl">
            {activity.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{activity.summary}</p>
        </Container>
      </header>

      <Container className="py-14 sm:py-20">
        {activity.description && (
          <div className="prose-trust mb-14 max-w-3xl text-lg leading-relaxed text-ink/80">
            {paragraphs(activity.description).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}
        {photos.length > 0 ? (
          <PhotoGallery photos={photos} />
        ) : (
          <p className="text-muted">Photographs from this activity will be added soon.</p>
        )}
      </Container>
    </article>
  );
}
