import mark from "@/public/brand/src-mark.png";

// Hero artwork: the Trust's own logo mark, framed by a soft circle, a dotted
// ring and two small leaves ("Grow Together"). Used instead of stock photos.
export function HeroArcArt({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-square ${className}`}>
      <svg viewBox="0 0 520 520" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <defs>
          <radialGradient id="glow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#edf3fb" />
          </radialGradient>
        </defs>
        <circle cx="260" cy="260" r="238" fill="url(#glow)" />
        <circle cx="260" cy="260" r="238" fill="none" stroke="#dde5ee" strokeWidth="1.5" />
        <circle
          cx="260"
          cy="260"
          r="196"
          fill="none"
          stroke="#3189d5"
          strokeOpacity="0.25"
          strokeWidth="1.5"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />
        <path d="M432 112 c 20 -6 34 4 38 22 c -20 6 -34 -4 -38 -22 Z" fill="#8bcb55" opacity="0.8" />
        <path d="M70 404 c 18 -10 34 -4 42 12 c -18 10 -34 4 -42 -12 Z" fill="#3189d5" opacity="0.55" />
      </svg>
      {/* The real logo mark, revealed by an animated mask that traces each
          figure's curve so the logo appears to draw itself in. */}
      <div className="float-soft absolute inset-0 grid place-items-center">
        <svg
          viewBox={`0 0 ${mark.width} ${mark.height}`}
          role="img"
          aria-label="Sri Ranga Charitable Trust logo: two figures, one blue and one green, forming a heart"
          className="h-auto w-[62%] overflow-visible"
        >
          <defs>
            <mask id="hero-mark-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width={mark.width} height={mark.height}>
              {/* blue figure: from the heart's centre, round the left lobe, down to the point */}
              <path
                d="M215 150 C 160 70, 30 85, 30 175 C 30 245, 130 285, 235 312"
                pathLength={1}
                className="mask-draw"
                fill="none"
                stroke="#fff"
                strokeWidth="150"
                strokeLinecap="round"
              />
              {/* green figure and the clasped hand */}
              <path
                d="M190 175 C 230 85, 385 75, 382 170 C 380 245, 300 285, 140 290"
                pathLength={1}
                className="mask-draw"
                style={{ ["--draw-delay" as string]: "300ms" } as React.CSSProperties}
                fill="none"
                stroke="#fff"
                strokeWidth="150"
                strokeLinecap="round"
              />
              {/* heads */}
              <circle cx="100" cy="42" r="46" fill="#fff" className="mask-pop" />
              <circle cx="302" cy="42" r="46" fill="#fff" className="mask-pop" style={{ ["--draw-delay" as string]: "250ms" } as React.CSSProperties} />
              {/* finally make sure every pixel of the logo is shown */}
              <rect width={mark.width} height={mark.height} fill="#fff" className="mask-settle" />
            </mask>
          </defs>
          <image href={mark.src} width={mark.width} height={mark.height} mask="url(#hero-mark-reveal)" />
        </svg>
      </div>
    </div>
  );
}

// Thin decorative arc used to soften section edges.
export function ArcDivider({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block h-10 w-full sm:h-16 ${flip ? "rotate-180" : ""} ${className}`}
    >
      <path d="M0 80 C 360 0, 1080 0, 1440 80 Z" fill="currentColor" />
    </svg>
  );
}

// Corner ornament for page headers and panels.
export function ArcCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <path d="M20 180 C 20 90, 90 20, 180 20" fill="none" stroke="#3189d5" strokeWidth="14" strokeLinecap="round" opacity="0.18" />
      <path d="M60 180 C 60 112, 112 60, 180 60" fill="none" stroke="#8bcb55" strokeWidth="14" strokeLinecap="round" opacity="0.3" />
      <circle cx="180" cy="20" r="9" fill="#3189d5" opacity="0.35" />
      <circle cx="180" cy="60" r="9" fill="#8bcb55" opacity="0.5" />
    </svg>
  );
}
