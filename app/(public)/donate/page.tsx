import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";
import { PageHeader } from "@/components/public/PageHeader";
import { CopyButton } from "@/components/public/CopyButton";
import { getSettings } from "@/lib/data/public";
import { displayPhone, paragraphs, telHref } from "@/lib/format";
import { publicImageUrl } from "@/lib/storage";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Donate",
  description: "Support Sri Ranga Charitable Trust by UPI. Every contribution helps the Trust begin and sustain its work for people in need.",
  alternates: { canonical: "/donate/" },
};

export default async function DonatePage() {
  const settings = await getSettings();
  const qr = publicImageUrl(settings.upi_qr_path);

  return (
    <>
      <PageHeader eyebrow="Donate" title="Help us grow together." intro={settings.donation_message} />

      <section className="py-20 sm:py-28">
        <Container className="grid items-start gap-8 lg:grid-cols-12">
          {/* UPI card */}
          <div className="relative overflow-hidden rounded-[1.75rem] bg-brand p-8 text-white sm:p-12 lg:col-span-7">
            <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -right-20 -top-20 h-72 w-72 opacity-15">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#8bcb55" strokeWidth="16" />
              <circle cx="100" cy="100" r="50" fill="none" stroke="#3189d5" strokeWidth="16" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">Pay by UPI</p>
            <div className="relative mt-8 grid items-center gap-8 sm:grid-cols-[auto_1fr]">
              {qr ? (
                <div className="w-fit rounded-2xl bg-white p-3 shadow-lg">
                  <Image src={qr} alt={`UPI QR code for ${settings.upi_id ?? settings.trust_name}`} width={220} height={220} className="h-auto w-[220px]" />
                </div>
              ) : null}
              <div>
                {settings.upi_id && (
                  <>
                    <p className="text-sm text-white/70">UPI ID</p>
                    <p className="font-display mt-1 text-3xl break-all sm:text-4xl">{settings.upi_id}</p>
                    <div className="mt-5 rounded-full bg-white w-fit">
                      <CopyButton value={settings.upi_id} label="Copy UPI ID" />
                    </div>
                  </>
                )}
                {settings.upi_payee_name && (
                  <p className="mt-6 text-sm text-white/70">
                    Payee name: <span className="font-semibold text-white">{settings.upi_payee_name}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* How to give */}
          <div className="rounded-[1.75rem] border border-line bg-white p-8 sm:p-10 lg:col-span-5">
            <Eyebrow>How to give</Eyebrow>
            <ol className="mt-6 space-y-5">
              {[
                "Open any UPI app — Google Pay, PhonePe, Paytm or your bank's app.",
                qr ? "Scan the QR code, or enter the UPI ID shown." : "Enter the UPI ID shown.",
                "Enter the amount you wish to give and complete the payment.",
              ].map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="font-display grid h-8 w-8 shrink-0 place-items-center rounded-full bg-leaf-50 text-sm text-leaf-deep">
                    {i + 1}
                  </span>
                  <span className="pt-1 leading-relaxed text-ink/80">{step}</span>
                </li>
              ))}
            </ol>
            {settings.donation_instructions && (
              <div className="prose-trust mt-8 border-t border-line pt-6 text-sm leading-relaxed text-muted">
                {paragraphs(settings.donation_instructions).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            )}
          </div>

          {settings.bank_details && (
            <div className="rounded-[1.75rem] border border-line bg-white p-8 sm:p-10 lg:col-span-7">
              <Eyebrow>Bank transfer</Eyebrow>
              <p className="mt-5 whitespace-pre-line leading-relaxed text-ink/80">{settings.bank_details}</p>
            </div>
          )}

          <div className={`rounded-[1.75rem] bg-leaf-50 p-8 sm:p-10 ${settings.bank_details ? "lg:col-span-5" : "lg:col-span-12"}`}>
            <h2 className="font-display text-2xl font-medium text-brand">Want to give in kind, or need help?</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-muted">
              The Trust also welcomes contributions in kind — such as books, medicines, food or materials. Call us or send
              an enquiry and we&apos;ll be glad to help.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {settings.phone && (
                <ButtonLink href={telHref(settings.phone)} variant="primary">
                  Call {displayPhone(settings.phone)}
                </ButtonLink>
              )}
              <ButtonLink href="/get-involved/" variant="outline">
                Send an enquiry
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
