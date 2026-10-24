"use server";

import { revalidatePath } from "next/cache";
import { dbError, withAdmin, type ActionResult } from "@/lib/admin/action";
import { enquiryStatusSchema } from "@/lib/validation/admin";

export async function setEnquiryStatus(id: string, status: string): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const parsed = enquiryStatusSchema.safeParse(status);
    if (!parsed.success) return { ok: false, message: "Invalid status." };
    const failed = dbError((await db.from("enquiries").update({ status: parsed.data }).eq("id", id)).error);
    if (failed) return failed;
    revalidatePath("/admin", "layout");
    return { ok: true };
  });
}

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const failed = dbError((await db.from("enquiries").delete().eq("id", id)).error);
    if (failed) return failed;
    revalidatePath("/admin", "layout");
    return { ok: true };
  });
}
