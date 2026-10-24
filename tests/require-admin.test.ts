import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();
const rpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSessionClient: async () => ({ auth: { getUser }, rpc }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const { checkAdmin, requireAdminAction, requireAdminPage } = await import("@/lib/auth/require-admin");

describe("admin authorisation", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    getUser.mockReset();
    rpc.mockReset();
  });

  it("rejects signed-out visitors", async () => {
    getUser.mockResolvedValue({ data: { user: null } });
    expect(await checkAdmin()).toEqual({ ok: false, reason: "signed_out" });
    await expect(requireAdminPage()).rejects.toThrow("REDIRECT:/admin/login/");
  });

  it("rejects signed-in users who are not on the admin allowlist", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1", email: "someone@example.com" } } });
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await checkAdmin()).toEqual({ ok: false, reason: "not_admin" });
    await expect(requireAdminAction()).rejects.toThrow(/not authorised/);
    await expect(requireAdminPage()).rejects.toThrow("REDIRECT:/admin/login/?error=not_authorised");
  });

  it("treats a failed allowlist check as not authorised", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    rpc.mockResolvedValue({ data: null, error: { message: "function does not exist" } });
    expect((await checkAdmin()).ok).toBe(false);
  });

  it("accepts allowlisted admins", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "u2", email: "admin@example.com" } } });
    rpc.mockResolvedValue({ data: true, error: null });
    const result = await checkAdmin();
    expect(result.ok).toBe(true);
    expect(rpc).toHaveBeenCalledWith("is_admin");
  });

  it("denies everything when Supabase is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    expect(await checkAdmin()).toEqual({ ok: false, reason: "not_configured" });
    expect(getUser).not.toHaveBeenCalled();
  });
});
