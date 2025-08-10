import { useEffect, useRef } from "react";

/**
 * Hook für scroll-basierte CSS-Klassen ohne Re-Renders
 * Verwendet DOM-Manipulation für optimale Performance
 */
export function useScrollDetection() {
  const headerRef = useRef<HTMLElement | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const header = headerRef.current;
    const spacer = spacerRef.current;
    const search = searchRef.current;

    if (!header) return;

    let ticking = false;

    const updateScrollClass = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 50;

          // DOM-Manipulation statt State-Updates für bessere Performance
          if (isScrolled) {
            header.classList.add("scrolled");
            spacer?.classList.add("scrolled");
            search?.classList.add("scrolled");
          } else {
            header.classList.remove("scrolled");
            spacer?.classList.remove("scrolled");
            search?.classList.remove("scrolled");
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Passive Event Listener für bessere Performance
    window.addEventListener("scroll", updateScrollClass, { passive: true });

    // Initial check
    updateScrollClass();

    return () => {
      window.removeEventListener("scroll", updateScrollClass);
    };
  }, []);

  return { headerRef, spacerRef, searchRef };
}
