"use server";

import { redirect } from "next/navigation";
import { dbError, revalidatePublic, withAdmin, type ActionResult } from "@/lib/admin/action";
import { acceptPath, removeFiles } from "@/lib/admin/files";
import { moveRow, nextSortOrder } from "@/lib/admin/reorder";
import { trusteeSchema } from "@/lib/validation/admin";
import { fieldErrors, formToObject } from "@/lib/validation/common";

const PUBLIC_PATHS = ["/", "/about-us/"];

export async function saveTrustee(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const result = await withAdmin(async ({ db }) => {
    const parsed = trusteeSchema.safeParse(formToObject(formData));
    if (!parsed.success) {
      return { ok: false, message: "Please correct the highlighted fields.", errors: fieldErrors(parsed.error) };
    }
    const values = { ...parsed.data, photo_path: acceptPath(parsed.data.photo_path, "trustees") };

    if (id) {
      const { data: existing } = await db.from("trustees").select("photo_path").eq("id", id).maybeSingle();
      if (!existing) return { ok: false, message: "This trustee no longer exists." };
      const failed = dbError((await db.from("trustees").update(values).eq("id", id)).error);
      if (failed) return failed;
      if (existing.photo_path && existing.photo_path !== values.photo_path) {
        await removeFiles(db, [existing.photo_path]);
      }
    } else {
      const sort_order = values.sort_order || (await nextSortOrder(db, "trustees"));
      const failed = dbError((await db.from("trustees").insert({ ...values, sort_order })).error);
      if (failed) return failed;
    }
    revalidatePublic(...PUBLIC_PATHS);
    return { ok: true, message: "Trustee saved." };
  });
  if (result.ok && !id) redirect("/admin/trustees/");
  return result;
}

export async function deleteTrustee(id: string): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const { data: existing } = await db.from("trustees").select("photo_path").eq("id", id).maybeSingle();
    const failed = dbError((await db.from("trustees").delete().eq("id", id)).error);
    if (failed) return failed;
    await removeFiles(db, [existing?.photo_path]);
    revalidatePublic(...PUBLIC_PATHS);
    return { ok: true };
  });
}

export async function moveTrustee(id: string, direction: "up" | "down"): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const ok = await moveRow(db, "trustees", id, direction);
    revalidatePublic(...PUBLIC_PATHS);
    return ok ? { ok: true } : { ok: false, message: "Could not reorder." };
  });
}

export async function setTrusteePublished(id: string, published: boolean): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const failed = dbError((await db.from("trustees").update({ is_published: published }).eq("id", id)).error);
    if (failed) return failed;
    revalidatePublic(...PUBLIC_PATHS);
    return { ok: true };
  });
}
