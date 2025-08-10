"use client";

import React from "react";
import Image from "next/image";
import type { UIInvestigationData } from "~/lib/types/investigation.types";

interface FahndungTabProps {
  data: UIInvestigationData;
}

export default function FahndungTab({ data }: FahndungTabProps) {
  // Verwende das originale Hauptbild der Fahndung
  const mainImageUrl =
    data.step3?.mainImage ??
    "https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800";

  return (
    <div className="w-full">
      {/* Hero Section - nur Bild, keine Informationen */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden rounded-lg bg-muted dark:bg-muted">
        {/* Hauptbild - Originales Fahndungsbild */}
        <Image
          src={mainImageUrl}
          alt="Fahndungsbild"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          onError={(e) => {
            // Fallback zu einem lokalen Platzhalterbild
            const target = e.target as HTMLImageElement;
            target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%23374151'/%3E%3Ctext x='400' y='300' font-family='Arial' font-size='48' fill='white' text-anchor='middle' dominant-baseline='middle'%3EFahndungsbild%3C/text%3E%3C/svg%3E";
          }}
        />
      </div>
    </div>
  );
}
