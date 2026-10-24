"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveTrustee } from "@/app/admin/(protected)/trustees/actions";
import { IDLE_RESULT } from "@/components/admin/state";
import { ImageField } from "@/components/admin/ImageField";
import { CheckboxField, StatusBanner, SubmitButton, TextAreaField, TextField, secondaryButton } from "@/components/admin/ui";
import type { TrusteeRow } from "@/types/database";

export function TrusteeForm({ trustee }: { trustee?: TrusteeRow }) {
  const [state, action] = useActionState(saveTrustee.bind(null, trustee?.id ?? null), IDLE_RESULT);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-6">
      <StatusBanner state={state} />
      <div className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-[1fr_260px]">
        <div className="space-y-5">
          <TextField name="name" label="Name" required defaultValue={trustee?.name} error={e.name} maxLength={120} placeholder="e.g. Sri M. K. Marudaiah" />
          <TextField name="designation" label="Designation" required defaultValue={trustee?.designation} error={e.designation} maxLength={80} placeholder="e.g. Managing Trustee" />
          <TextAreaField name="bio" label="Short description" defaultValue={trustee?.bio} error={e.bio} rows={5} maxLength={1200} hint="Optional. A few sentences about the trustee." />
          <TextField name="sort_order" label="Display order" type="number" defaultValue={trustee?.sort_order} error={e.sort_order} hint="Lower numbers appear first. Leave empty to add at the end." />
        </div>
        <div className="space-y-4">
          <ImageField name="photo_path" label="Photograph" folder="trustees" initialPath={trustee?.photo_path ?? null} previewClass="aspect-square w-full object-cover" hint="Square photos work best. Without a photo, the trustee's initials are shown." />
          <TextField name="photo_alt" label="Photo description" defaultValue={trustee?.photo_alt} error={e.photo_alt} maxLength={200} hint="For screen readers, e.g. “Portrait of …”." />
        </div>
      </div>
      <CheckboxField name="is_published" label="Show on the website" description="Only publish once this trustee has agreed to appear publicly." defaultChecked={trustee?.is_published ?? false} />
      <div className="flex gap-3">
        <SubmitButton />
        <Link href="/admin/trustees/" className={secondaryButton}>
          Back to list
        </Link>
      </div>
    </form>
  );
}
