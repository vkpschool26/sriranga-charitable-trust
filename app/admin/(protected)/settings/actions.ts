"use server";

import { dbError, revalidateEverything, withAdmin, type ActionResult } from "@/lib/admin/action";
import { acceptPath, removeFiles } from "@/lib/admin/files";
import { donationSchema, settingsSchema } from "@/lib/validation/admin";
import { fieldErrors, formToObject } from "@/lib/validation/common";

const MISSING_ROW = { ok: false, message: "Settings row not found. Run supabase/manual-setup/04_seed.sql first." };

export async function saveSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const parsed = settingsSchema.safeParse(formToObject(formData));
    if (!parsed.success) return { ok: false, message: "Please correct the highlighted fields.", errors: fieldErrors(parsed.error) };
    const { data, error } = await db.from("site_settings").update(parsed.data).eq("id", 1).select("id");
    const failed = dbError(error);
    if (failed) return failed;
    if (!data?.length) return MISSING_ROW;
    revalidateEverything();
    return { ok: true, message: "Settings saved." };
  });
}

export async function saveDonation(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const parsed = donationSchema.safeParse(formToObject(formData));
    if (!parsed.success) return { ok: false, message: "Please correct the highlighted fields.", errors: fieldErrors(parsed.error) };
    const values = { ...parsed.data, upi_qr_path: acceptPath(parsed.data.upi_qr_path, "site") };
    const { data: existing } = await db.from("site_settings").select("upi_qr_path").eq("id", 1).maybeSingle();
    if (!existing) return MISSING_ROW;
    const failed = dbError((await db.from("site_settings").update(values).eq("id", 1)).error);
    if (failed) return failed;
    if (existing.upi_qr_path && existing.upi_qr_path !== values.upi_qr_path) await removeFiles(db, [existing.upi_qr_path]);
    revalidateEverything();
    return { ok: true, message: "Donation settings saved." };
  });
}
