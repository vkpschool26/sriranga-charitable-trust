import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/ui";
import { TrusteeForm } from "@/components/admin/TrusteeForm";

export const metadata: Metadata = { title: "Add trustee" };

export default function NewTrusteePage() {
  return (
    <>
      <PageTitle title="Add trustee" back={{ href: "/admin/trustees/", label: "Trustees" }} />
      <TrusteeForm />
    </>
  );
}
