"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/lib/admin/action";

export const fieldClass =
  "mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-xs transition focus:border-sky focus:outline-none focus:ring-4 focus:ring-sky/15 aria-[invalid=true]:border-red-500";

export function PageTitle({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="text-sm font-medium text-slate-500 hover:text-brand">
          ← {back.label}
        </Link>
      )}
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-medium text-brand">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-6 ${className}`}>{children}</div>;
}

interface BaseFieldProps {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
}

function Label({ name, label, required }: { name: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={`f-${name}`} className="text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-600"> *</span>}
    </label>
  );
}

function Help({ name, hint, error }: { name: string; hint?: string; error?: string }) {
  if (error)
    return (
      <p id={`f-${name}-msg`} className="mt-1 text-xs text-red-700">
        {error}
      </p>
    );
  if (hint)
    return (
      <p id={`f-${name}-msg`} className="mt-1 text-xs text-slate-500">
        {hint}
      </p>
    );
  return null;
}

export function TextField({
  name,
  label,
  required,
  hint,
  error,
  defaultValue,
  type = "text",
  maxLength,
  placeholder,
}: BaseFieldProps & { defaultValue?: string | number | null; type?: string; maxLength?: number; placeholder?: string }) {
  return (
    <div>
      <Label name={name} label={label} required={required} />
      <input
        id={`f-${name}`}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `f-${name}-msg` : undefined}
        className={fieldClass}
      />
      <Help name={name} hint={hint} error={error} />
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  required,
  hint,
  error,
  defaultValue,
  rows = 4,
  maxLength,
}: BaseFieldProps & { defaultValue?: string | null; rows?: number; maxLength?: number }) {
  return (
    <div>
      <Label name={name} label={label} required={required} />
      <textarea
        id={`f-${name}`}
        name={name}
        rows={rows}
        required={required}
        maxLength={maxLength}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? `f-${name}-msg` : undefined}
        className={fieldClass}
      />
      <Help name={name} hint={hint} error={error} />
    </div>
  );
}

export function SelectField({
  name,
  label,
  required,
  hint,
  error,
  defaultValue,
  options,
}: BaseFieldProps & { defaultValue?: string | null; options: { value: string; label: string }[] }) {
  return (
    <div>
      <Label name={name} label={label} required={required} />
      <select
        id={`f-${name}`}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        aria-invalid={Boolean(error)}
        className={fieldClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Help name={name} hint={hint} error={error} />
    </div>
  );
}

export function CheckboxField({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[var(--color-brand)]"
      />
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}

export function StatusBanner({ state }: { state: ActionResult }) {
  if (!state.message) return null;
  return (
    <div
      role={state.ok ? "status" : "alert"}
      className={`rounded-lg border px-4 py-3 text-sm ${
        state.ok ? "border-leaf/50 bg-leaf-50 text-leaf-deep" : "border-red-200 bg-red-50 text-red-800"
      }`}
    >
      {state.message}
    </div>
  );
}

export function SubmitButton({ children = "Save changes", pendingText = "Saving…" }: { children?: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-10 items-center justify-center rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:opacity-60"
    >
      {pending ? pendingText : children}
    </button>
  );
}

export const secondaryButton =
  "inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50";

export function Badge({ tone, children }: { tone: "green" | "slate" | "blue" | "amber"; children: React.ReactNode }) {
  const tones = {
    green: "bg-leaf-50 text-leaf-deep",
    slate: "bg-slate-100 text-slate-600",
    blue: "bg-brand-50 text-brand",
    amber: "bg-amber-50 text-amber-800",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}
