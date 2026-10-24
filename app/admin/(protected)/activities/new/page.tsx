import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/ui";
import { ActivityForm } from "@/components/admin/ActivityForm";

export const metadata: Metadata = { title: "Add activity" };

export default function NewActivityPage() {
  return (
    <>
      <PageTitle title="Add activity" description="Save the details first, then add photos." back={{ href: "/admin/activities/", label: "Gallery & Activities" }} />
      <ActivityForm />
    </>
  );
}
