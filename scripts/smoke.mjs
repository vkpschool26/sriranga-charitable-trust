// Smoke test against a running server: `npm run build && npm start`, then
// `npm run smoke` (or BASE_URL=https://preview-url npm run smoke).
const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const pages = ["/", "/about-us/", "/what-we-do/", "/gallery/", "/get-involved/", "/donate/", "/contact/", "/privacy-policy/"];
const redirects = [
  ["/join-sriranga-charitable-trust/", "/get-involved/"],
  ["/donate-2/", "/donate/"],
  ["/hello-world/", "/"],
  ["/hello-world-2/", "/"],
  ["/category/uncategorized/", "/"],
  ["/2026/05/", "/"],
  ["/feed/", "/"],
];

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`  ✗ ${msg}`);
};
const pass = (msg) => console.log(`  ✓ ${msg}`);
const check = (ok, okMsg, failMsg) => {
  if (ok) pass(okMsg);
  else fail(failMsg);
};

console.log(`Smoke testing ${BASE}\n\nPages`);
for (const path of pages) {
  const res = await fetch(BASE + path, { redirect: "manual" });
  const html = await res.text();
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  const hasCanonical = /<link rel="canonical"/.test(html);
  const hasDescription = /<meta name="description"/.test(html);
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (res.status !== 200) fail(`${path} → ${res.status}`);
  else if (!title || !hasDescription) fail(`${path} missing title/description`);
  else if (h1 !== 1) fail(`${path} has ${h1} <h1> elements`);
  else if (path !== "/" && !hasCanonical) fail(`${path} missing canonical link`);
  else pass(`${path} 200 · "${title}"`);
}

console.log("\nWordPress redirects");
for (const [from, to] of redirects) {
  const res = await fetch(BASE + from, { redirect: "manual" });
  const location = res.headers.get("location") || "";
  const target = location.replace(BASE, "").replace(/^https?:\/\/[^/]+/, "");
  if (![301, 308].includes(res.status) || target !== to) fail(`${from} → ${res.status} ${location}`);
  else pass(`${from} → ${res.status} ${to}`);
}

console.log("\nOther");
{
  const res = await fetch(`${BASE}/does-not-exist/`);
  check(res.status === 404, "unknown page → 404", `unknown page → ${res.status}`);
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  check(/Disallow: \/admin\//.test(robots) && /Sitemap:/.test(robots), "robots.txt", "robots.txt content");
  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  check(pages.every((p) => sitemap.includes(`${p}</loc>`)), "sitemap.xml lists all pages", "sitemap.xml incomplete");
  const admin = await fetch(`${BASE}/admin/`, { redirect: "manual" });
  const adminLoc = admin.headers.get("location") || "";
  check([307, 308].includes(admin.status) && adminLoc.includes("/admin/login"), "/admin redirects to login when signed out", `/admin → ${admin.status} ${adminLoc}`);
  const home = await fetch(`${BASE}/`);
  const csp = home.headers.get("content-security-policy") || "";
  check(csp.includes("frame-ancestors 'none'") && home.headers.get("x-frame-options") === "DENY", "security headers", "security headers missing");
  const adminHeaders = await fetch(`${BASE}/admin/login/`);
  check((adminHeaders.headers.get("x-robots-tag") || "").includes("noindex"), "admin pages are noindex", "admin noindex header missing");
}

console.log(failures ? `\n${failures} check(s) failed.` : "\nAll smoke checks passed.");
process.exit(failures ? 1 : 0);
