import "server-only";
import { createHmac, createHash, timingSafeEqual } from "node:crypto";

// Lightweight anti-spam for public forms: a signed "form opened at" token
// (rejects instant bot submissions and stale replays), a hidden honeypot
// field, and per-IP rate limiting on salted IP hashes (no raw IPs stored).

export const HONEYPOT_FIELD = "website";
export const MIN_FILL_MS = 3_000;
export const MAX_TOKEN_AGE_MS = 24 * 60 * 60 * 1000;
export const PER_IP_LIMIT = 3; // submissions…
export const PER_IP_WINDOW_MS = 15 * 60 * 1000; // …per 15 minutes
export const GLOBAL_HOURLY_LIMIT = 60;

function secret(): string {
  return (
    process.env.ENQUIRY_IP_SALT ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "local-development-only"
  );
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function issueFormToken(now = Date.now()): string {
  const ts = String(now);
  return `${ts}.${sign(ts)}`;
}

export type TokenCheck = "ok" | "too_fast" | "invalid" | "expired";

export function checkFormToken(token: string | undefined, now = Date.now()): TokenCheck {
  if (!token) return "invalid";
  const [ts, sig] = token.split(".");
  if (!ts || !sig || !/^\d+$/.test(ts)) return "invalid";
  const expected = Buffer.from(sign(ts));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return "invalid";
  }
  const age = now - Number(ts);
  if (age < MIN_FILL_MS) return "too_fast";
  if (age > MAX_TOKEN_AGE_MS) return "expired";
  return "ok";
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(`${secret()}:${ip}`).digest("hex");
}

export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
