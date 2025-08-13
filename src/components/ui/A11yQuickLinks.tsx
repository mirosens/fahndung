"use client";
import React from "react";
import { ExternalLink } from "lucide-react";

interface A11yQuickLinksProps {
  variant?: "mobile" | "desktop";
}

export function A11yQuickLinks({ variant = "desktop" }: A11yQuickLinksProps) {
  const isMobile = variant === "mobile";

  const linkClass = isMobile
    ? "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent focus:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 touch-manipulation sm:px-4 sm:py-3 sm:text-base"
    : "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium transition-colors hover:bg-accent";

  return (
    <div className={`space-y-2 ${isMobile ? "sm:space-y-3" : ""}`}>
      <a
        href="/leichte-sprache"
        className={linkClass}
        onClick={(e) => {
          console.log("Leichte Sprache clicked");
          e.stopPropagation();
        }}
      >
        <span>Leichte Sprache</span>
        <ExternalLink className="h-4 w-4 flex-shrink-0" />
      </a>
      <a
        href="/gebaerdensprache"
        className={linkClass}
        onClick={(e) => {
          console.log("Gebärdensprache clicked");
          e.stopPropagation();
        }}
      >
        <span>Gebärdensprache</span>
        <ExternalLink className="h-4 w-4 flex-shrink-0" />
      </a>
    </div>
  );
}
