import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { PageTitle } from "@/components/admin/ui";
import { TrusteeForm } from "@/components/admin/TrusteeForm";
import { createSessionClient } from "@/lib/supabase/server";
import { deleteTrustee } from "../actions";

export const metadata: Metadata = { title: "Edit trustee" };

export default async function EditTrusteePage({ params }: PageProps<"/admin/trustees/[id]">) {
  const { id } = await params;
  const db = await createSessionClient();
  const { data: trustee } = await db.from("trustees").select("*").eq("id", id).maybeSingle();
  if (!trustee) notFound();
  return (
    <>
      <PageTitle
        title={trustee.name}
        back={{ href: "/admin/trustees/", label: "Trustees" }}
        action={
          <ConfirmDeleteButton
            action={deleteTrustee.bind(null, trustee.id)}
            confirmText={`Delete ${trustee.name}? This cannot be undone.`}
            redirectTo="/admin/trustees/"
          />
        }
      />
      <TrusteeForm trustee={trustee} />
    </>
  );
}
