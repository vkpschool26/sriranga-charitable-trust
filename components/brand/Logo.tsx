import Image from "next/image";
import Link from "next/link";
import mark from "@/public/brand/src-mark.png";

interface LogoProps {
  shortName: string;
  trustName: string;
  tagline?: string;
  // "always" shows the tagline at every width; "desktop" hides it on small
  // screens where the header has no room for a third line.
  showTagline?: "always" | "desktop";
  tone?: "light" | "dark";
  size?: "md" | "lg";
}

// The heart mark is the supplied logo artwork; the wordmark is set as live
// text so it stays crisp and readable at every size.
export function Logo({ shortName, trustName, tagline, showTagline = "desktop", tone = "light", size = "md" }: LogoProps) {
  const markSize = size === "lg" ? 56 : 46;
  return (
    <Link
      href="/"
      className="group inline-flex items-center gap-3 rounded-lg"
      aria-label={`${trustName} — home`}
    >
      <span
        className={
          tone === "dark"
            ? "grid place-items-center rounded-2xl bg-white p-1.5 shadow-sm"
            : "grid place-items-center"
        }
      >
        <Image
          src={mark}
          alt=""
          width={markSize}
          height={Math.round(markSize * 0.79)}
          priority
          className="h-auto"
          style={{ width: markSize }}
        />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-display text-[1.35rem] font-semibold uppercase tracking-[0.02em] ${
            tone === "dark" ? "text-white" : "text-brand"
          }`}
        >
          {shortName}
        </span>
        <span
          className={`mt-1 text-[0.72rem] font-medium tracking-wide ${
            tone === "dark" ? "text-white/70" : "text-muted"
          }`}
        >
          {trustName}
        </span>
        {tagline && (
          <span
            className={`mt-1.5 border-t pt-1 text-[0.72rem] font-medium italic tracking-wide ${
              tone === "dark" ? "border-white/20 text-leaf" : "border-line text-[#2a6fb3]"
            } ${showTagline === "desktop" ? "hidden sm:block" : "block"}`}
          >
            {tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
