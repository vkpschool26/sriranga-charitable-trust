export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://srirangacharitabletrust.org"
).replace(/\/+$/, "");

export const NAV_LINKS = [
  { href: "/about-us/", label: "About Us" },
  { href: "/what-we-do/", label: "Our Causes" },
  { href: "/gallery/", label: "Gallery & Activities" },
  { href: "/get-involved/", label: "Get Involved" },
  { href: "/contact/", label: "Contact" },
] as const;

// Public pages revalidate at most every 5 minutes; admin saves revalidate
// the affected pages immediately.
export const PUBLIC_REVALIDATE_SECONDS = 300;
