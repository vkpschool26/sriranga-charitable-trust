"use server";

import { redirect } from "next/navigation";
import { dbError, revalidatePublic, withAdmin, type ActionResult } from "@/lib/admin/action";
import { acceptPath, removeFiles } from "@/lib/admin/files";
import { slugify } from "@/lib/format";
import { activitySchema, photoUpdateSchema } from "@/lib/validation/admin";
import { fieldErrors, formToObject } from "@/lib/validation/common";
import type { createSessionClient } from "@/lib/supabase/server";

type Db = Awaited<ReturnType<typeof createSessionClient>>;

function revalidateActivity(...slugs: (string | null | undefined)[]) {
  revalidatePublic("/", "/gallery/", "/sitemap.xml", ...slugs.filter(Boolean).map((s) => `/gallery/${s}/`));
}

export async function saveActivity(id: string | null, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const result = await withAdmin(async ({ db }) => {
    const raw = formToObject(formData);
    if (!raw.slug?.trim()) raw.slug = slugify(`${raw.title ?? ""} ${raw.activity_date?.slice(0, 4) ?? ""}`);
    const parsed = activitySchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, message: "Please correct the highlighted fields.", errors: fieldErrors(parsed.error) };
    }
    if (id) {
      const { data: existing } = await db.from("activities").select("slug").eq("id", id).maybeSingle();
      if (!existing) return { ok: false, message: "This activity no longer exists." };
      const failed = dbError((await db.from("activities").update(parsed.data).eq("id", id)).error);
      if (failed) return failed;
      revalidateActivity(existing.slug, parsed.data.slug);
      return { ok: true, message: "Activity saved." };
    }
    const { data, error } = await db.from("activities").insert(parsed.data).select("id").single();
    const failed = dbError(error);
    if (failed) return failed;
    revalidateActivity(parsed.data.slug);
    return { ok: true, id: data!.id };
  });
  // New activity: continue on the edit page to add photos.
  if (result.ok && !id && result.id) redirect(`/admin/activities/${result.id}/?created=1`);
  return result;
}

export async function deleteActivity(id: string): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const { data: activity } = await db.from("activities").select("slug").eq("id", id).maybeSingle();
    const { data: photos } = await db.from("activity_photos").select("storage_path").eq("activity_id", id);
    const failed = dbError((await db.from("activities").delete().eq("id", id)).error);
    if (failed) return failed;
    await removeFiles(db, (photos ?? []).map((p) => p.storage_path));
    revalidateActivity(activity?.slug);
    return { ok: true };
  });
}

export async function setActivityPublished(id: string, published: boolean): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const { data } = await db.from("activities").update({ is_published: published }).eq("id", id).select("slug").maybeSingle();
    revalidateActivity(data?.slug);
    return data ? { ok: true } : { ok: false, message: "Could not update." };
  });
}

async function activitySlug(db: Db, activityId: string) {
  const { data } = await db.from("activities").select("slug").eq("id", activityId).maybeSingle();
  return data?.slug;
}

export async function addActivityPhoto(input: {
  activityId: string;
  path: string;
  width: number;
  height: number;
  alt: string;
}): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const path = acceptPath(input.path, `activities/${input.activityId}`);
    if (!path) return { ok: false, message: "Invalid upload." };
    const alt = input.alt.trim().slice(0, 300) || "Photo from a Trust activity";
    const { data: last } = await db
      .from("activity_photos")
      .select("sort_order")
      .eq("activity_id", input.activityId)
      .order("sort_order", { ascending: false })
      .limit(1);
    const failed = dbError(
      (
        await db.from("activity_photos").insert({
          activity_id: input.activityId,
          storage_path: path,
          alt_text: alt.length >= 2 ? alt : "Photo",
          caption: null,
          width: Math.round(input.width) || null,
          height: Math.round(input.height) || null,
          sort_order: (last?.[0]?.sort_order ?? 0) + 10,
        })
      ).error
    );
    if (failed) {
      await removeFiles(db, [path]);
      return failed;
    }
    revalidateActivity(await activitySlug(db, input.activityId));
    return { ok: true };
  });
}

export async function updateActivityPhoto(photoId: string, _prev: ActionResult, formData: FormData): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const parsed = photoUpdateSchema.safeParse(formToObject(formData));
    if (!parsed.success) return { ok: false, message: "Please correct the photo details.", errors: fieldErrors(parsed.error) };
    const { data, error } = await db.from("activity_photos").update(parsed.data).eq("id", photoId).select("activity_id").maybeSingle();
    const failed = dbError(error);
    if (failed) return failed;
    if (data) revalidateActivity(await activitySlug(db, data.activity_id));
    return { ok: true, message: "Saved." };
  });
}

export async function moveActivityPhoto(photoId: string, direction: "up" | "down"): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const { data: photo } = await db.from("activity_photos").select("activity_id").eq("id", photoId).maybeSingle();
    if (!photo) return { ok: false, message: "Photo not found." };
    const { data: all } = await db
      .from("activity_photos")
      .select("id, sort_order")
      .eq("activity_id", photo.activity_id)
      .order("sort_order")
      .order("created_at");
    const ids = (all ?? []).map((p) => p.id);
    const i = ids.indexOf(photoId);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= ids.length) return { ok: true };
    [ids[i], ids[j]] = [ids[j], ids[i]];
    for (const [index, rowId] of ids.entries()) {
      const target = (index + 1) * 10;
      if (all?.find((p) => p.id === rowId)?.sort_order !== target) {
        const failed = dbError((await db.from("activity_photos").update({ sort_order: target }).eq("id", rowId)).error);
        if (failed) return failed;
      }
    }
    revalidateActivity(await activitySlug(db, photo.activity_id));
    return { ok: true };
  });
}

export async function deleteActivityPhoto(photoId: string): Promise<ActionResult> {
  return withAdmin(async ({ db }) => {
    const { data: photo } = await db.from("activity_photos").select("activity_id, storage_path").eq("id", photoId).maybeSingle();
    if (!photo) return { ok: true };
    const failed = dbError((await db.from("activity_photos").delete().eq("id", photoId)).error);
    if (failed) return failed;
    await removeFiles(db, [photo.storage_path]);
    revalidateActivity(await activitySlug(db, photo.activity_id));
    return { ok: true };
  });
}
