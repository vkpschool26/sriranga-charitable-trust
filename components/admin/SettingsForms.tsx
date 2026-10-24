"use client";

import { useActionState } from "react";
import { saveDonation, saveSettings } from "@/app/admin/(protected)/settings/actions";
import { IDLE_RESULT } from "@/components/admin/state";
import { ImageField } from "@/components/admin/ImageField";
import { StatusBanner, SubmitButton, TextAreaField, TextField } from "@/components/admin/ui";
import type { SiteSettingsRow } from "@/types/database";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <legend className="px-1 text-sm font-semibold text-slate-900">{title}</legend>
      {children}
    </fieldset>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettingsRow }) {
  const [state, action] = useActionState(saveSettings, IDLE_RESULT);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-6">
      <StatusBanner state={state} />
      <Section title="Trust identity">
        <TextField name="trust_name" label="Trust name" required defaultValue={settings.trust_name} error={e.trust_name} maxLength={120} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="short_name" label="Short name" required defaultValue={settings.short_name} error={e.short_name} maxLength={40} />
          <TextField name="tagline" label="Tagline" required defaultValue={settings.tagline} error={e.tagline} maxLength={80} />
        </div>
      </Section>
      <Section title="Contact">
        <TextField name="phone" label="Phone number" defaultValue={settings.phone} error={e.phone} maxLength={20} />
        <TextAreaField name="address" label="Registered office address" defaultValue={settings.address} error={e.address} rows={2} maxLength={300} />
        <TextField name="map_url" label="Google Maps link" defaultValue={settings.map_url} error={e.map_url} hint="Paste a share link from Google Maps (starts with https://)." />
      </Section>
      <Section title="Registration">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField name="registration_no" label="Registration number" defaultValue={settings.registration_no} error={e.registration_no} maxLength={60} />
          <TextField name="registrar" label="Registering office" defaultValue={settings.registrar} error={e.registrar} maxLength={120} />
          <TextField name="founded_on" label="Founded on" type="date" defaultValue={settings.founded_on} error={e.founded_on} />
          <TextField name="registration_date" label="Registered on" type="date" defaultValue={settings.registration_date} error={e.registration_date} />
        </div>
      </Section>
      <Section title="Footer & search engines">
        <TextAreaField name="footer_note" label="Footer description" defaultValue={settings.footer_note} error={e.footer_note} rows={2} maxLength={300} />
        <TextAreaField name="seo_description" label="Search engine description" defaultValue={settings.seo_description} error={e.seo_description} rows={3} maxLength={300} hint="Shown by Google under the site name. About 150 characters is ideal." />
      </Section>
      <SubmitButton />
    </form>
  );
}

export function DonationForm({ settings }: { settings: SiteSettingsRow }) {
  const [state, action] = useActionState(saveDonation, IDLE_RESULT);
  const e = state.errors ?? {};
  return (
    <form action={action} className="space-y-6">
      <StatusBanner state={state} />
      <Section title="UPI">
        <div className="grid gap-6 md:grid-cols-[1fr_240px]">
          <div className="space-y-5">
            <TextField name="upi_id" label="UPI ID" defaultValue={settings.upi_id} error={e.upi_id} maxLength={80} placeholder="name@bank" />
            <TextField name="upi_payee_name" label="Payee name (optional)" defaultValue={settings.upi_payee_name} error={e.upi_payee_name} maxLength={120} hint="The name donors see in their UPI app when paying, so they know the payment is going to the right place." />
          </div>
          <ImageField
            name="upi_qr_path"
            label="UPI QR code"
            folder="site"
            keepOriginal
            initialPath={settings.upi_qr_path}
            previewClass="aspect-square w-full object-contain bg-white"
            hint="Upload the QR image from your UPI app. It is shown on the Donate page exactly as uploaded."
          />
        </div>
      </Section>
      <Section title="Donation page text">
        <TextAreaField name="donation_message" label="Appeal" defaultValue={settings.donation_message} error={e.donation_message} rows={3} maxLength={600} />
        <TextAreaField name="donation_instructions" label="Instructions" defaultValue={settings.donation_instructions} error={e.donation_instructions} rows={4} maxLength={1500} />
        <TextAreaField
          name="bank_details"
          label="Bank transfer details (optional)"
          defaultValue={settings.bank_details}
          error={e.bank_details}
          rows={5}
          maxLength={800}
          hint="Shown on the Donate page only if filled in. Enter exactly as on the bank records (account name, number, IFSC, branch)."
        />
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs text-amber-900">
          Do not mention tax exemptions (such as 80G) unless the Trust holds the registration certificate.
        </p>
      </Section>
      <SubmitButton />
    </form>
  );
}
