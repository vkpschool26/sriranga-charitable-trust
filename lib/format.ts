export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  // Date-only strings are parsed as UTC midnight; format in UTC to avoid
  // off-by-one-day shifts.
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00Z` : iso);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function paragraphs(text: string | null | undefined): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function initials(name: string): string {
  const cleaned = name.replace(/^(sri|smt|shri|dr|mr|mrs|ms)\.?\s+/i, "");
  const parts = cleaned.split(/[\s.]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  // Indian names often put initials first ("M. K. Marudaiah"): prefer the
  // main name's first letter, then the first initial.
  const main = parts.reduce((a, b) => (b.length > a.length ? b : a));
  const first = parts[0] === main ? parts[1] : parts[0];
  return (main[0] + (first ? first[0] : "")).toUpperCase();
}

export function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return `tel:${digits.startsWith("+") ? digits : `+91${digits}`}`;
}

export function displayPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : phone;
}
