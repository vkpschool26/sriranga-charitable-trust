import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/public/PageHeader";
import { getSettings } from "@/lib/data/public";
import { displayPhone } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Sri Ranga Charitable Trust collects, uses and protects personal information shared through this website.",
  alternates: { canonical: "/privacy-policy/" },
};

const LAST_UPDATED = "24 October 2026";

export default async function PrivacyPage() {
  const settings = await getSettings();
  const phone = settings.phone ? displayPhone(settings.phone) : null;

  const sections: { title: string; body: React.ReactNode }[] = [
    {
      title: "Who we are",
      body: (
        <p>
          This website is operated by {settings.trust_name} (&ldquo;{settings.short_name}&rdquo;, &ldquo;the Trust&rdquo;,
          &ldquo;we&rdquo;), a registered charitable trust with its office at {settings.address}.
        </p>
      ),
    },
    {
      title: "What we collect",
      body: (
        <>
          <p>We collect personal information only when you choose to send it to us through the forms on this website:</p>
          <ul>
            <li>
              <strong>Get Involved form:</strong> your name, email address, phone number, area of interest and message.
            </li>
            <li>
              <strong>Contact form:</strong> your name, email address, phone number (optional), subject and message.
            </li>
          </ul>
          <p>
            To protect the forms from spam and abuse, we also store a one-way, scrambled code derived from your
            internet (IP) address. It cannot be turned back into your IP address and is used only to limit repeated
            submissions.
          </p>
        </>
      ),
    },
    {
      title: "How we use it",
      body: (
        <p>
          We use your information only to read and respond to your enquiry — for example, to discuss volunteering,
          partnership or donations. We do not use it for marketing, we do not sell it, and we do not share it with
          anyone outside the Trust unless the law requires us to.
        </p>
      ),
    },
    {
      title: "Who can see it",
      body: (
        <p>
          Submissions are stored in a secure cloud database and can be viewed only by authorised administrators of the
          Trust, who sign in with individual accounts. Our website and database providers process this data on our
          behalf solely to run the website.
        </p>
      ),
    },
    {
      title: "How long we keep it",
      body: (
        <p>
          We keep enquiries only for as long as needed to respond and to keep a reasonable record of our
          correspondence, and we delete them when they are no longer needed. You can ask us to delete your
          information at any time.
        </p>
      ),
    },
    {
      title: "Cookies",
      body: (
        <p>
          This website does not use advertising or analytics cookies, and it does not track you. The only cookies used
          are those strictly needed to keep Trust administrators signed in to the private admin area.
        </p>
      ),
    },
    {
      title: "Your rights",
      body: (
        <p>
          In line with India&apos;s Digital Personal Data Protection Act, 2023, you may ask us to access, correct or
          delete the personal information you have shared with us, or withdraw your consent to our using it.
          {phone ? ` To do so, please call us on ${phone} or write to us at our registered office.` : " To do so, please write to us at our registered office."}
        </p>
      ),
    },
    {
      title: "Changes to this policy",
      body: <p>We may update this policy from time to time. The date below shows when it was last revised.</p>,
    },
  ];

  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy Policy" intro={`Last updated ${LAST_UPDATED}.`} />
      <Container className="py-16 sm:py-24">
        <div className="max-w-3xl space-y-12">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="font-display text-2xl font-medium text-brand">{s.title}</h2>
              <div className="mt-4 space-y-4 leading-relaxed text-ink/80 [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-6">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}
