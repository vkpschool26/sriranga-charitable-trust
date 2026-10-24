import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/ui";
import { DonationForm } from "@/components/admin/SettingsForms";
import { DEFAULT_SETTINGS } from "@/lib/content/defaults";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Donation Settings" };

export default async function DonationPage() {
  const db = await createSessionClient();
  const { data } = await db.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (
    <>
      <PageTitle title="Donation Settings" description="UPI details, QR code and the text on the Donate page." />
      <DonationForm settings={data ?? DEFAULT_SETTINGS} />
    </>
  );
}
