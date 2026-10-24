"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin/action";

export function ConfirmDeleteButton({
  action,
  confirmText,
  label = "Delete",
  redirectTo,
  compact,
}: {
  action: () => Promise<ActionResult>;
  confirmText: string;
  label?: string;
  redirectTo?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm(confirmText)) return;
          setError(null);
          start(async () => {
            const result = await action();
            if (!result.ok) {
              setError(result.message ?? "Could not delete.");
              return;
            }
            if (redirectTo) router.push(redirectTo);
            router.refresh();
          });
        }}
        className={
          compact
            ? "rounded-md px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
            : "inline-flex h-10 items-center rounded-lg border border-red-200 px-4 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        }
      >
        {pending ? "Deleting…" : label}
      </button>
      {error && <span className="mt-1 text-xs text-red-700">{error}</span>}
    </span>
  );
}
