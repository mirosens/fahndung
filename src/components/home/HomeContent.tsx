/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
"use client";

import { useState, useMemo, useEffect } from "react";
import { AlertTriangle, Eye } from "lucide-react";
import { api } from "~/trpc/react";

import FahndungFilter, { type FilterState } from "./FahndungFilter";
import ViewToggle from "./ViewToggle";
import FahndungskarteListFlat from "~/components/fahndungskarte/ansichten/FahndungskarteListFlat";
import { type ViewMode } from "~/types/fahndungskarte";
import dynamic from "next/dynamic";
import HeroSection from "./HeroSection";

// Dynamischer Import der FahndungskarteGrid mit SSR deaktiviert
const FahndungskarteGrid = dynamic(
  () => import("~/components/fahndungskarte/ansichten/FahndungskarteGrid"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-64 rounded-lg bg-muted dark:bg-muted"></div>
      </div>
    ),
  },
);

// Import Investigation Typ aus dem tRPC Router
interface Investigation {
  id: string;
  title: string;
  case_number: string;
  description: string;
  short_description: string;
  status: string;
  priority: "normal" | "urgent" | "new";
  category: string;
  location: string;
  station: string;
  features: string;
  date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  contact_info?: Record<string, unknown>;
  created_by_user?: {
    name: string;
    email: string;
  };
  assigned_to_user?: {
    name: string;
    email: string;
  };
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
}

export default function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid-3");
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    status: [],
    priority: [],
    category: [],
    timeRange: "all",
    searchTerm: "",
  });

  // Hydration-Sicherheit
  useEffect(() => {
    setMounted(true);
  }, []);

  // tRPC Queries und Mutations
  const { data: investigations, isLoading } =
    api.post.getInvestigations.useQuery(
      {
        limit: 50,
        offset: 0,
      },
      {
        staleTime: 10 * 60 * 1000, // 10 Minuten Cache (erhöht von 5 Minuten)
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchInterval: 300000, // Alle 5 Minuten (erhöht von 5 Minuten)
      },
    );

  // Gefilterte Fahndungen
  const filteredInvestigations = useMemo((): Fahndungskarte[] => {
    if (!investigations || !Array.isArray(investigations)) return [];

    return investigations.filter((investigation): investigation is Fahndungskarte => {
      const inv = investigation as Fahndungskarte;

      // Suchbegriff Filter
      if (activeFilters.searchTerm) {
        const searchLower = activeFilters.searchTerm.toLowerCase();
        const matchesSearch =
          inv.title.toLowerCase().includes(searchLower) ||
          inv.description?.toLowerCase().includes(searchLower) ||
          inv.location?.toLowerCase().includes(searchLower) ||
          inv.tags?.some((tag) => tag.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Status Filter
      if (
        activeFilters.status.length > 0 &&
        !activeFilters.status.includes(inv.status)
      ) {
        return false;
      }

      // Prioritäts Filter
      if (
        activeFilters.priority.length > 0 &&
        !activeFilters.priority.includes(inv.priority)
      ) {
        return false;
      }

      // Kategorie Filter (über Tags)
      if (activeFilters.category.length > 0) {
        const hasMatchingCategory = activeFilters.category.some((category) => {
          const categoryLower = category.toLowerCase();
          return inv.tags?.some((tag) =>
            tag.toLowerCase().includes(categoryLower),
          );
        });
        if (!hasMatchingCategory) return false;
      }

      // Zeit Filter - nur auf Client-Seite ausführen
      if (activeFilters.timeRange !== "all" && typeof window !== "undefined") {
        const now = new Date();
        const timeRanges = {
          "24h": 24 * 60 * 60 * 1000,
          "7d": 7 * 24 * 60 * 60 * 1000,
          "30d": 30 * 24 * 60 * 60 * 1000,
        };
        const cutoff = new Date(
          now.getTime() - timeRanges[activeFilters.timeRange],
        );
        const investigationDate = new Date(inv.created_at);
        if (investigationDate < cutoff) return false;
      }

      return true;
    });
  }, [investigations, activeFilters]);

  // Filter-Handler
  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  // Loading state oder nicht gemounted
  if (isLoading ?? !mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <FahndungFilter onFilterChange={handleFilterChange} />
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-muted dark:bg-muted" />
            ))}
          </div>
          <div className="h-64 rounded-lg bg-muted dark:bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        showAlert={true}
        alertText="EILMELDUNG! Polizei sucht Zeugen zu aktuellem Fall"
        title="Hinweise helfen"
        subtitle="Unterstützen Sie die Polizei bei Ermittlungen!"
        primaryButtonText="Fahndungen ansehen"
        secondaryButtonText="Hinweis abgeben"
        showUrgentFahndungen={true}
        urgentInvestigations={
          investigations
            ?.filter(
              (investigation) =>
                investigation.priority === "urgent" ||
                investigation.status === "urgent",
            )
            .slice(0, 3) || []
        }
        onPrimaryClick={() => {
          // Scroll to main content
          document
            .getElementById("main-content")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        onSecondaryClick={() => {
          // Navigate to contact page or open contact form
          if (typeof window !== "undefined") {
            window.location.href = "/kontakt";
          }
        }}
      />

      {/* Main Content */}
      <div id="main-content" className="container mx-auto px-4 py-8">
        {/* Aktuelle Fahndungen Titel */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground dark:text-white">
            Aktuelle Fahndungen
          </h2>
        </div>

        {/* Kompakte Filter und Suche */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Linke Seite: Filter */}
            <FahndungFilter onFilterChange={handleFilterChange} />

            {/* Rechte Seite: Anzahl und View-Toggle */}
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>
                  {investigations ? filteredInvestigations.length : 0}/
                  {investigations && Array.isArray(investigations)
                    ? investigations.length
                    : 0}
                </span>
              </div>
              <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            </div>
          </div>
        </div>

        {/* Investigations List */}
        <div className="space-y-4">
          {investigations &&
          filteredInvestigations &&
          filteredInvestigations.length > 0 ? (
            viewMode === "list-flat" ? (
              <FahndungskarteListFlat investigations={filteredInvestigations} />
            ) : (
              <FahndungskarteGrid
                investigations={filteredInvestigations}
                viewMode={viewMode}
              />
            )
          ) : (
            <div className="rounded-lg border border-border bg-white p-8 text-center shadow-xs dark:border-border dark:bg-muted">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold text-muted-foreground dark:text-white">
                {investigations &&
                Array.isArray(investigations) &&
                investigations.length > 0
                  ? "Keine Fahndungen mit den aktuellen Filtern gefunden"
                  : "Keine Fahndungen gefunden"}
              </h3>
              <p className="text-muted-foreground dark:text-muted-foreground">
                {investigations &&
                Array.isArray(investigations) &&
                investigations.length > 0
                  ? "Versuchen Sie andere Filter-Einstellungen oder löschen Sie die Filter."
                  : "Es sind noch keine Fahndungen in der Datenbank vorhanden."}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
