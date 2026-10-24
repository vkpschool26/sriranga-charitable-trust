import "server-only";
import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/server";
import { requireAdminAction, UnauthorizedError } from "@/lib/auth/require-admin";
import type { FieldErrors } from "@/lib/validation/common";

export type ActionResult = {
  ok: boolean;
  message?: string;
  errors?: FieldErrors;
  id?: string;
};


type Db = Awaited<ReturnType<typeof createSessionClient>>;

// Every admin server action goes through this: it verifies the caller is on
// the admin allowlist, then runs the work with the caller's own session so
// database RLS checks the same thing again.
export async function withAdmin<T extends ActionResult = ActionResult>(
  work: (ctx: { db: Db; user: User }) => Promise<T>
): Promise<T | ActionResult> {
  let user: User;
  try {
    user = await requireAdminAction();
  } catch (e) {
    if (e instanceof UnauthorizedError) {
      return { ok: false, message: "Your session has expired or you are not an administrator. Please sign in again." };
    }
    throw e;
  }
  try {
    const db = await createSessionClient();
    return await work({ db, user });
  } catch (e) {
    console.error("[admin action]", e);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

export function dbError(error: { message: string; code?: string } | null): ActionResult | null {
  if (!error) return null;
  if (error.code === "23505") {
    return { ok: false, message: "That slug is already used. Please choose a different one.", errors: { slug: "Already in use." } };
  }
  console.error("[admin db]", error);
  return { ok: false, message: "Could not save. Please check the details and try again." };
}

// Refresh public pages after content changes.
export function revalidatePublic(...paths: string[]) {
  for (const p of paths) revalidatePath(p);
}

export function revalidateEverything() {
  revalidatePath("/", "layout");
}
