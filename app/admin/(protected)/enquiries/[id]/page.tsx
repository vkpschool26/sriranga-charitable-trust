import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { RowButton } from "@/components/admin/RowActions";
import { Badge, Card, PageTitle } from "@/components/admin/ui";
import { createSessionClient } from "@/lib/supabase/server";
import { displayPhone, telHref } from "@/lib/format";
import { deleteEnquiry, setEnquiryStatus } from "../actions";
import { INTEREST_LABEL, STATUS_LABEL, STATUS_TONE } from "../labels";

export const metadata: Metadata = { title: "Enquiry" };

export default async function EnquiryPage({ params }: PageProps<"/admin/enquiries/[id]">) {
  const { id } = await params;
  const db = await createSessionClient();
  const { data: e } = await db.from("enquiries").select("*").eq("id", id).maybeSingle();
  if (!e) notFound();

  const received = new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata" }).format(new Date(e.created_at));
  const listHref = `/admin/enquiries/?kind=${e.kind}`;
  const subject = e.kind === "volunteer" && e.interest ? `Re: ${INTEREST_LABEL[e.interest]} — Sri Ranga Charitable Trust` : `Re: ${e.subject ?? "Your enquiry"}`;

  return (
    <>
      <PageTitle
        title={e.name}
        description={`${e.kind === "volunteer" ? "Get Involved form" : "Contact form"} · received ${received}`}
        back={{ href: listHref, label: "Enquiries" }}
        action={<ConfirmDeleteButton action={deleteEnquiry.bind(null, e.id)} confirmText="Delete this enquiry permanently?" redirectTo={listHref} />}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card>
          <p className="text-sm font-medium text-slate-500">
            {e.kind === "volunteer" && e.interest ? `Interested in: ${INTEREST_LABEL[e.interest]}` : e.subject}
          </p>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-slate-800">{e.message}</p>
        </Card>
        <div className="space-y-6">
          <Card>
            <h2 className="text-sm font-semibold text-slate-900">Contact details</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd>
                  <a href={`mailto:${e.email}?subject=${encodeURIComponent(subject)}`} className="font-medium text-brand hover:underline">
                    {e.email}
                  </a>
                </dd>
              </div>
              {e.phone && (
                <div>
                  <dt className="text-slate-500">Phone</dt>
                  <dd>
                    <a href={telHref(e.phone)} className="font-medium text-brand hover:underline">
                      {displayPhone(e.phone)}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </Card>
          <Card>
            <h2 className="text-sm font-semibold text-slate-900">Status</h2>
            <div className="mt-3">
              <Badge tone={STATUS_TONE[e.status]}>{STATUS_LABEL[e.status]}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-1 border-t border-slate-100 pt-3">
              {(["new", "contacted", "closed"] as const)
                .filter((s) => s !== e.status)
                .map((s) => (
                  <RowButton key={s} action={setEnquiryStatus.bind(null, e.id, s)} label={`Mark ${STATUS_LABEL[s].toLowerCase()}`} title={`Mark as ${STATUS_LABEL[s]}`} />
                ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
