"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Save, Edit, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useInvestigationSync } from "~/hooks/useInvestigationSync";
import { useInvestigationEdit } from "~/hooks/useInvestigationEdit";
import { useAuth } from "~/hooks/useAuth";
import { canEdit } from "~/lib/auth";
import PageLayout from "~/components/layout/PageLayout";
import { InvestigationEditErrorBoundary } from "~/components/fahndungen/InvestigationEditErrorBoundary";
import { Button } from "~/components/ui/button";
import { Breadcrumbs } from "~/components/ui/breadcrumbs";
import dynamic from "next/dynamic";
import { InvestigationDataConverter } from "~/lib/services/investigationDataConverter";
import type { UIInvestigationData } from "~/lib/types/investigation.types";
import { isValidInvestigationId } from "~/lib/utils/validation";
import { getBreadcrumbsForInvestigation } from "~/lib/seo";

import CategoryLayout from "./CategoryLayout";

// Lazy Loading für bessere Performance
const FahndungTab = dynamic(() => import("./FahndungTab"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-64 rounded-lg bg-muted dark:bg-muted" />
    </div>
  ),
  ssr: false,
});

const ContactCategory = dynamic(() => import("./ModernContactCategory"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-64 rounded-lg bg-muted dark:bg-muted" />
    </div>
  ),
  ssr: false,
});

const DescriptionCategory = dynamic(
  () => import("./ModernDescriptionCategory"),
  {
    loading: () => (
      <div className="animate-pulse">
        <div className="h-64 rounded-lg bg-muted dark:bg-muted" />
      </div>
    ),
    ssr: false,
  },
);

const MediaCategory = dynamic(() => import("./ModernMediaCategory"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-64 rounded-lg bg-muted dark:bg-muted" />
    </div>
  ),
  ssr: false,
});

const LocationsCategory = dynamic(() => import("./ModernLocationsCategory"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-64 rounded-lg bg-muted dark:bg-muted" />
    </div>
  ),
  ssr: false,
});

interface FahndungCategoriesContainerProps {
  investigationId: string;
}

