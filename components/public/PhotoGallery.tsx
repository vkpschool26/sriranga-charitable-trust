"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface GalleryPhoto {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
}

// Responsive photo grid with a keyboard-accessible fullscreen viewer
// (native <dialog>: Escape closes, focus is trapped and restored).
export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const step = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const onClose = () => setIndex(null);
    dialog.addEventListener("keydown", onKey);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("keydown", onKey);
      dialog.removeEventListener("close", onClose);
    };
  }, [step]);

  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
        {photos.map((photo, i) => (
          <li key={photo.id} className="break-inside-avoid">
            <figure>
              <button
                type="button"
                onClick={() => open(i)}
                className="group relative block w-full overflow-hidden rounded-2xl bg-brand-50"
                aria-label={`View photo ${i + 1} of ${photos.length}: ${photo.alt}`}
              >
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  width={photo.width ?? 1200}
                  height={photo.height ?? 900}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </button>
              {photo.caption && <figcaption className="mt-2 px-1 text-sm text-muted">{photo.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="Photo viewer"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-brand-900/95 p-0 text-white backdrop:bg-black/60"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {current && index !== null && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-3 text-sm text-white/70 sm:px-6">
              <span aria-live="polite">
                {index + 1} / {photos.length}
              </span>
              <button
                type="button"
                onClick={close}
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/10"
                aria-label="Close viewer"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div className="relative flex-1">
              <Image
                key={current.id}
                src={current.url}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => step(-1)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 hover:bg-white/10"
                aria-label="Previous photo"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5 rotate-180" fill="none" aria-hidden="true">
                  <path d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="text-center text-sm text-white/80">{current.caption ?? current.alt}</p>
              <button
                type="button"
                onClick={() => step(1)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/20 hover:bg-white/10"
                aria-label="Next photo"
              >
                <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
