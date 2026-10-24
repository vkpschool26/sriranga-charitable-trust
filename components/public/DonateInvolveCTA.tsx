import { ArrowIcon, ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function DonateInvolveCTA({ upiId }: { upiId: string | null }) {
  return (
    <section aria-labelledby="cta-heading" className="py-20 sm:py-28">
      <Container>
        <h2 id="cta-heading" className="sr-only">
          Support the Trust
        </h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div data-reveal className="relative overflow-hidden rounded-[1.75rem] bg-brand p-8 text-white sm:p-12">
            <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -bottom-16 -right-16 h-56 w-56 opacity-20">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#8bcb55" strokeWidth="18" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf">Give</p>
            <h3 className="font-display mt-4 text-3xl font-medium sm:text-4xl">Help us begin our work.</h3>
            <p className="mt-4 max-w-sm leading-relaxed text-white/75">
              Every contribution, in money or in kind, goes towards the Trust&apos;s charitable objectives.
            </p>
            {upiId && (
              <p className="mt-6 inline-flex rounded-full bg-white/10 px-4 py-2 font-mono text-sm tracking-wide">
                UPI: {upiId}
              </p>
            )}
            <div className="mt-8">
              <ButtonLink href="/donate/" variant="accent">
                Donate now <ArrowIcon />
              </ButtonLink>
            </div>
          </div>
          <div
            data-reveal
            style={{ ["--reveal-delay" as string]: "120ms" } as React.CSSProperties}
            className="relative overflow-hidden rounded-[1.75rem] bg-leaf-50 p-8 sm:p-12"
          >
            <svg aria-hidden="true" viewBox="0 0 200 200" className="absolute -bottom-16 -right-16 h-56 w-56 opacity-40">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#8bcb55" strokeWidth="18" />
            </svg>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-leaf-deep">Join</p>
            <h3 className="font-display mt-4 text-3xl font-medium text-brand sm:text-4xl">Lend a hand.</h3>
            <p className="mt-4 max-w-sm leading-relaxed text-muted">
              Volunteer your time, share your skills, or partner with us to reach more people.
            </p>
            <div className="mt-8">
              <ButtonLink href="/get-involved/" variant="primary">
                Get involved <ArrowIcon />
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
