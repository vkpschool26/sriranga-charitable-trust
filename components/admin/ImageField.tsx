"use client";

import { useEffect, useRef, useState } from "react";
import { uploadImage } from "@/lib/client/upload";
import { publicImageUrl } from "@/lib/storage";

interface ImageFieldProps {
  name: string;
  label: string;
  folder: string;
  initialPath: string | null;
  hint?: string;
  keepOriginal?: boolean;
  previewClass?: string;
}

// Single-image field. Uploads go straight to Storage when a file is chosen;
// the new path is submitted with the form, and the server removes the old
// file only after the record is saved successfully.
export function ImageField({
  name,
  label,
  folder,
  initialPath,
  hint = "JPG, PNG or WebP. Large photos are resized automatically.",
  keepOriginal,
  previewClass = "h-44 w-full object-cover",
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState<string | null>(initialPath);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const preview = localPreview ?? publicImageUrl(path);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      const uploaded = await uploadImage(file, folder, { keepOriginal, onProgress: setProgress });
      setPath(uploaded.path);
      setLocalPreview(URL.createObjectURL(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input type="hidden" name={name} value={path ?? ""} />
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
      <div className="mt-1.5 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className={previewClass} />
        ) : (
          <div className="grid h-32 place-items-center text-sm text-slate-400">No image</div>
        )}
        {progress !== null && (
          <div className="h-1.5 bg-slate-200" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
            <div className="h-full bg-sky transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={progress !== null}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {progress !== null ? `Uploading… ${progress}%` : path ? "Replace image" : "Upload image"}
        </button>
        {path && progress === null && (
          <button
            type="button"
            onClick={() => {
              setPath(null);
              setLocalPreview(null);
            }}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Remove
          </button>
        )}
      </div>
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
