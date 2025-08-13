"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SystemThemeToggle } from "~/components/ui/SystemThemeToggle";
import { A11yButton } from "~/components/ui/A11yButton";
import { A11yQuickLinks } from "~/components/ui/A11yQuickLinks";
import { A11yFontSizeControl } from "~/components/ui/A11yFontSizeControl";
import { A11yContrastControl } from "~/components/ui/A11yContrastControl";
import { A11yHeaderControl } from "~/components/ui/A11yHeaderControl";
import { useSwipeToDismiss } from "~/hooks/useTouchGestures";

type FontSize = "normal" | "large" | "xlarge";
type ContrastMode = "normal" | "high" | "inverted";
type HeaderVariant = "modern" | "classic";

export default function A11navEnhanced() {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [contrast, setContrast] = useState<ContrastMode>("normal");
  const [headerVariant, setHeaderVariant] = useState<HeaderVariant>("modern");

  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch-Gesten für Swipe-to-Dismiss
  const swipeToDismissHandlers = useSwipeToDismiss(() => setOpen(false), 80);

  // Init from localStorage
  useEffect(() => {
    try {
      const savedFontSize =
        (localStorage.getItem("font-size") as FontSize) ?? "normal";
      const savedContrast =
        (localStorage.getItem("contrast") as ContrastMode) ?? "normal";
      const savedHeaderVariant =
        (localStorage.getItem("header-variant") as HeaderVariant) ?? "modern";

      setFontSize(savedFontSize);
      setContrast(savedContrast);
      setHeaderVariant(savedHeaderVariant);
    } catch {
      // ignore
    }
  }, []);

  // Apply font size
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("text-base", "text-lg", "text-xl");
    if (fontSize === "normal") root.classList.add("text-base");
    if (fontSize === "large") root.classList.add("text-lg");
    if (fontSize === "xlarge") root.classList.add("text-xl");
    root.setAttribute("data-font-size", fontSize);
    localStorage.setItem("font-size", fontSize);
  }, [fontSize]);

  // Apply contrast
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("high-contrast", "invert");
    if (contrast === "high") {
      root.classList.add("high-contrast");
      root.style.filter = "contrast(1.2)";
    } else if (contrast === "inverted") {
      root.classList.add("invert");
      root.style.filter = "invert(1) hue-rotate(180deg)";
    } else {
      root.style.filter = "";
    }
    root.setAttribute("data-contrast", contrast);
    localStorage.setItem("contrast", contrast);
  }, [contrast]);

  // Apply header variant
  useEffect(() => {
    localStorage.setItem("header-variant", headerVariant);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent<HeaderVariant>("header-variant-change", {
          detail: headerVariant,
        }),
      );
    }
  }, [headerVariant]);

  // Close on outside click/touch, escape key, and scroll
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };

    const handleScroll = () => {
      setOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("scroll", handleScroll, { passive: true });
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const toggleOpen = () => {
    console.log("Toggle clicked, current open:", open);
    setOpen(!open);
  };

  const handleFontSizeChange = (size: FontSize) => {
    console.log("Font size changed to:", size);
    setFontSize(size);
  };

  const handleContrastChange = (mode: ContrastMode) => {
    console.log("Contrast changed to:", mode);
    setContrast(mode);
  };

  const handleHeaderChange = (variant: HeaderVariant) => {
    console.log("Header changed to:", variant);
    setHeaderVariant(variant);
  };

  // Moderne Pointer Events API für Touch/Mouse-Unified Handling
  const handleBackdropInteraction = (e: React.PointerEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  const handlePanelInteraction = (e: React.PointerEvent) => {
    // Verhindert Schließen beim Panel-Klick
    e.stopPropagation();
  };

  // Hover-Handler für Desktop mit Verzögerung
  const handleMouseEnter = () => {
    if (window.innerWidth >= 768) {
      // Nur auf Desktop
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      // Nur auf Desktop
      // Sofort schließen ohne Verzögerung
      setOpen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <A11yButton ref={btnRef} onClick={toggleOpen} isExpanded={open} />

      <AnimatePresence>
        {open && (
          <>
            {/* Mobile Overlay - optimiert mit Pointer Events und Framer Motion */}
            <motion.div
              className="fixed inset-0 z-[100] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Backdrop mit moderner Touch-Optimierung */}
              <motion.div
                className="absolute inset-0 touch-none select-none bg-black/20"
                onPointerDown={handleBackdropInteraction}
                data-backdrop="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />

              {/* Panel mit Framer Motion Gesten */}
              <div className="absolute inset-x-2 top-[80px] flex justify-center sm:inset-x-4">
                <motion.div
                  ref={menuRef}
                  className="w-full max-w-[320px] touch-auto overscroll-contain rounded-lg border border-neutral-200 bg-white p-3 text-neutral-900 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 sm:p-4"
                  data-panel="true"
                  {...swipeToDismissHandlers}
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{
                    duration: 0.15,
                    ease: "easeOut",
                  }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={0.1}
                  onDragEnd={(_, { offset, velocity }) => {
                    // Schließen bei schnellem Swipe nach unten
                    if (offset.y > 50 && velocity.y > 0.5) {
                      setOpen(false);
                    }
                  }}
                >
                  <div className="space-y-3 sm:space-y-4">
                    {/* Quick Links */}
                    <A11yQuickLinks variant="mobile" />

                    {/* Einstellungen */}
                    <div className="space-y-3 sm:space-y-4">
                      {/* Theme */}
                      <div className="flex justify-center">
                        <SystemThemeToggle />
                      </div>

                      {/* Schriftgröße */}
                      <A11yFontSizeControl
                        fontSize={fontSize}
                        onFontSizeChange={handleFontSizeChange}
                        variant="mobile"
                      />

                      {/* Kontrast */}
                      <A11yContrastControl
                        contrast={contrast}
                        onContrastChange={handleContrastChange}
                        variant="mobile"
                      />

                      {/* Header */}
                      <A11yHeaderControl
                        headerVariant={headerVariant}
                        onHeaderChange={handleHeaderChange}
                        variant="mobile"
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Desktop Dropdown - konsistent mit anderen Dropdowns */}
            <motion.div
              ref={menuRef}
              className="absolute right-0 z-50 mt-2 hidden w-72 overflow-hidden rounded-lg border bg-popover p-3 text-popover-foreground shadow-sm md:block"
              data-panel="true"
              onPointerDown={handlePanelInteraction}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{
                duration: 0.15,
                ease: "easeOut",
              }}
            >
              <div className="space-y-3">
                {/* Quick Links */}
                <A11yQuickLinks variant="desktop" />

                {/* Einstellungen */}
                <div className="space-y-3">
                  {/* Theme */}
                  <div className="flex justify-center">
                    <SystemThemeToggle />
                  </div>

                  {/* Schriftgröße */}
                  <A11yFontSizeControl
                    fontSize={fontSize}
                    onFontSizeChange={handleFontSizeChange}
                    variant="desktop"
                  />

                  {/* Kontrast */}
                  <A11yContrastControl
                    contrast={contrast}
                    onContrastChange={handleContrastChange}
                    variant="desktop"
                  />

                  {/* Header */}
                  <A11yHeaderControl
                    headerVariant={headerVariant}
                    onHeaderChange={handleHeaderChange}
                    variant="desktop"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
