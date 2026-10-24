import { supabaseUrl } from "@/lib/supabase/env";

export const BUCKET = "site-media";
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // after in-browser resize
export const MAX_ORIGINAL_BYTES = 20 * 1024 * 1024; // before resize
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

export const EXTENSION: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Every folder an upload may target. activities/{uuid} is per activity.
const FOLDER_PATTERN =
  /^(site|content|trustees|causes|activities\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/;

export function isAllowedFolder(folder: string): boolean {
  return FOLDER_PATTERN.test(folder);
}

// Paths we generate look like "<folder>/<uuid>.<ext>".
const PATH_PATTERN =
  /^(site|content|trustees|causes|activities\/[0-9a-f-]{36})\/[0-9a-f-]{36}\.(jpg|png|webp)$/;

export function isManagedPath(path: string): boolean {
  return PATH_PATTERN.test(path);
}

export function publicImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = supabaseUrl();
  if (!base) return null;
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}
