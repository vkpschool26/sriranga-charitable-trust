"use client";

import { useState } from "react";

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // Clipboard unavailable — the value is visible to copy manually.
        }
      }}
      className="rounded-full border border-brand/20 px-4 py-1.5 text-sm font-semibold text-brand transition-colors hover:bg-brand-50"
    >
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
