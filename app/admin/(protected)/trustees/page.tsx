import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { RowButton } from "@/components/admin/RowActions";
import { Badge, PageTitle } from "@/components/admin/ui";
import { Avatar } from "@/components/ui/Avatar";
import { createSessionClient } from "@/lib/supabase/server";
import { deleteTrustee, moveTrustee, setTrusteePublished } from "./actions";

export const metadata: Metadata = { title: "Trustees" };

export default async function TrusteesPage() {
  const db = await createSessionClient();
  const { data: trustees } = await db.from("trustees").select("*").order("sort_order").order("created_at");
  const rows = trustees ?? [];

  return (
    <>
      <PageTitle
        title="Trustees"
        description="Shown in the Board of Trustees section on the About page and the home page. Only published trustees are visible."
        action={
          <Link href="/admin/trustees/new/" className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-900">
            Add trustee
          </Link>
        }
      />
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No trustees yet.</p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {rows.map((t, i) => (
            <li key={t.id} className="flex flex-wrap items-center gap-4 p-4">
              <Avatar name={t.name} photoPath={t.photo_path} size={48} />
              <div className="min-w-40 flex-1">
                <Link href={`/admin/trustees/${t.id}/`} className="font-medium text-slate-900 hover:text-brand">
                  {t.name}
                </Link>
                <p className="text-sm text-slate-500">{t.designation}</p>
              </div>
              {t.is_published ? <Badge tone="green">Published</Badge> : <Badge tone="slate">Hidden</Badge>}
              <div className="flex items-center gap-1">
                <RowButton action={moveTrustee.bind(null, t.id, "up")} label="↑" title="Move up" disabled={i === 0} />
                <RowButton action={moveTrustee.bind(null, t.id, "down")} label="↓" title="Move down" disabled={i === rows.length - 1} />
                <RowButton
                  action={setTrusteePublished.bind(null, t.id, !t.is_published)}
                  label={t.is_published ? "Hide" : "Publish"}
                  title={t.is_published ? "Hide from website" : "Publish on website"}
                />
                <Link href={`/admin/trustees/${t.id}/`} className="rounded-md px-2 py-1 text-xs font-medium text-brand hover:bg-brand-50">
                  Edit
                </Link>
                <ConfirmDeleteButton compact action={deleteTrustee.bind(null, t.id)} confirmText={`Delete ${t.name}? This cannot be undone.`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
