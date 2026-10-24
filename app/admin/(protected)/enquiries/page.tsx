import type { Metadata } from "next";
import Link from "next/link";
import { Badge, PageTitle } from "@/components/admin/ui";
import { createSessionClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";
import { INTEREST_LABEL, STATUS_LABEL, STATUS_TONE } from "./labels";

export const metadata: Metadata = { title: "Enquiries" };

const KINDS = [
  { value: "volunteer", label: "Volunteer & support" },
  { value: "contact", label: "Contact" },
] as const;
const STATUSES = ["all", "new", "contacted", "closed"] as const;

export default async function EnquiriesPage({ searchParams }: PageProps<"/admin/enquiries">) {
  const sp = await searchParams;
  const kind = sp.kind === "contact" ? "contact" : "volunteer";
  const status = STATUSES.includes(sp.status as (typeof STATUSES)[number]) ? (sp.status as (typeof STATUSES)[number]) : "all";

  const db = await createSessionClient();
  let query = db
    .from("enquiries")
    .select("id, kind, name, email, phone, interest, subject, message, status, created_at")
    .eq("kind", kind)
    .order("created_at", { ascending: false })
    .limit(200);
  if (status !== "all") query = query.eq("status", status);
  const { data } = await query;
  const rows = data ?? [];

  const href = (k: string, s: string) => `/admin/enquiries/?kind=${k}${s !== "all" ? `&status=${s}` : ""}`;

  return (
    <>
      <PageTitle title="Enquiries" description="Messages sent through the Get Involved and Contact forms. Only administrators can see these." />

      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Form">
        {KINDS.map((k) => (
          <Link
            key={k.value}
            role="tab"
            aria-selected={kind === k.value}
            href={href(k.value, "all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${kind === k.value ? "bg-brand text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            {k.label}
          </Link>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-1 text-sm">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={href(kind, s)}
            aria-current={status === s ? "true" : undefined}
            className={`rounded-full px-3 py-1 ${status === s ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"}`}
          >
            {s === "all" ? "All" : STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">No enquiries here.</p>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
          {rows.map((e) => (
            <li key={e.id}>
              <Link href={`/admin/enquiries/${e.id}/`} className="flex flex-col gap-1 p-4 hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className={`font-medium ${e.status === "new" ? "text-slate-900" : "text-slate-600"}`}>{e.name}</span>
                    <span className="text-sm text-slate-400">{e.email}</span>
                  </p>
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    <span className="font-medium text-slate-700">{e.kind === "volunteer" && e.interest ? INTEREST_LABEL[e.interest] : e.subject}</span>
                    {" — "}
                    {e.message}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge tone={STATUS_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge>
                  <span className="text-xs text-slate-400">{formatDate(e.created_at)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
