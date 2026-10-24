"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { enquirySchema } from "@/lib/validation/enquiry";
import { fieldErrors, formToObject, type FieldErrors } from "@/lib/validation/common";
import {
  GLOBAL_HOURLY_LIMIT,
  HONEYPOT_FIELD,
  PER_IP_LIMIT,
  PER_IP_WINDOW_MS,
  checkFormToken,
  clientIp,
  hashIp,
  issueFormToken,
} from "@/lib/spam";

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: FieldErrors;
  values?: Record<string, string>;
};

const SUCCESS: EnquiryState = {
  status: "success",
  message: "Thank you — your message has been received. A member of the Trust will get back to you.",
};

export async function getFormToken(): Promise<string> {
  return issueFormToken();
}

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData
): Promise<EnquiryState> {
  const raw = formToObject(formData);
  const { [HONEYPOT_FIELD]: honeypot, token, ...values } = raw;

  // Bots: pretend success so they don't retry.
  if (honeypot) return SUCCESS;
  const tokenCheck = checkFormToken(token);
  if (tokenCheck === "too_fast") return SUCCESS;
  if (tokenCheck !== "ok") {
    return {
      status: "error",
      message: "This form has expired. Please refresh the page and try again.",
      values,
    };
  }

  const parsed = enquirySchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields.",
      errors: fieldErrors(parsed.error),
      values,
    };
  }

  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      status: "error",
      message: "The form is temporarily unavailable. Please call us instead.",
      values,
    };
  }

  const db = createServiceClient();
  const ipHash = hashIp(clientIp(await headers()));

  const since = new Date(Date.now() - PER_IP_WINDOW_MS).toISOString();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [perIp, global] = await Promise.all([
    db
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since),
    db
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .gte("created_at", hourAgo),
  ]);
  if ((perIp.count ?? 0) >= PER_IP_LIMIT || (global.count ?? 0) >= GLOBAL_HOURLY_LIMIT) {
    return {
      status: "error",
      message: "We've received several messages from you recently. Please try again a little later, or call us.",
      values,
    };
  }

  const data = parsed.data;
  const { error } = await db.from("enquiries").insert({
    kind: data.kind,
    name: data.name,
    email: data.email,
    phone: data.phone ?? null,
    interest: data.kind === "volunteer" ? data.interest : null,
    subject: data.kind === "contact" ? data.subject : null,
    message: data.message,
    ip_hash: ipHash,
  });

  if (error) {
    console.error("[enquiry] insert failed", error);
    return {
      status: "error",
      message: "Sorry, something went wrong while sending your message. Please try again or call us.",
      values,
    };
  }

  return SUCCESS;
}
