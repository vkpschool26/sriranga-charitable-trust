import type { CauseStatus as Status } from "@/types/database";

export function CauseStatus({ status }: { status: Status }) {
  return status === "active" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf-50 px-2.5 py-1 text-xs font-semibold text-leaf-deep">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-leaf-deep" />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full border border-sky" />
      Planned focus
    </span>
  );
}
