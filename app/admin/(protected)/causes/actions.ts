"use server";

import { redirect } from "next/navigation";
import { dbError, revalidatePublic, withAdmin, type ActionResult } from "@/lib/admin/action";
import { acceptPath, removeFiles } from "@/lib/admin/files";
import { moveRow, nextSortOrder } from "@/lib/admin/reorder";
import { slugify } from "@/lib/format";
import { causeSchema } from "@/lib/validation/admin";
import { fieldErrors, formToObject } from "@/lib/validation/common";

const PUBLIC_PATHS = ["/", "/about-us/", "/what-we-do/"];

export async function saveCause(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const result = await withAdmin(async ({ db }) => {
    const raw = formToObject(formData);
    if (!raw.slug?.trim()) raw.slug = slugify(raw.title ?? "");
    const parsed = causeSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, message: "Please correct the highlighted fields.", errors: fieldErrors(parsed.error) };
    }
    const values = { ...parsed.data, image_path: acceptPath(parsed.data.image_path, "causes") };

    if (id) {
      const { data: existing } = await db.from("causes").select("image_path").eq("id", id).maybeSingle();
      if (!existing) return { ok: false, message: "This cause no longer exists." };
      const failed = dbError((await db.from("causes").update(values).eq("id", id)).error);
      if (failed) return failed;
      if (existing.image_path && existing.image_path !== values.image_path) await removeFiles(db, [existing.image_path]);
    } else {
      const sort_order = values.sort_order || (await nextSortOrder(db, "causes"));
      const failed = dbError((await db.from("causes").insert({ ...values, sort_order })).error);
      if (failed) return failed;
    }
    revalidatePublic(...PUBLIC_PATHS);
    return { ok: true, message: "Cause saved." };
  });
  if (result.ok && !id) redirect("/admin/causes/");
  return result;
}

export async function deleteCause(id: string): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const { data: existing } = await db.from("causes").select("image_path").eq("id", id).maybeSingle();
    const failed = dbError((await db.from("causes").delete().eq("id", id)).error);
    if (failed) return failed;
    await removeFiles(db, [existing?.image_path]);
    revalidatePublic(...PUBLIC_PATHS);
    return { ok: true };
  });
}

export async function moveCause(id: string, direction: "up" | "down"): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const ok = await moveRow(db, "causes", id, direction);
    revalidatePublic(...PUBLIC_PATHS);
    return ok ? { ok: true } : { ok: false, message: "Could not reorder." };
  });
}

export async function setCausePublished(id: string, published: boolean): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const failed = dbError((await db.from("causes").update({ is_published: published }).eq("id", id)).error);
    if (failed) return failed;
    revalidatePublic(...PUBLIC_PATHS);
    return { ok: true };
  });
}
