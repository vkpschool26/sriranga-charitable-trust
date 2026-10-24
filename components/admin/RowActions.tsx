"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/admin/action";

// Small inline buttons for list rows: move up/down, publish toggle.
export function RowButton({
  action,
  label,
  title,
  disabled,
}: {
  action: () => Promise<ActionResult>;
  label: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled || pending}
      onClick={() =>
        start(async () => {
          const r = await action();
          if (!r.ok && r.message) window.alert(r.message);
          router.refresh();
        })
      }
      className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30"
    >
      {pending ? "…" : label}
    </button>
  );
}
