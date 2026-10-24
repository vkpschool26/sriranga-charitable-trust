import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { RowButton } from "@/components/admin/RowActions";
import { Badge, PageTitle } from "@/components/admin/ui";
import { CauseIcon } from "@/components/ui/CauseIcon";
import { createSessionClient } from "@/lib/supabase/server";
import { deleteCause, moveCause, setCausePublished } from "./actions";

export const metadata: Metadata = { title: "Our Causes" };

export default async function CausesAdminPage() {
  const db = await createSessionClient();
  const { data } = await db.from("causes").select("*").order("sort_order").order("created_at");
  const rows = data ?? [];
  return (
    <>
      <PageTitle
        title="Our Causes"
        description="The Trust's areas of work, from its registered deed. Mark a cause Active only once work has actually begun."
        action={
          <Link href="/admin/causes/new/" className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-900">
            Add cause
          </Link>
        }
      />
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No causes yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {rows.map((c, i) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 p-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand">
                <CauseIcon name={c.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-40 flex-1">
                <Link href={`/admin/causes/${c.id}/`} className="font-medium text-slate-900 hover:text-brand">
                  {c.title}
                </Link>
                <p className="line-clamp-1 text-sm text-slate-500">{c.summary}</p>
              </div>
              <Badge tone={c.status === "active" ? "green" : "blue"}>{c.status === "active" ? "Active" : "Planned"}</Badge>
              {!c.is_published && <Badge tone="slate">Hidden</Badge>}
              <div className="flex items-center gap-1">
                <RowButton action={moveCause.bind(null, c.id, "up")} label="↑" title="Move up" disabled={i === 0} />
                <RowButton action={moveCause.bind(null, c.id, "down")} label="↓" title="Move down" disabled={i === rows.length - 1} />
                <RowButton action={setCausePublished.bind(null, c.id, !c.is_published)} label={c.is_published ? "Hide" : "Publish"} title={c.is_published ? "Hide from website" : "Publish on website"} />
                <Link href={`/admin/causes/${c.id}/`} className="rounded-md px-2 py-1 text-xs font-medium text-brand hover:bg-brand-50">
                  Edit
                </Link>
                <ConfirmDeleteButton compact action={deleteCause.bind(null, c.id)} confirmText={`Delete “${c.title}”? This cannot be undone.`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
