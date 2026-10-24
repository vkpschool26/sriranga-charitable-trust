import "server-only";
import { BUCKET, isManagedPath } from "@/lib/storage";
import type { createSessionClient } from "@/lib/supabase/server";

type Db = Awaited<ReturnType<typeof createSessionClient>>;

// Delete storage files we created. Ignores anything that is not one of our
// generated paths, so a bad value can never delete unrelated files.
export async function removeFiles(db: Db, paths: (string | null | undefined)[]) {
  const safe = paths.filter((p): p is string => Boolean(p) && isManagedPath(p as string));
  if (safe.length === 0) return;
  const { error } = await db.storage.from(BUCKET).remove(safe);
  if (error) console.error("[storage] remove failed", error);
}

// Accept an uploaded path only if it is ours and lives in the expected folder.
export function acceptPath(value: string | null, folderPrefix: string): string | null {
  if (!value) return null;
  return isManagedPath(value) && value.startsWith(`${folderPrefix}/`) ? value : null;
}
