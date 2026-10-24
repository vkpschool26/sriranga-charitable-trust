"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "@/app/admin/auth-actions";
import { fieldClass } from "@/components/admin/ui";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, { error: initialError });
  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="text-sm font-medium text-slate-700">
          Email address
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required defaultValue={state.email} className={fieldClass} />
      </div>
      <div>
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={fieldClass} />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-lg bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
