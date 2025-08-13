import { useState, useEffect } from "react";

interface ResponsiveState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallMobile: boolean; // Neue Kategorie für sehr kleine Geräte
  isLargeMobile: boolean; // Neue Kategorie für größere Mobile
  screenSize: "small-mobile" | "mobile" | "tablet" | "desktop";
  width: number;
  height: number;
}

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>(() => {
    // SSR-safe initial state
    if (typeof window === "undefined") {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isSmallMobile: false,
        isLargeMobile: false,
        screenSize: "desktop",
        width: 1024,
        height: 768,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Optimierte Breakpoints für bessere Mobile-Unterstützung
    const isSmallMobile = width < 375; // iPhone SE, kleine Android
    const isLargeMobile = width >= 375 && width < 768; // Größere Mobile
    const isMobile = width < 768; // Alle Mobile
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;

    let screenSize: ResponsiveState["screenSize"];
    if (isSmallMobile) screenSize = "small-mobile";
    else if (isLargeMobile) screenSize = "mobile";
    else if (isTablet) screenSize = "tablet";
    else screenSize = "desktop";

    return {
      isMobile,
      isTablet,
      isDesktop,
      isSmallMobile,
      isLargeMobile,
      screenSize,
      width,
      height,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Optimierte Breakpoints für bessere Mobile-Unterstützung
      const isSmallMobile = width < 375; // iPhone SE, kleine Android
      const isLargeMobile = width >= 375 && width < 768; // Größere Mobile
      const isMobile = width < 768; // Alle Mobile
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;

      let screenSize: ResponsiveState["screenSize"];
      if (isSmallMobile) screenSize = "small-mobile";
      else if (isLargeMobile) screenSize = "mobile";
      else if (isTablet) screenSize = "tablet";
      else screenSize = "desktop";

      setState({
        isMobile,
        isTablet,
        isDesktop,
        isSmallMobile,
        isLargeMobile,
        screenSize,
        width,
        height,
      });
    };

    // Debounce resize events für bessere Performance
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100); // Reduziert von 150ms auf 100ms
    };

    window.addEventListener("resize", debouncedResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
};
