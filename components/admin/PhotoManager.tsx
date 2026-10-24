"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addActivityPhoto,
  deleteActivityPhoto,
  moveActivityPhoto,
  updateActivityPhoto,
} from "@/app/admin/(protected)/activities/actions";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { RowButton } from "@/components/admin/RowActions";
import { IDLE_RESULT } from "@/components/admin/state";
import { fieldClass } from "@/components/admin/ui";
import { uploadImage, validateOriginal } from "@/lib/client/upload";
import { publicImageUrl } from "@/lib/storage";
import type { ActivityPhotoRow } from "@/types/database";

type QueueItem = { key: string; name: string; progress: number; error?: string; done?: boolean };

export function PhotoManager({
  activityId,
  activityTitle,
  photos,
}: {
  activityId: string;
  activityTitle: string;
  photos: ActivityPhotoRow[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const busy = queue.some((q) => !q.done && !q.error);

  const patch = (key: string, update: Partial<QueueItem>) =>
    setQueue((items) => items.map((q) => (q.key === key ? { ...q, ...update } : q)));

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const items = files.map((f, i) => ({ key: `${Date.now()}-${i}`, name: f.name, progress: 0 }));
    setQueue(items);

    // Upload one at a time: gentler on mobile connections.
    let n = photos.length;
    for (const [i, file] of files.entries()) {
      const key = items[i].key;
      const invalid = validateOriginal(file);
      if (invalid) {
        patch(key, { error: invalid });
        continue;
      }
      try {
        const uploaded = await uploadImage(file, `activities/${activityId}`, {
          onProgress: (progress) => patch(key, { progress }),
        });
        n += 1;
        const result = await addActivityPhoto({
          activityId,
          path: uploaded.path,
          width: uploaded.width,
          height: uploaded.height,
          alt: `${activityTitle} — photo ${n}`,
        });
        if (!result.ok) throw new Error(result.message ?? "Could not save the photo.");
        patch(key, { progress: 100, done: true });
      } catch (err) {
        patch(key, { error: err instanceof Error ? err.message : "Upload failed." });
      }
    }
    router.refresh();
  }

  return (
    <section aria-labelledby="photos-heading" className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id="photos-heading" className="font-semibold text-slate-900">
            Photos ({photos.length})
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            The first photo is used as the cover. Use ↑ ↓ to reorder. Large photos are resized automatically.
          </p>
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onFiles} />
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Upload photos"}
        </button>
      </div>

      {queue.length > 0 && (
        <ul className="mt-5 space-y-2" aria-live="polite">
          {queue.map((q) => (
            <li key={q.key} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="truncate text-slate-700">{q.name}</span>
                <span className={q.error ? "text-red-700" : q.done ? "text-leaf-deep" : "text-slate-500"}>
                  {q.error ? "Failed" : q.done ? "Done" : `${q.progress}%`}
                </span>
              </div>
              {q.error ? (
                <p className="mt-1 text-xs text-red-700">{q.error}</p>
              ) : (
                <div className="mt-1.5 h-1 overflow-hidden rounded bg-slate-200">
                  <div className="h-full bg-sky transition-all" style={{ width: `${q.progress}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {photos.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No photos yet.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {photos.map((photo, i) => (
            <PhotoRow key={photo.id} photo={photo} isFirst={i === 0} isLast={i === photos.length - 1} />
          ))}
        </ul>
      )}
    </section>
  );
}

function PhotoRow({ photo, isFirst, isLast }: { photo: ActivityPhotoRow; isFirst: boolean; isLast: boolean }) {
  const [state, action, pending] = useActionState(updateActivityPhoto.bind(null, photo.id), IDLE_RESULT);
  const url = publicImageUrl(photo.storage_path);
  return (
    <li className="overflow-hidden rounded-lg border border-slate-200">
      <div className="relative bg-slate-100">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={photo.alt_text} className="aspect-[4/3] w-full object-cover" loading="lazy" />
        )}
        {isFirst && <span className="absolute left-2 top-2 rounded bg-brand px-2 py-0.5 text-xs font-semibold text-white">Cover</span>}
      </div>
      <form action={action} className="space-y-3 p-3">
        <div>
          <label className="text-xs font-medium text-slate-600" htmlFor={`alt-${photo.id}`}>
            Description (for screen readers) *
          </label>
          <input id={`alt-${photo.id}`} name="alt_text" defaultValue={photo.alt_text} required maxLength={300} className={fieldClass} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600" htmlFor={`cap-${photo.id}`}>
            Caption (optional)
          </label>
          <input id={`cap-${photo.id}`} name="caption" defaultValue={photo.caption ?? ""} maxLength={300} className={fieldClass} />
        </div>
        {state.message && <p className={`text-xs ${state.ok ? "text-leaf-deep" : "text-red-700"}`}>{state.message}</p>}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button type="submit" disabled={pending} className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
            {pending ? "Saving…" : "Save"}
          </button>
          <div className="flex items-center gap-1">
            <RowButton action={moveActivityPhoto.bind(null, photo.id, "up")} label="↑" title="Move earlier" disabled={isFirst} />
            <RowButton action={moveActivityPhoto.bind(null, photo.id, "down")} label="↓" title="Move later" disabled={isLast} />
            <ConfirmDeleteButton compact action={deleteActivityPhoto.bind(null, photo.id)} confirmText="Delete this photo? This cannot be undone." />
          </div>
        </div>
      </form>
    </li>
  );
}
