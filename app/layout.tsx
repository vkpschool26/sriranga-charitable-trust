import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { getSettings } from "@/lib/data/public";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const title = `${settings.trust_name} — ${settings.tagline}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${settings.trust_name}` },
    description: settings.seo_description ?? undefined,
    applicationName: settings.trust_name,
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: settings.trust_name,
      title,
      description: settings.seo_description ?? undefined,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#123d7a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables scroll-reveal styles only when JavaScript is running. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body className="min-h-dvh flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
