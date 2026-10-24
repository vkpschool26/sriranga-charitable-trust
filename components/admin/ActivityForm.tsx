"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveActivity } from "@/app/admin/(protected)/activities/actions";
import { IDLE_RESULT } from "@/components/admin/state";
import { CheckboxField, StatusBanner, SubmitButton, TextAreaField, TextField, secondaryButton } from "@/components/admin/ui";
import type { ActivityRow } from "@/types/database";

export function ActivityForm({ activity, notice }: { activity?: ActivityRow; notice?: string }) {
  const [state, action] = useActionState(saveActivity.bind(null, activity?.id ?? null), notice ? { ok: true, message: notice } : IDLE_RESULT);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-6">
      <StatusBanner state={state} />
      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <TextField name="title" label="Title" required defaultValue={activity?.title} error={e.title} maxLength={160} placeholder="e.g. Free health check-up camp" />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="activity_date" label="Date" type="date" required defaultValue={activity?.activity_date} error={e.activity_date} />
          <TextField name="location" label="Location" defaultValue={activity?.location} error={e.location} maxLength={160} placeholder="e.g. Manchaladore, Gubbi Taluk" />
        </div>
        <TextAreaField name="summary" label="Summary" required defaultValue={activity?.summary} error={e.summary} rows={3} maxLength={400} hint="One or two sentences shown on the gallery cards." />
        <TextAreaField name="description" label="Full description" defaultValue={activity?.description} error={e.description} rows={8} maxLength={8000} hint="Optional. Leave a blank line between paragraphs." />
        <TextField name="slug" label="Link name (slug)" defaultValue={activity?.slug} error={e.slug} maxLength={80} hint="Used in the page link. Leave empty to create it from the title and year." />
      </div>
      <CheckboxField name="is_published" label="Show on the website" description="Keep unpublished while you add photos and check the details." defaultChecked={activity?.is_published ?? false} />
      <div className="flex gap-3">
        <SubmitButton>{activity ? "Save changes" : "Create and add photos"}</SubmitButton>
        <Link href="/admin/activities/" className={secondaryButton}>
          Back to list
        </Link>
      </div>
    </form>
  );
}
