import type { Metadata } from "next";
import { PageTitle } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForms";
import { DEFAULT_SETTINGS } from "@/lib/content/defaults";
import { createSessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Website Settings" };

export default async function SettingsPage() {
  const db = await createSessionClient();
  const { data } = await db.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (
    <>
      <PageTitle title="Website Settings" description="Contact details, registration details and search engine text used across the whole website." />
      {!data && (
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          The settings row has not been created yet. Run <code>supabase/manual-setup/04_seed.sql</code> first.
        </p>
      )}
      <SettingsForm settings={data ?? DEFAULT_SETTINGS} />
    </>
  );
}
