interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  intro?: string | null;
  align?: "left" | "center";
  tone?: "light" | "dark";
  as?: "h1" | "h2";
}

export function Eyebrow({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" }) {
  return (
    <p
      className={`inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] ${
        tone === "dark" ? "text-leaf" : "text-leaf-deep"
      }`}
    >
      <span aria-hidden="true" className="flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-sky" />
        <span className="h-1.5 w-1.5 rounded-full bg-leaf" />
      </span>
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "light",
  as: Tag = "h2",
}: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <Eyebrow tone={tone}>{eyebrow}</Eyebrow>}
      <Tag
        className={`font-display mt-4 text-[2rem] leading-[1.1] font-medium sm:text-[2.6rem] ${
          tone === "dark" ? "text-white" : "text-brand"
        }`}
      >
        {title}
      </Tag>
      {intro && (
        <p className={`mt-5 text-lg leading-relaxed ${tone === "dark" ? "text-white/75" : "text-muted"}`}>
          {intro}
        </p>
      )}
    </div>
  );
}
