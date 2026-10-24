import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";
import type { ActivitySummary } from "@/lib/data/public";

export function ActivityCard({ activity, priority = false }: { activity: ActivitySummary; priority?: boolean }) {
  const cover = publicImageUrl(activity.cover?.storage_path);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition-shadow duration-300 hover:shadow-xl hover:shadow-brand/5">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
        {cover ? (
          <Image
            src={cover}
            alt={activity.cover?.alt_text ?? ""}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div aria-hidden="true" className="grid h-full place-items-center">
            <svg viewBox="0 0 120 80" className="h-20 w-28 opacity-60">
              <path d="M20 70 C 20 30, 50 12, 60 40 C 70 12, 100 30, 100 70" fill="none" stroke="#3189d5" strokeWidth="6" strokeLinecap="round" />
              <circle cx="38" cy="18" r="7" fill="#3189d5" />
              <circle cx="82" cy="18" r="7" fill="#8bcb55" />
            </svg>
          </div>
        )}
        {activity.photoCount > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-brand-900/75 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
            {activity.photoCount} photos
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm text-muted">
          <time dateTime={activity.activity_date}>{formatDate(activity.activity_date)}</time>
          {activity.location && <> · {activity.location}</>}
        </p>
        <h3 className="font-display mt-2 text-xl font-medium text-brand">
          <Link href={`/gallery/${activity.slug}/`} className="after:absolute after:inset-0">
            {activity.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 leading-relaxed text-muted">{activity.summary}</p>
      </div>
    </article>
  );
}
