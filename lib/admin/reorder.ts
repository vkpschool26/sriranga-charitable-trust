import "server-only";
import type { createSessionClient } from "@/lib/supabase/server";

type Db = Awaited<ReturnType<typeof createSessionClient>>;

// Moves a row one place up or down and renumbers sort_order in steps of 10.
export async function moveRow(
  db: Db,
  table: "trustees" | "causes",
  id: string,
  direction: "up" | "down"
): Promise<boolean> {
  const { data, error } = await db.from(table).select("id, sort_order").order("sort_order").order("created_at");
  if (error || !data) return false;
  const ids = data.map((r) => r.id);
  const i = ids.indexOf(id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return true;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  const updates = ids
    .map((rowId, index) => ({ id: rowId, sort_order: (index + 1) * 10 }))
    .filter((u) => data.find((r) => r.id === u.id)?.sort_order !== u.sort_order);
  for (const u of updates) {
    const { error: e } = await db.from(table).update({ sort_order: u.sort_order }).eq("id", u.id);
    if (e) return false;
  }
  return true;
}

export async function nextSortOrder(db: Db, table: "trustees" | "causes"): Promise<number> {
  const { data } = await db.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  return ((data?.[0]?.sort_order as number | undefined) ?? 0) + 10;
}
