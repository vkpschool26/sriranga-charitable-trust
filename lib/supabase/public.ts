import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseAnonKey, supabaseUrl } from "./env";

// Cookie-less anonymous client for public pages, so they stay statically
// cacheable. RLS limits it to published content.
export function createPublicClient() {
  return createClient<Database>(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
