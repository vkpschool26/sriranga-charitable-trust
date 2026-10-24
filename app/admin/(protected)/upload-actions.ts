"use server";

import { randomUUID } from "node:crypto";
import { withAdmin, type ActionResult } from "@/lib/admin/action";
import {
  ALLOWED_IMAGE_TYPES,
  BUCKET,
  EXTENSION,
  MAX_UPLOAD_BYTES,
  isAllowedFolder,
  type AllowedImageType,
} from "@/lib/storage";

export type UploadTicket = ActionResult & { path?: string; signedUrl?: string };

// Issues a one-time signed URL so the browser can upload straight to
// Supabase Storage (avoids the 1 MB server-action body limit). The server
// chooses the file name, and the admin's own session must pass the storage
// RLS insert policy for the URL to be created.
export async function createUploadTicket(input: {
  folder: string;
  contentType: string;
  size: number;
}): Promise<UploadTicket> {
  return withAdmin<UploadTicket>(async ({ db }) => {
    if (!isAllowedFolder(input.folder)) {
      return { ok: false, message: "Invalid upload location." };
    }
    if (!ALLOWED_IMAGE_TYPES.includes(input.contentType as AllowedImageType)) {
      return { ok: false, message: "Only JPG, PNG or WebP images can be uploaded." };
    }
    if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MAX_UPLOAD_BYTES) {
      return { ok: false, message: "Images must be smaller than 5 MB." };
    }
    const path = `${input.folder}/${randomUUID()}.${EXTENSION[input.contentType as AllowedImageType]}`;
    const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error("[upload ticket]", error);
      return { ok: false, message: "Could not start the upload. Check that the storage bucket is set up." };
    }
    return { ok: true, path, signedUrl: data.signedUrl };
  });
}
