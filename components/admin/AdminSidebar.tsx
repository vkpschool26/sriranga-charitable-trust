"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/", label: "Dashboard", icon: "M4 5h7v6H4zM13 5h7v4h-7zM13 11h7v8h-7zM4 13h7v6H4z" },
  { href: "/admin/content/", label: "Home & About Content", icon: "M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" },
  { href: "/admin/trustees/", label: "Trustees", icon: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 19a5.5 5.5 0 0 1 11 0M16 11a2.5 2.5 0 1 0 0-5M17 14.5a4.5 4.5 0 0 1 3.5 4.5" },
  { href: "/admin/causes/", label: "Our Causes", icon: "M12 20s-7-4.4-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.6 12 20 12 20Z" },
  { href: "/admin/activities/", label: "Gallery & Activities", icon: "M4 6h16v12H4zM4 15l4.5-4.5L13 15l2.5-2.5L20 17M15.5 9.5h.01" },
  { href: "/admin/enquiries/", label: "Enquiries", icon: "M4 6h16v12H4zM4 7l8 6 8-6" },
  { href: "/admin/donation/", label: "Donation Settings", icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9h6M9 12h6M10.5 9c2.5 0 3 3 0 3H9l4.5 4.5" },
  { href: "/admin/settings/", label: "Website Settings", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" },
];

export function AdminSidebar({ newEnquiries }: { newEnquiries: number }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/admin/" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(href.replace(/\/$/, "")));

  return (
    <>
      <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white md:block">
        <nav aria-label="Admin" className="sticky top-14 flex flex-col gap-0.5 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active(item.href) ? "bg-brand-50 text-brand" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={item.icon} />
              </svg>
              <span className="flex-1">{item.label}</span>
              {item.href === "/admin/enquiries/" && newEnquiries > 0 && (
                <span className="rounded-full bg-leaf px-2 py-0.5 text-xs font-bold text-brand-900">{newEnquiries}</span>
              )}
            </Link>
          ))}
        </nav>
      </aside>
      <nav aria-label="Admin" className="overflow-x-auto border-b border-slate-200 bg-white md:hidden">
        <div className="flex min-w-max gap-1 px-3 py-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active(item.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                active(item.href) ? "bg-brand text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
              {item.href === "/admin/enquiries/" && newEnquiries > 0 && ` (${newEnquiries})`}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
