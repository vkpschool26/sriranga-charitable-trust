import { beforeEach, describe, expect, it, vi } from "vitest";

const insert = vi.fn();
let recentForIp = 0;
let recentGlobal = 0;

// Minimal chainable stand-in for the Supabase query builder.
function countQuery() {
  const filters: string[] = [];
  const q = {
    select: () => q,
    eq: (col: string) => (filters.push(col), q),
    gte: () => q,
    then: (resolve: (v: { count: number }) => void) =>
      resolve({ count: filters.includes("ip_hash") ? recentForIp : recentGlobal }),
  };
  return q;
}

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: () => ({ ...countQuery(), insert }),
  }),
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "198.51.100.9" }),
}));

const { submitEnquiry } = await import("@/app/actions/enquiry");
const { issueFormToken } = await import("@/lib/spam");

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const valid = {
  kind: "volunteer",
  name: "Asha Kumar",
  email: "asha@example.com",
  phone: "8095032044",
  interest: "partner",
  message: "Our school would like to partner with the Trust.",
};
const oldToken = () => issueFormToken(Date.now() - 10_000);

describe("submitEnquiry", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service");
    insert.mockReset().mockResolvedValue({ error: null });
    recentForIp = 0;
    recentGlobal = 0;
  });

  it("stores a valid enquiry with a hashed IP", async () => {
    const r = await submitEnquiry({ status: "idle" }, form({ ...valid, token: oldToken() }));
    expect(r.status).toBe("success");
    expect(insert).toHaveBeenCalledTimes(1);
    const row = insert.mock.calls[0][0];
    expect(row).toMatchObject({ kind: "volunteer", interest: "partner", subject: null });
    expect(row.ip_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(row)).not.toContain("198.51.100.9");
  });

  it("silently drops honeypot submissions", async () => {
    const r = await submitEnquiry({ status: "idle" }, form({ ...valid, token: oldToken(), website: "http://spam" }));
    expect(r.status).toBe("success");
    expect(insert).not.toHaveBeenCalled();
  });

  it("silently drops instant (bot-speed) submissions", async () => {
    const r = await submitEnquiry({ status: "idle" }, form({ ...valid, token: issueFormToken() }));
    expect(r.status).toBe("success");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rejects missing tokens with a helpful message", async () => {
    const r = await submitEnquiry({ status: "idle" }, form(valid));
    expect(r.status).toBe("error");
    expect(insert).not.toHaveBeenCalled();
  });

  it("returns field errors for invalid input and keeps the values", async () => {
    const r = await submitEnquiry({ status: "idle" }, form({ ...valid, email: "bad", token: oldToken() }));
    expect(r.status).toBe("error");
    expect(r.errors?.email).toBeTruthy();
    expect(r.values?.name).toBe("Asha Kumar");
    expect(insert).not.toHaveBeenCalled();
  });

  it("rate-limits repeated submissions from the same IP", async () => {
    recentForIp = 3;
    const r = await submitEnquiry({ status: "idle" }, form({ ...valid, token: oldToken() }));
    expect(r.status).toBe("error");
    expect(insert).not.toHaveBeenCalled();
  });

  it("applies a global hourly cap", async () => {
    recentGlobal = 60;
    const r = await submitEnquiry({ status: "idle" }, form({ ...valid, token: oldToken() }));
    expect(r.status).toBe("error");
    expect(insert).not.toHaveBeenCalled();
  });

  it("ignores attempts to set admin-only fields", async () => {
    await submitEnquiry({ status: "idle" }, form({ ...valid, token: oldToken(), status: "closed", id: "x" }));
    const row = insert.mock.calls[0][0];
    expect(row.status).toBeUndefined();
    expect(row.id).toBeUndefined();
  });
});
