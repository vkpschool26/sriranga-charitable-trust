"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { getFormToken, submitEnquiry, type EnquiryState } from "@/app/actions/enquiry";
import { buttonClasses } from "@/components/ui/Button";
import { INTERESTS } from "@/lib/validation/enquiry";

const initialState: EnquiryState = { status: "idle" };

const inputClass =
  "mt-2 block w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink shadow-xs transition placeholder:text-muted/60 focus:border-sky focus:outline-none focus:ring-4 focus:ring-sky/15 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/10";

interface FieldProps {
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
}

function Field({ name, label, required, error, hint, children }: FieldProps) {
  const id = `${useId()}-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span className="text-red-600" aria-hidden="true">
            {" "}*
          </span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function EnquiryForm({ kind }: { kind: "volunteer" | "contact" }) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialState);
  const [token, setToken] = useState("");

  useEffect(() => {
    getFormToken().then(setToken).catch(() => setToken(""));
  }, []);

  const v = state.values ?? {};
  const e = state.errors ?? {};

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-[var(--radius-card)] border border-leaf/40 bg-leaf-50 p-8 sm:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-leaf text-brand-900" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h3 className="font-display mt-5 text-2xl font-medium text-brand">Message sent</h3>
        <p className="mt-2 leading-relaxed text-ink/80">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="space-y-6">
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="token" value={token} />
      {/* Honeypot: hidden from people, tempting for bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {state.status === "error" && state.message && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.message}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="name" label="Full name" required error={e.name}>
          {(p) => <input {...p} name="name" type="text" autoComplete="name" required maxLength={100} defaultValue={v.name} className={inputClass} />}
        </Field>
        <Field name="email" label="Email address" required error={e.email}>
          {(p) => <input {...p} name="email" type="email" autoComplete="email" required maxLength={254} defaultValue={v.email} className={inputClass} />}
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="phone" label="Phone number" required={kind === "volunteer"} error={e.phone}>
          {(p) => (
            <input
              {...p}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required={kind === "volunteer"}
              maxLength={20}
              defaultValue={v.phone}
              className={inputClass}
            />
          )}
        </Field>
        {kind === "volunteer" ? (
          <Field name="interest" label="I'm interested in" required error={e.interest}>
            {(p) => (
              <select {...p} name="interest" required defaultValue={v.interest ?? ""} className={inputClass}>
                <option value="" disabled>
                  Choose one…
                </option>
                {INTERESTS.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
        ) : (
          <Field name="subject" label="Subject" required error={e.subject}>
            {(p) => <input {...p} name="subject" type="text" required maxLength={150} defaultValue={v.subject} className={inputClass} />}
          </Field>
        )}
      </div>

      <Field name="message" label="Message" required error={e.message}>
        {(p) => <textarea {...p} name="message" rows={6} required minLength={10} maxLength={5000} defaultValue={v.message} className={inputClass} />}
      </Field>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          We use your details only to respond to you. See our{" "}
          <a href="/privacy-policy/" className="font-medium text-brand underline underline-offset-2">
            Privacy Policy
          </a>
          .
        </p>
        <button type="submit" disabled={pending || !token} className={buttonClasses("primary", "lg", "shrink-0")}>
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
