"use server";

import { dbError, revalidatePublic, withAdmin, type ActionResult } from "@/lib/admin/action";
import { blockSchema } from "@/lib/validation/admin";
import { fieldErrors, formToObject } from "@/lib/validation/common";

export async function saveBlock(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const parsed = blockSchema.safeParse(formToObject(formData));
    if (!parsed.success) return { ok: false, message: "Please check the text.", errors: fieldErrors(parsed.error) };
    const failed = dbError((await db.from("content_blocks").upsert(parsed.data, { onConflict: "key" })).error);
    if (failed) return failed;
    revalidatePublic("/", "/about-us/", "/get-involved/");
    return { ok: true, message: "Saved. The website will show the new text right away." };
  });
}
