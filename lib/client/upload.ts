"use client";

import { createUploadTicket } from "@/app/admin/(protected)/upload-actions";
import { ALLOWED_IMAGE_TYPES, MAX_ORIGINAL_BYTES, MAX_UPLOAD_BYTES } from "@/lib/storage";

const MAX_DIMENSION = 2000;

export interface PreparedImage {
  blob: Blob;
  type: string;
  width: number;
  height: number;
}

export interface UploadedImage {
  path: string;
  width: number;
  height: number;
}

export function validateOriginal(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return `${file.name}: only JPG, PNG or WebP images are supported.`;
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    return `${file.name}: the file is larger than 20 MB.`;
  }
  return null;
}

// Shrinks large photos to at most 2000px and re-encodes them as WebP
// (JPEG where WebP encoding is unavailable). With keepOriginal (e.g. QR
// codes) the file is uploaded as-is so it stays pixel-perfect.
export async function prepareImage(file: File, keepOriginal = false): Promise<PreparedImage> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  if (keepOriginal) {
    bitmap.close();
    return { blob: file, type: file.type, width, height };
  }
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not process this image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const encode = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  let blob = await encode("image/webp", 0.85);
  if (!blob || blob.type !== "image/webp") blob = await encode("image/jpeg", 0.88);
  if (!blob) throw new Error("Your browser could not process this image.");
  return { blob, type: blob.type, width: w, height: h };
}

function put(url: string, blob: Blob, type: string, onProgress?: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", type);
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (key) xhr.setRequestHeader("apikey", key);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status}).`));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.send(blob);
  });
}

export async function uploadImage(
  file: File,
  folder: string,
  options: { keepOriginal?: boolean; onProgress?: (pct: number) => void } = {}
): Promise<UploadedImage> {
  const invalid = validateOriginal(file);
  if (invalid) throw new Error(invalid);
  const prepared = await prepareImage(file, options.keepOriginal);
  if (prepared.blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name}: the image is still larger than 5 MB after resizing.`);
  }
  const ticket = await createUploadTicket({
    folder,
    contentType: prepared.type,
    size: prepared.blob.size,
  });
  if (!ticket.ok || !ticket.signedUrl || !ticket.path) {
    throw new Error(ticket.message ?? "Could not start the upload.");
  }
  await put(ticket.signedUrl, prepared.blob, prepared.type, options.onProgress);
  return { path: ticket.path, width: prepared.width, height: prepared.height };
}
