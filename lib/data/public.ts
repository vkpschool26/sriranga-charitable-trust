import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  DEFAULT_BLOCKS,
  DEFAULT_CAUSES,
  DEFAULT_SETTINGS,
  type Block,
} from "@/lib/content/defaults";
import type {
  ActivityPhotoRow,
  ActivityRow,
  CauseRow,
  ContentKey,
  SiteSettingsRow,
  TrusteeRow,
} from "@/types/database";

// Public, read-only data access. Every function degrades gracefully: when
// Supabase is not configured or unreachable, it returns the built-in deed
// content or an empty list, so the site never shows an error page.

function client() {
  return isSupabaseConfigured() ? createPublicClient() : null;
}

function logError(scope: string, error: unknown) {
  console.error(`[data:${scope}]`, error);
}

export const getSettings = cache(async (): Promise<SiteSettingsRow> => {
  const db = client();
  if (!db) return DEFAULT_SETTINGS;
  const { data, error } = await db
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) logError("settings", error);
  if (!data) return DEFAULT_SETTINGS;
  // Fall back per field so a blank value never breaks the layout.
  const merged = { ...DEFAULT_SETTINGS };
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== "") {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  // Fields admins may intentionally clear.
  merged.upi_qr_path = data.upi_qr_path;
  merged.upi_payee_name = data.upi_payee_name;
  merged.bank_details = data.bank_details;
  return merged;
});

export const getBlocks = cache(
  async (): Promise<Record<ContentKey, Block>> => {
    const db = client();
    if (!db) return DEFAULT_BLOCKS;
    const { data, error } = await db.from("content_blocks").select("*");
    if (error) logError("blocks", error);
    const blocks = { ...DEFAULT_BLOCKS };
    for (const row of data ?? []) {
      const fallback = DEFAULT_BLOCKS[row.key];
      if (!fallback) continue;
      blocks[row.key] = {
        title: row.title || fallback.title,
        body: row.body || fallback.body,
      };
    }
    return blocks;
  }
);

export type PublicCause = Pick<
  CauseRow,
  "slug" | "title" | "summary" | "description" | "icon" | "status" | "image_path" | "image_alt"
>;

export const getCauses = cache(async (): Promise<PublicCause[]> => {
  const fallback = DEFAULT_CAUSES.map((c) => ({
    ...c,
    image_path: null,
    image_alt: null,
  }));
  const db = client();
  if (!db) return fallback;
  const { data, error } = await db
    .from("causes")
    .select("slug, title, summary, description, icon, status, image_path, image_alt")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) {
    logError("causes", error);
    return fallback;
  }
  return data ?? [];
});

export type PublicTrustee = Pick<
  TrusteeRow,
  "id" | "name" | "designation" | "bio" | "photo_path" | "photo_alt"
>;

// No fallback: trustees appear only once an admin publishes them.
export const getTrustees = cache(async (): Promise<PublicTrustee[]> => {
  const db = client();
  if (!db) return [];
  const { data, error } = await db
    .from("trustees")
    .select("id, name, designation, bio, photo_path, photo_alt")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  if (error) logError("trustees", error);
  return data ?? [];
});

export type ActivitySummary = Pick<
  ActivityRow,
  "id" | "slug" | "title" | "activity_date" | "location" | "summary"
> & {
  cover: Pick<ActivityPhotoRow, "storage_path" | "alt_text"> | null;
  photoCount: number;
};

export const getActivities = cache(
  async (limit?: number): Promise<ActivitySummary[]> => {
    const db = client();
    if (!db) return [];
    let query = db
      .from("activities")
      .select("id, slug, title, activity_date, location, summary")
      .eq("is_published", true)
      .order("activity_date", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data: activities, error } = await query;
    if (error) {
      logError("activities", error);
      return [];
    }
    if (!activities?.length) return [];

    const { data: photos, error: photoError } = await db
      .from("activity_photos")
      .select("activity_id, storage_path, alt_text, sort_order")
      .in(
        "activity_id",
        activities.map((a) => a.id)
      )
      .order("sort_order", { ascending: true });
    if (photoError) logError("activity_photos", photoError);

    return activities.map((a) => {
      const own = (photos ?? []).filter((p) => p.activity_id === a.id);
      return {
        ...a,
        cover: own[0]
          ? { storage_path: own[0].storage_path, alt_text: own[0].alt_text }
          : null,
        photoCount: own.length,
      };
    });
  }
);

export type ActivityDetail = ActivityRow & { photos: ActivityPhotoRow[] };

export const getActivity = cache(
  async (slug: string): Promise<ActivityDetail | null> => {
    const db = client();
    if (!db) return null;
    const { data: activity, error } = await db
      .from("activities")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) logError("activity", error);
    if (!activity) return null;
    const { data: photos } = await db
      .from("activity_photos")
      .select("*")
      .eq("activity_id", activity.id)
      .order("sort_order", { ascending: true });
    return { ...activity, photos: photos ?? [] };
  }
);
