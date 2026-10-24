import { ArcCorner } from "@/components/brand/ArcArt";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/SectionHeading";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  intro?: string | null;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, intro, children }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-white">
      <ArcCorner className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 sm:h-80 sm:w-80" />
      <Container className="relative py-16 sm:py-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="font-display mt-5 max-w-3xl text-[2.6rem] leading-[1.05] font-medium text-brand sm:text-6xl">
          {title}
        </h1>
        {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">{intro}</p>}
        {children}
      </Container>
    </header>
  );
}
