import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageTitle } from "@/components/admin/ui";
import { CauseForm } from "@/components/admin/CauseForm";
import { createSessionClient } from "@/lib/supabase/server";
import { deleteCause } from "../actions";

export const metadata: Metadata = { title: "Edit cause" };

export default async function EditCausePage({ params }: PageProps<"/admin/causes/[id]">) {
  const { id } = await params;
  const db = await createSessionClient();
  const { data: cause } = await db.from("causes").select("*").eq("id", id).maybeSingle();
  if (!cause) notFound();
  return (
    <>
      <PageTitle
        title={cause.title}
        back={{ href: "/admin/causes/", label: "Our Causes" }}
        action={<ConfirmDeleteButton action={deleteCause.bind(null, cause.id)} confirmText={`Delete “${cause.title}”? This cannot be undone.`} redirectTo="/admin/causes/" />}
      />
      <CauseForm cause={cause} />
    </>
  );
}
