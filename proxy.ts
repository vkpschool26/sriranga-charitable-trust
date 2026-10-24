import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Runs on /admin routes only: refreshes the Supabase session cookie and sends
// signed-out visitors to the login page. This is a convenience layer — real
// authorisation (admin allowlist) is enforced in the admin layout, in every
// server action, and by Row Level Security in the database.
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  const isPublicAdminPage = pathname.startsWith("/admin/login") || pathname.startsWith("/admin/reset-password");

  if (!url || !key) {
    return isPublicAdminPage ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login/", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicAdminPage) {
    return NextResponse.redirect(new URL("/admin/login/", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
