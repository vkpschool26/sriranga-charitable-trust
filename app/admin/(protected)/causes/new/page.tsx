import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/ui";
import { CauseForm } from "@/components/admin/CauseForm";

export const metadata: Metadata = { title: "Add cause" };

export default function NewCausePage() {
  return (
    <>
      <PageTitle title="Add cause" back={{ href: "/admin/causes/", label: "Our Causes" }} />
      <CauseForm />
    </>
  );
}
