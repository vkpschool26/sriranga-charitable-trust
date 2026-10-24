import Image from "next/image";
import Link from "next/link";
import mark from "@/public/brand/src-mark.png";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { requireAdminPage } from "@/lib/auth/require-admin";
import { createSessionClient } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/auth-actions";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminPage();
  const db = await createSessionClient();
  const { count } = await db
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 bg-brand-900 px-4 text-white sm:px-6">
        <Link href="/admin/" className="flex items-center gap-3">
          <span className="grid place-items-center rounded-lg bg-white p-1">
            <Image src={mark} alt="" width={28} height={22} />
          </span>
          <span className="text-sm font-semibold">SRC Trust · Admin</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-white/60 sm:inline">{user.email}</span>
          <a href="/" target="_blank" rel="noopener noreferrer" className="hidden rounded-lg px-3 py-1.5 text-white/80 hover:bg-white/10 sm:inline">
            View website ↗
          </a>
          <form action={signOut}>
            <button type="submit" className="rounded-lg bg-white/10 px-3 py-1.5 font-medium hover:bg-white/20">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar newEnquiries={count ?? 0} />
        <main className="min-w-0 flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
