"use client";

import { useActionState } from "react";
import Link from "next/link";
import { saveCause } from "@/app/admin/(protected)/causes/actions";
import { IDLE_RESULT } from "@/components/admin/state";
import { ImageField } from "@/components/admin/ImageField";
import { CheckboxField, SelectField, StatusBanner, SubmitButton, TextAreaField, TextField, secondaryButton } from "@/components/admin/ui";
import { CAUSE_ICON_OPTIONS } from "@/components/ui/CauseIcon";
import type { CauseRow } from "@/types/database";

export function CauseForm({ cause }: { cause?: CauseRow }) {
  const [state, action] = useActionState(saveCause.bind(null, cause?.id ?? null), IDLE_RESULT);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-6">
      <StatusBanner state={state} />
      <div className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <TextField name="title" label="Title" required defaultValue={cause?.title} error={e.title} maxLength={120} />
          <TextField name="slug" label="Link name (slug)" defaultValue={cause?.slug} error={e.slug} maxLength={80} hint="Used in the page link, e.g. “education”. Leave empty to create it from the title." />
          <TextAreaField name="summary" label="Summary" required defaultValue={cause?.summary} error={e.summary} rows={3} maxLength={400} hint="One or two sentences, shown on the home page." />
          <TextAreaField name="description" label="Description" defaultValue={cause?.description} error={e.description} rows={8} maxLength={4000} hint="Shown on the Our Causes page. Leave a blank line between paragraphs." />
        </div>
        <div className="space-y-5">
          <SelectField
            name="status"
            label="Status"
            required
            defaultValue={cause?.status ?? "planned"}
            options={[
              { value: "planned", label: "Planned focus (not yet started)" },
              { value: "active", label: "Active (work under way)" },
            ]}
            hint="Only mark as Active once real work has begun."
          />
          <SelectField name="icon" label="Icon" required defaultValue={cause?.icon ?? "community"} options={CAUSE_ICON_OPTIONS} />
          <TextField name="sort_order" label="Display order" type="number" defaultValue={cause?.sort_order} error={e.sort_order} />
          <ImageField name="image_path" label="Photo (optional)" folder="causes" initialPath={cause?.image_path ?? null} hint="Only use real photos of the Trust's own work." />
          <TextField name="image_alt" label="Photo description" defaultValue={cause?.image_alt} error={e.image_alt} maxLength={200} />
        </div>
      </div>
      <CheckboxField name="is_published" label="Show on the website" defaultChecked={cause?.is_published ?? true} />
      <div className="flex gap-3">
        <SubmitButton />
        <Link href="/admin/causes/" className={secondaryButton}>
          Back to list
        </Link>
      </div>
    </form>
  );
}
