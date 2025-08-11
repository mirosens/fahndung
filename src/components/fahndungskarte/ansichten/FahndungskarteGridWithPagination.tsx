"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ModernPagination } from "~/components/pagination/ModernPagination";

// Dynamischer Import der Fahndungskarte mit SSR deaktiviert
const Fahndungskarte = dynamic(
  () =>
    import("../Fahndungskarte").then((mod) => ({
      default: mod.default,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-64 rounded-lg bg-muted dark:bg-muted"></div>
      </div>
    ),
  },
);

// Konvertierung von Datenbank-Daten zu FahndungsData Format
const convertInvestigationToFahndungsData = (investigation: Fahndungskarte) => {
  // Fallback-Bilder für verschiedene Kategorien
  const getDefaultImage = (category: string) => {
    switch (category) {
      case "MISSING_PERSON":
        return "/images/placeholders/fotos/platzhalterbild.svg";
      case "WANTED_PERSON":
        return "/images/placeholders/fotos/platzhalterbild.svg";
      case "STOLEN_GOODS":
        return "/images/placeholders/fotos/platzhalterbild.svg";
      case "UNKNOWN_DEAD":
        return "/images/placeholders/fotos/platzhalterbild.svg";
      default:
        return "/images/placeholders/fotos/platzhalterbild.svg";
    }
  };

  // Hilfsfunktion um zu prüfen, ob ein echtes Bild vorhanden ist
  const hasRealImage = (
    images?: Array<{
      id: string;
      url: string;
      alt_text?: string;
      caption?: string;
    }>,
  ) => {
    return (
      images &&
      images.length > 0 &&
      images[0]?.url &&
      images[0].url.trim() !== ""
    );
  };

  return {
    step1: {
      title: investigation.title,
      category: investigation.category as
        | "WANTED_PERSON"
        | "MISSING_PERSON"
        | "UNKNOWN_DEAD"
        | "STOLEN_GOODS",
      caseNumber: investigation.case_number,
    },
    step2: {
      shortDescription:
        investigation.short_description ??
        (investigation.description
          ? investigation.description.substring(0, 100) + "..."
          : null) ??
        "",
      description: investigation.description ?? "",
      priority: investigation.priority,
      tags: investigation.tags ?? [],
      features: investigation.features ?? "",
    },
    step3: {
      mainImage: hasRealImage(investigation.images)
        ? investigation.images![0]!.url
        : getDefaultImage(investigation.category),
      additionalImages:
        investigation.images?.slice(1).map((img) => img.url) ?? [],
    },
    step4: {
      mainLocation: investigation.location
        ? { address: investigation.location }
        : undefined,
    },
    step5: {
      contactPerson:
        (investigation.contact_info?.["person"] as string) ?? "Polizei",
      contactPhone:
        (investigation.contact_info?.["phone"] as string) ?? "+49 711 8990-0",
      contactEmail: (investigation.contact_info?.["email"] as string) ?? "",
      department: investigation.station ?? "Polizeipräsidium",
      availableHours: "Mo-Fr 08:00-18:00, Sa-So Bereitschaftsdienst",
    },
  };
};

import { type Fahndungskarte, type ViewMode } from "~/types/fahndungskarte";

interface FahndungskarteGridWithPaginationProps {
  investigations: Fahndungskarte[];
  className?: string;
  viewMode?: ViewMode;
  onAction?: () => void;
  userRole?: string;
  userPermissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
    canPublish?: boolean;
  };
  itemsPerPage?: number;
  showPagination?: boolean;
  showItemsInfo?: boolean;
  showQuickJump?: boolean;
}

const FahndungskarteGridWithPagination: React.FC<
  FahndungskarteGridWithPaginationProps
> = ({
  investigations,
  className = "",
  viewMode = "grid-3",
  userPermissions,
  itemsPerPage = 6,
  showPagination = true,
  showItemsInfo = true,
  showQuickJump = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Paginierte Items berechnen
  const paginatedInvestigations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return investigations.slice(startIndex, endIndex);
  }, [investigations, currentPage, itemsPerPage]);

  // Grid-Klassen basierend auf viewMode
  const getGridClasses = () => {
    switch (viewMode) {
      case "grid-4":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case "grid-3":
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
    }
  };

  // Gap-Klassen basierend auf viewMode
  const getGapClasses = () => {
    switch (viewMode) {
      case "grid-4":
        return "gap-8"; // Einheitliche 32px Abstände für 4er-Grid
      case "grid-3":
      default:
        return "gap-x-8 gap-y-12"; // Mehr vertikaler Abstand für 3er-Grid
    }
  };

  // Padding-Klassen basierend auf viewMode
  const getPaddingClasses = () => {
    switch (viewMode) {
      case "grid-4":
        return "py-8"; // Nur vertikales Padding für 4er-Grid
      case "grid-3":
      default:
        return "py-8"; // Gleiches Padding wie 4er-Grid
    }
  };

  // Reset currentPage wenn sich die Gesamtanzahl der Items ändert
  React.useEffect(() => {
    const totalPages = Math.ceil(investigations.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [investigations.length, itemsPerPage, currentPage]);

  return (
    <div className={`w-full ${className}`}>
      {/* Grid Container */}
      <div
        className={`grid ${getGridClasses()} ${getGapClasses()} ${getPaddingClasses()} w-full`}
      >
        {paginatedInvestigations.map((investigation, index) => (
          <Fahndungskarte
            key={investigation.id}
            data={convertInvestigationToFahndungsData(investigation)}
            investigationId={investigation.id}
            userPermissions={userPermissions}
            imagePriority={index < 3} // Erste 3 Bilder als priorisiert markieren
          />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && investigations.length > itemsPerPage && (
        <div className="mt-12 flex justify-center">
          <ModernPagination
            currentPage={currentPage}
            totalItems={investigations.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            showItemsInfo={showItemsInfo}
            showQuickJump={showQuickJump}
          />
        </div>
      )}
    </div>
  );
};

export default FahndungskarteGridWithPagination;
