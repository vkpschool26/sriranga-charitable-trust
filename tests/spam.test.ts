import { describe, expect, it } from "vitest";
import { MAX_TOKEN_AGE_MS, MIN_FILL_MS, checkFormToken, clientIp, hashIp, issueFormToken } from "@/lib/spam";

describe("form token", () => {
  const t0 = 1_800_000_000_000;

  it("accepts a token used after the minimum fill time", () => {
    expect(checkFormToken(issueFormToken(t0), t0 + MIN_FILL_MS + 1)).toBe("ok");
  });

  it("flags instant submissions as too fast", () => {
    expect(checkFormToken(issueFormToken(t0), t0 + 500)).toBe("too_fast");
  });

  it("expires old tokens", () => {
    expect(checkFormToken(issueFormToken(t0), t0 + MAX_TOKEN_AGE_MS + 1)).toBe("expired");
  });

  it("rejects missing, malformed and tampered tokens", () => {
    expect(checkFormToken(undefined)).toBe("invalid");
    expect(checkFormToken("garbage")).toBe("invalid");
    const [, sig] = issueFormToken(t0).split(".");
    expect(checkFormToken(`${t0 - 60_000}.${sig}`, t0 + 10_000)).toBe("invalid");
  });
});

describe("ip handling", () => {
  it("hashes IPs deterministically without exposing them", () => {
    const h = hashIp("203.0.113.7");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(h).toBe(hashIp("203.0.113.7"));
    expect(h).not.toBe(hashIp("203.0.113.8"));
    expect(h).not.toContain("203");
  });

  it("uses the first x-forwarded-for address", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "198.51.100.1, 10.0.0.1" }))).toBe("198.51.100.1");
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
