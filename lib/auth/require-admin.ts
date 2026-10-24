import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSessionClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminCheck =
  | { ok: true; user: User }
  | { ok: false; reason: "not_configured" | "signed_out" | "not_admin" };

// Signed in is not enough: the user must also be on the admin_users
// allowlist (checked by the is_admin() database function).
export async function checkAdmin(): Promise<AdminCheck> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "not_configured" };

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "signed_out" };

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  if (error || isAdmin !== true) return { ok: false, reason: "not_admin" };

  return { ok: true, user };
}

// For layouts and pages: redirect away unless the visitor is an admin.
export async function requireAdminPage(): Promise<User> {
  const result = await checkAdmin();
  if (result.ok) return result.user;
  if (result.reason === "not_admin") {
    redirect("/admin/login/?error=not_authorised");
  }
  redirect("/admin/login/");
}

export class UnauthorizedError extends Error {
  constructor() {
    super("You are not authorised to perform this action.");
  }
}

// For server actions: throws unless the caller is an admin.
export async function requireAdminAction(): Promise<User> {
  const result = await checkAdmin();
  if (!result.ok) throw new UnauthorizedError();
  return result.user;
}
