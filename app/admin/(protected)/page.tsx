import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Card, PageTitle } from "@/components/admin/ui";
import { createSessionClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { INTEREST_LABEL } from "./enquiries/labels";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const db = await createSessionClient();
  const count = (q: PromiseLike<{ count: number | null }>) => q.then((r) => r.count ?? 0);

  const [trustees, trusteesLive, causes, activities, activitiesLive, photos, newVolunteer, newContact, latest] =
    await Promise.all([
      count(db.from("trustees").select("id", { count: "exact", head: true })),
      count(db.from("trustees").select("id", { count: "exact", head: true }).eq("is_published", true)),
      count(db.from("causes").select("id", { count: "exact", head: true }).eq("is_published", true)),
      count(db.from("activities").select("id", { count: "exact", head: true })),
      count(db.from("activities").select("id", { count: "exact", head: true }).eq("is_published", true)),
      count(db.from("activity_photos").select("id", { count: "exact", head: true })),
      count(db.from("enquiries").select("id", { count: "exact", head: true }).eq("kind", "volunteer").eq("status", "new")),
      count(db.from("enquiries").select("id", { count: "exact", head: true }).eq("kind", "contact").eq("status", "new")),
      db
        .from("enquiries")
        .select("id, kind, name, subject, interest, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
        .then((r) => r.data ?? []),
    ]);

  const stats = [
    { label: "New volunteer enquiries", value: newVolunteer, href: "/admin/enquiries/?kind=volunteer", highlight: newVolunteer > 0 },
    { label: "New contact enquiries", value: newContact, href: "/admin/enquiries/?kind=contact", highlight: newContact > 0 },
    { label: "Trustees published", value: `${trusteesLive} / ${trustees}`, href: "/admin/trustees/" },
    { label: "Causes published", value: causes, href: "/admin/causes/" },
    { label: "Activities published", value: `${activitiesLive} / ${activities}`, href: "/admin/activities/" },
    { label: "Photos", value: photos, href: "/admin/activities/" },
  ];

  return (
    <>
      <PageTitle title="Dashboard" description="An overview of the website's content and new enquiries." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`rounded-xl border p-5 transition-colors hover:border-sky ${
              s.highlight ? "border-leaf bg-leaf-50" : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="font-display mt-2 text-3xl text-brand">{s.value}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Latest enquiries</h2>
          <Link href="/admin/enquiries/" className="text-sm font-medium text-brand hover:underline">
            View all
          </Link>
        </div>
        {latest.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No enquiries yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {latest.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/enquiries/${e.id}/`} className="flex flex-wrap items-center gap-3 py-3 hover:bg-slate-50">
                  <Badge tone={e.kind === "volunteer" ? "green" : "blue"}>{e.kind === "volunteer" ? "Volunteer" : "Contact"}</Badge>
                  <span className="font-medium text-slate-900">{e.name}</span>
                  <span className="flex-1 truncate text-sm text-slate-500">{e.subject ?? (e.interest ? INTEREST_LABEL[e.interest] : "")}</span>
                  {e.status === "new" && <Badge tone="amber">New</Badge>}
                  <span className="text-xs text-slate-400">{formatDate(e.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
