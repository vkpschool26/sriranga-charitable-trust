import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { getSettings } from "@/lib/data/public";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader shortName={settings.short_name} trustName={settings.trust_name} tagline={settings.tagline} phone={settings.phone} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <RevealOnScroll />
    </>
  );
}
