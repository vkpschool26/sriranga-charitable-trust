"use client";

import { useActionState } from "react";
import { saveBlock } from "@/app/admin/(protected)/content/actions";
import { IDLE_RESULT } from "@/components/admin/state";
import { StatusBanner, SubmitButton, TextAreaField, TextField } from "@/components/admin/ui";

export function BlockForm({
  blockKey,
  label,
  where,
  title,
  body,
  rows = 4,
}: {
  blockKey: string;
  label: string;
  where: string;
  title: string | null;
  body: string | null;
  rows?: number;
}) {
  const [state, action] = useActionState(saveBlock, IDLE_RESULT);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
      <input type="hidden" name="key" value={blockKey} />
      <div>
        <h2 className="font-semibold text-slate-900">{label}</h2>
        <p className="text-xs text-slate-500">Shown on: {where}</p>
      </div>
      <StatusBanner state={state} />
      <TextField name="title" label="Heading" defaultValue={title} error={e.title} maxLength={200} />
      <TextAreaField name="body" label="Text" defaultValue={body} error={e.body} rows={rows} maxLength={4000} hint="Leave a blank line between paragraphs. If left empty, the original text is used." />
      <SubmitButton />
    </form>
  );
}