export default function FahndungCategoriesContainer({
  investigationId,
}: FahndungCategoriesContainerProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [activeCategory, setActiveCategory] = useState("fahndung");

  // Validiere investigationId
  const isValidId = isValidInvestigationId(investigationId);

  // Debug-Log für UUID-Probleme
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 FahndungCategoriesContainer Debug:", {
      investigationId,
      isValidId,
      isUUID:
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          investigationId,
        ),
      isCaseNumber: /^(?:POL-)?\d{4}-[A-Z]-\d{3,6}(?:-[A-Z])?$/.test(
        investigationId,
      ),
    });
  }

  // Optimierte Hooks mit reduzierter Synchronisation
  const { investigation, isLoading } = useInvestigationSync(investigationId);
  const { editedData, isEditMode, save, updateField, globalSync } =
    useInvestigationEdit(investigationId);

  // Delete mutation hook
  const deleteMutation = api.post.deleteInvestigation.useMutation({
    onSuccess: () => {
      router.push("/fahndungen");
    },
    onError: (error) => {
      console.error("Fehler beim Löschen:", error);
    },
  });

  // Memoized Navigation Function
  const navigateToCategory = useCallback((category: string) => {
    setActiveCategory(category);
  }, []);

  // Memoized Save Handler
  const handleSave = useCallback(async () => {
    await save();
    setActiveCategory("fahndung");
  }, [save]);

  // Memoized Delete Handler
  const handleDelete = useCallback(async () => {
    if (!investigation) return;

    try {
      await deleteMutation.mutateAsync({ id: investigationId });
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
    }
  }, [investigation, investigationId, deleteMutation]);

  // Memoized Loading State
  const loadingState = useMemo(() => {
    if (isLoading || !isValidId) {
      return (
        <PageLayout session={session}>
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-muted-foreground dark:text-muted-foreground">
                {!isValidId
                  ? "Ungültige Fahndungs-ID"
                  : "Lade Fahndungsdaten..."}
              </p>
            </div>
          </div>
        </PageLayout>
      );
    }
    return null;
  }, [isLoading, isValidId, session]);

  // Memoized Error State
  const errorState = useMemo(() => {
    if (!isValidId) {
      return (
        <PageLayout session={session}>
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                <div className="h-6 w-6 text-white">!</div>
              </div>
              <h2 className="text-xl font-semibold text-muted-foreground dark:text-white">
                Ungültige Fahndungs-ID
              </h2>
              <p className="text-muted-foreground dark:text-muted-foreground">
                Die angegebene Fahndungs-ID ist ungültig oder leer:{" "}
                {investigationId}
              </p>
              <Link
                href="/"
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Zurück zur Startseite
              </Link>
            </div>
          </div>
        </PageLayout>
      );
    }

    if (!investigation && !isLoading) {
      return (
        <PageLayout session={session}>
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500">
                <div className="h-6 w-6 text-white">!</div>
              </div>
              <h2 className="text-xl font-semibold text-muted-foreground dark:text-white">
                Fahndung nicht gefunden
              </h2>
              <p className="text-muted-foreground dark:text-muted-foreground">
                Die angeforderte Fahndung konnte nicht gefunden werden. ID:{" "}
                {investigationId}
              </p>
              <Link
                href="/"
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Zurück zur Startseite
              </Link>
            </div>
          </div>
        </PageLayout>
      );
    }

    return null;
  }, [isValidId, investigation, isLoading, session]);

  // Memoized Converted Data
  const convertedData = useMemo(() => {
    if (!investigation) return null;

    const conversion = InvestigationDataConverter.toUIFormat(
      investigation as Record<string, unknown>,
    );
    if (conversion.success) {
      return conversion.data;
    } else {
      console.error("Fehler bei der Datenkonvertierung:", conversion.error);
      // Fallback: Verwende die Rohdaten mit Standardwerten
      return {
        step1: {
          title: investigation.title ?? "",
          category: investigation.category ?? "MISSING_PERSON",
          caseNumber: investigation.case_number ?? "",
        },
        step2: {
          shortDescription: investigation.short_description ?? "",
          description: investigation.description ?? "",
          priority: investigation.priority ?? "normal",
          tags: investigation.tags ?? [],
          features: investigation.features ?? "",
        },
        step3: {
          mainImage: investigation.images?.[0]?.url ?? null,
          additionalImages:
            investigation.images?.slice(1).map((img) => img.url) ?? [],
        },
        step4: {
          mainLocation: investigation.location
            ? { address: investigation.location }
            : null,
        },
        step5: {
          contactPerson:
            (investigation.contact_info?.["person"] as string) ?? "Polizei",
          contactPhone:
            (investigation.contact_info?.["phone"] as string) ??
            "+49 711 8990-0",
          contactEmail: (investigation.contact_info?.["email"] as string) ?? "",
          department: investigation.station ?? "Polizeipräsidium",
          availableHours:
            (investigation.contact_info?.["hours"] as string) ?? "24/7",
        },
        images: investigation.images ?? [],
        contact_info: investigation.contact_info ?? {},
      } as UIInvestigationData;
    }
  }, [investigation]);

  // Memoized Breadcrumbs mit korrekter URL
  const breadcrumbs = useMemo(
    () =>
      investigation ? getBreadcrumbsForInvestigation(investigation.title) : [],
    [investigation],
  );

  // Memoized Category Content
  const categoryContent = useMemo(() => {
    if (!convertedData) return null;

    const data = isEditMode ? editedData : convertedData;

    if (!data) {
      return (
        <div className="rounded-lg border border-border bg-white p-6 dark:border-border dark:bg-muted">
          <p className="text-muted-foreground dark:text-muted-foreground">
            Keine Daten verfügbar.
          </p>
        </div>
      );
    }

    const commonProps = {
      data,
      isEditMode,
      updateField,
    };

    switch (activeCategory) {
      case "fahndung":
        return (
          <CategoryLayout
            activeCategory={activeCategory}
            onCategoryChange={navigateToCategory}
          >
            <FahndungTab data={data} />
          </CategoryLayout>
        );

      case "contact":
        return (
          <CategoryLayout
            activeCategory={activeCategory}
            onCategoryChange={navigateToCategory}
          >
            <ContactCategory
              {...commonProps}
              onNext={() => navigateToCategory("description")}
              onSave={handleSave}
            />
          </CategoryLayout>
        );

      case "description":
        return (
          <CategoryLayout
            activeCategory={activeCategory}
            onCategoryChange={navigateToCategory}
          >
            <DescriptionCategory {...commonProps} />
          </CategoryLayout>
        );

      case "media":
        return (
          <CategoryLayout
            activeCategory={activeCategory}
            onCategoryChange={navigateToCategory}
          >
            <MediaCategory
              {...commonProps}
              onNext={() => navigateToCategory("locations")}
              onPrevious={() => navigateToCategory("description")}
            />
          </CategoryLayout>
        );

      case "locations":
        return (
          <CategoryLayout
            activeCategory={activeCategory}
            onCategoryChange={navigateToCategory}
          >
            <LocationsCategory
              {...commonProps}
              onNext={() => navigateToCategory("contact")}
              onPrevious={() => navigateToCategory("media")}
            />
          </CategoryLayout>
        );

      default:
        return (
          <div className="rounded-lg border border-border bg-white p-6 dark:border-border dark:bg-muted">
            <p className="text-muted-foreground dark:text-muted-foreground">
              Kategorie nicht verfügbar.
            </p>
          </div>
        );
    }
  }, [
    activeCategory,
    convertedData,
    editedData,
    isEditMode,
    updateField,
    navigateToCategory,
    handleSave,
  ]);

  // Early returns für Loading und Error States
  if (loadingState) return loadingState;
  if (errorState) return errorState;

  return (
    <InvestigationEditErrorBoundary>
      <PageLayout session={session}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-4"></div>

              <div className="flex items-center gap-2">
                {canEdit(session?.profile ?? null) && (
                  <>
                    {isEditMode ? (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={handleSave}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                          Speichern
                        </Button>
                        <Button
                          onClick={() => globalSync()}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ansicht
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => globalSync()}
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Bearbeiten
                        </Button>
                        <Button
                          onClick={handleDelete}
                          variant="destructive"
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Löschen
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Category Content */}
          <div className="min-h-[600px]">{categoryContent}</div>
        </div>
      </PageLayout>
    </InvestigationEditErrorBoundary>
  );
}
