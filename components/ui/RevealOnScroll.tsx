"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Adds .is-visible to [data-reveal] elements as they enter the viewport.
export function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"));
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 }
    );
    items.forEach((el) => observer.observe(el));

    // Safety net: reveal anything left once the visitor reaches the bottom,
    // so content can never stay hidden.
    const revealAll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40) {
        items.forEach((el) => el.classList.add("is-visible"));
        window.removeEventListener("scroll", revealAll);
      }
    };
    window.addEventListener("scroll", revealAll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", revealAll);
    };
  }, [pathname]);

  return null;
}
