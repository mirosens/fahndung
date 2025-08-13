"use client";
import React from "react";
import { Layout } from "lucide-react";

type HeaderVariant = "modern" | "classic";

interface A11yHeaderControlProps {
  headerVariant: HeaderVariant;
  onHeaderChange: (variant: HeaderVariant) => void;
  variant?: "mobile" | "desktop";
}

export function A11yHeaderControl({
  headerVariant,
  onHeaderChange,
  variant = "desktop",
}: A11yHeaderControlProps) {
  const isMobile = variant === "mobile";

  const containerClass = isMobile ? "space-y-2" : "space-y-1";
  const labelClass = isMobile
    ? "flex items-center gap-2 text-xs font-semibold text-muted-foreground sm:text-sm"
    : "flex items-center gap-2 text-xs font-semibold text-muted-foreground";
  const gridClass = isMobile
    ? "grid grid-cols-2 gap-1.5 sm:gap-2"
    : "grid grid-cols-2 gap-1";
  const buttonClass = isMobile
    ? "min-h-[44px] rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 touch-manipulation sm:min-h-[48px] sm:px-3 sm:py-2.5 sm:text-sm"
    : "rounded px-2 py-1 text-xs transition-colors";

  const getButtonClass = (variant: HeaderVariant) => {
    const baseClass = buttonClass;
    const isActive = headerVariant === variant;
    return `${baseClass} ${
      isActive
        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
        : "hover:bg-accent"
    }`;
  };

  const handleClick = (variant: HeaderVariant) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onHeaderChange(variant);
  };

  return (
    <div className={containerClass}>
      <div className={labelClass}>
        <Layout className={isMobile ? "h-3 w-3 sm:h-4" : "h-3 w-3"} />
        Header
      </div>
      <div className={gridClass}>
        <button
          type="button"
          onClick={handleClick("modern")}
          className={getButtonClass("modern")}
        >
          Modern
        </button>
        <button
          type="button"
          onClick={handleClick("classic")}
          className={getButtonClass("classic")}
        >
          Klassisch
        </button>
      </div>
    </div>
  );
}
