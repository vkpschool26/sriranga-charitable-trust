import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getSettings } from "@/lib/data/public";

export default async function NotFound() {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader shortName={settings.short_name} trustName={settings.trust_name} tagline={settings.tagline} phone={settings.phone} />
      <main id="main-content" className="flex-1">
        <Container className="py-24 text-center sm:py-32">
          <p className="font-display text-7xl text-sky/40">404</p>
          <h1 className="font-display mt-6 text-4xl font-medium text-brand sm:text-5xl">This page could not be found.</h1>
          <p className="mx-auto mt-5 max-w-md leading-relaxed text-muted">
            The page may have moved when our website was renewed. Try one of these instead:
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/">Home</ButtonLink>
            <ButtonLink href="/about-us/" variant="outline">About us</ButtonLink>
            <ButtonLink href="/contact/" variant="outline">Contact</ButtonLink>
          </div>
        </Container>
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
