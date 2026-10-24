import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { RowButton } from "@/components/admin/RowActions";
import { Badge, PageTitle } from "@/components/admin/ui";
import { createSessionClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";
import { deleteActivity, setActivityPublished } from "./actions";

export const metadata: Metadata = { title: "Gallery & Activities" };

export default async function ActivitiesAdminPage() {
  const db = await createSessionClient();
  const [{ data: activities }, { data: photos }] = await Promise.all([
    db.from("activities").select("*").order("activity_date", { ascending: false }),
    db.from("activity_photos").select("activity_id, storage_path, sort_order").order("sort_order"),
  ]);
  const rows = activities ?? [];
  return (
    <>
      <PageTitle
        title="Gallery & Activities"
        description="Each activity has a date, a description and its own set of photos. Published activities appear on the Gallery & Activities page."
        action={
          <Link href="/admin/activities/new/" className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-900">
            Add activity
          </Link>
        }
      />
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
          No activities yet. Add the first one when the Trust holds an event or programme.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {rows.map((a) => {
            const own = (photos ?? []).filter((p) => p.activity_id === a.id);
            const cover = publicImageUrl(own[0]?.storage_path);
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-4 p-4">
                <span className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
                  {cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cover} alt="" className="h-full w-full object-cover" loading="lazy" />
                  )}
                </span>
                <div className="min-w-40 flex-1">
                  <Link href={`/admin/activities/${a.id}/`} className="font-medium text-slate-900 hover:text-brand">
                    {a.title}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {formatDate(a.activity_date)} · {own.length} photo{own.length === 1 ? "" : "s"}
                  </p>
                </div>
                {a.is_published ? <Badge tone="green">Published</Badge> : <Badge tone="slate">Draft</Badge>}
                <div className="flex items-center gap-1">
                  <RowButton action={setActivityPublished.bind(null, a.id, !a.is_published)} label={a.is_published ? "Unpublish" : "Publish"} title={a.is_published ? "Hide from website" : "Publish on website"} />
                  <Link href={`/admin/activities/${a.id}/`} className="rounded-md px-2 py-1 text-xs font-medium text-brand hover:bg-brand-50">
                    Edit
                  </Link>
                  <ConfirmDeleteButton compact action={deleteActivity.bind(null, a.id)} confirmText={`Delete “${a.title}” and all its photos? This cannot be undone.`} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
