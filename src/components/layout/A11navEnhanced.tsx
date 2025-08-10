"use client";
import React, { useEffect, useRef, useState } from "react";
import { Type, Contrast, Layout } from "lucide-react";
import { SystemThemeToggle } from "~/components/ui/SystemThemeToggle";
import { A11yButton } from "~/components/ui/A11yButton";

interface A11navEnhancedProps {
  isCompact?: boolean;
}

type FontSize = "normal" | "large" | "xlarge";
type ContrastMode = "normal" | "high";
type HeaderVariant = "modern" | "classic";

export default function A11navEnhanced({
  isCompact = false,
}: A11navEnhancedProps) {
  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>("normal");
  const [contrast, setContrast] = useState<ContrastMode>("normal");
  const [headerVariant, setHeaderVariant] = useState<HeaderVariant>("modern");

  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    root.classList.remove("high-contrast");
    if (contrast === "high") root.classList.add("high-contrast");
    root.setAttribute("data-contrast", contrast);
    localStorage.setItem("contrast", contrast);
  }, [contrast]);

  // Apply header variant
  useEffect(() => {
    localStorage.setItem("header-variant", headerVariant);
    // Dispatch auf window, damit globale Listener es zuverlässig empfangen
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent<HeaderVariant>("header-variant-change", {
          detail: headerVariant,
        }),
      );
    }
  }, [headerVariant]);

  // Close on outside click and escape key
  useEffect(() => {
    const onDown = (ev: MouseEvent) => {
      const target = ev.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Hover handlers wie bei den Menü-Reitern
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  const toggleOpen = () => setOpen((v) => !v);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <A11yButton ref={btnRef} onClick={toggleOpen} isExpanded={open} />

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="A11y & Meta Einstellungen"
          className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-border/50 bg-popover/95 p-3 text-popover-foreground shadow-xl backdrop-blur-2xl transition-all duration-200 ease-out dark:bg-popover/90"
        >
          {/* Schriftgröße */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Type className="h-4 w-4" />
              Schriftgröße
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: "normal", label: "Normal" },
                  { key: "large", label: "Groß" },
                  { key: "xlarge", label: "XL" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFontSize(opt.key)}
                  className={`rounded-md px-2 py-1.5 text-sm transition-colors ${
                    fontSize === opt.key
                      ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                      : "hover:bg-accent"
                  }`}
                  aria-pressed={fontSize === opt.key}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              Theme
            </div>
            <div className="flex justify-center">
              <SystemThemeToggle />
            </div>
          </div>

          {/* Kontrast */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Contrast className="h-4 w-4" />
              Kontrast
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setContrast("normal")}
                className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
                  contrast === "normal"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={contrast === "normal"}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setContrast("high")}
                className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
                  contrast === "high"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={contrast === "high"}
              >
                Hoch
              </button>
            </div>
          </div>

          {/* Header Variante */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Layout className="h-4 w-4" />
              Header
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHeaderVariant("modern")}
                className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
                  headerVariant === "modern"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={headerVariant === "modern"}
              >
                Modern
              </button>
              <button
                type="button"
                onClick={() => setHeaderVariant("classic")}
                className={`rounded-lg px-2 py-1.5 text-sm transition-colors ${
                  headerVariant === "classic"
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "hover:bg-accent"
                }`}
                aria-pressed={headerVariant === "classic"}
              >
                Klassisch
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a
              href="/leichte-sprache"
              className="rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-center text-sm transition-colors hover:bg-accent"
            >
              Leichte Sprache
            </a>
            <a
              href="/gebaerdensprache"
              className="rounded-lg border border-input/50 bg-background/50 px-3 py-2 text-center text-sm transition-colors hover:bg-accent"
            >
              Gebärdensprache
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
