"use client";
import React from "react";
import { Type } from "lucide-react";

type FontSize = "normal" | "large" | "xlarge";

interface A11yFontSizeControlProps {
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  variant?: "mobile" | "desktop";
}

export function A11yFontSizeControl({
  fontSize,
  onFontSizeChange,
  variant = "desktop",
}: A11yFontSizeControlProps) {
  const isMobile = variant === "mobile";

  const containerClass = isMobile ? "space-y-2" : "space-y-1";
  const labelClass = isMobile
    ? "flex items-center gap-2 text-xs font-semibold text-muted-foreground sm:text-sm"
    : "flex items-center gap-2 text-xs font-semibold text-muted-foreground";
  const gridClass = isMobile
    ? "grid grid-cols-3 gap-1.5 sm:gap-2"
    : "grid grid-cols-3 gap-1";
  const buttonClass = isMobile
    ? "min-h-[44px] rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 touch-manipulation sm:min-h-[48px] sm:px-3 sm:py-2.5 sm:text-sm"
    : "rounded px-2 py-1 text-xs transition-colors";

  const getButtonClass = (size: FontSize) => {
    const baseClass = buttonClass;
    const isActive = fontSize === size;
    return `${baseClass} ${
      isActive
        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
        : "hover:bg-accent"
    }`;
  };

  const handleClick = (size: FontSize) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onFontSizeChange(size);
  };

  return (
    <div className={containerClass}>
      <div className={labelClass}>
        <Type className={isMobile ? "h-3 w-3 sm:h-4" : "h-3 w-3"} />
        Schriftgröße
      </div>
      <div className={gridClass}>
        <button
          type="button"
          onClick={handleClick("normal")}
          className={getButtonClass("normal")}
        >
          Normal
        </button>
        <button
          type="button"
          onClick={handleClick("large")}
          className={getButtonClass("large")}
        >
          Groß
        </button>
        <button
          type="button"
          onClick={handleClick("xlarge")}
          className={getButtonClass("xlarge")}
        >
          XL
        </button>
      </div>
    </div>
  );
}
