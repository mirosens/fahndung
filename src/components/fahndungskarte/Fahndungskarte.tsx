"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Edit, ArrowRight } from "lucide-react";
import { TabContent } from "./TabContent";
import { NetworkErrorDiagnostic } from "../NetworkErrorDiagnostic";
import { useFahndungskarteOptimized } from "~/hooks/useFahndungskarteOptimized";
import { CATEGORY_CONFIG, PRIORITY_CONFIG, TAB_CONFIG } from "./types";
import type { FahndungsData } from "./types";
import styles from "~/styles/fahndungskarte.module.css";
import FahndungskarteImage from "./FahndungskarteImage";
import { getCityFromDepartment } from "./utils";
import { getFahndungUrl, getFahndungEditUrl } from "~/lib/seo";

interface ModernFahndungskarteProps {
  data?: FahndungsData;
  className?: string;
  /**
   * Identifiziert die Untersuchung, zu der diese Karte gehört. Wenn keine ID
   * übergeben wird oder die Navigation deaktiviert ist, wird keine
   * Synchronisation mit dem Backend durchgeführt und alle Navigations‑Buttons
   * sind inaktiv.
   */
  investigationId?: string;
  userPermissions?: {
    canEdit?: boolean;
    canDelete?: boolean;
  };
  /**
   * Deaktiviert Navigationsfunktionen (Links zur Detailseite). Wenn diese
   * Eigenschaft wahr ist, werden Buttons wie „Mehr erfahren" und
   * „Vollständige Ansicht" nicht angezeigt und Klicks auf die Karte führen
   * nicht zu einem Seitenwechsel.
   */
  disableNavigation?: boolean;
  /**
   * Deaktiviert Editierfunktionen. Wenn wahr, werden der Quick‑Edit‑Button
   * sowie Bearbeiten‑Schaltflächen ausgeblendet, unabhängig von
   * `userPermissions`.
   */
  disableEdit?: boolean;
  /**
   * Callback-Funktion, die aufgerufen wird, wenn sich der Flip-Status der Karte ändert.
   * Wird hauptsächlich für Carousel-Navigation verwendet.
   */
  onFlipStatusChange?: (isFlipped: boolean) => void;
  /**
   * Markiert das Bild als priorisiert für LCP (Largest Contentful Paint) Optimierung.
   * Sollte für die ersten sichtbaren Bilder gesetzt werden.
   */
  imagePriority?: boolean;
  /**
   * Layout-Modus für die Karte. "grid-4" sorgt für quadratische Bilddarstellung.
   */
  layoutMode?: "default" | "grid-4";
}

const Fahndungskarte: React.FC<ModernFahndungskarteProps> = ({
  data: propData,
  className = "",
  investigationId,
  userPermissions,
  disableNavigation,
  disableEdit,
  onFlipStatusChange,
  imagePriority = false,
  layoutMode = "default",
}) => {
  const router = useRouter();
  const [state, setState] = useState({
    isFlipped: false,
    activeTab: "overview",
    isAnimating: false,
    imageError: false,
    showQuickEdit: false,
    networkError: null as string | Error | null,
  });

  // Verwende die optimierte Hook
  const {
    safeData,
    isDataLoading,
    networkError,
    handleRetry: retryFromHook,
  } = useFahndungskarteOptimized(
    // Wenn Navigation deaktiviert ist oder keine ID vorliegt, übergebe einen
    // leeren String, damit die Hook keinen Backend‑Request auslöst
    disableNavigation || !investigationId ? "" : investigationId,
    propData,
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const detailsButtonRef = useRef<HTMLButtonElement>(null);

  // Error-Handling
  useEffect(() => {
    if (networkError) {
      setState((prev) => ({ ...prev, networkError }));
    }
  }, [networkError]);

  const category = useMemo(() => {
    return safeData?.step1?.category
      ? CATEGORY_CONFIG[safeData.step1.category]
      : CATEGORY_CONFIG.MISSING_PERSON;
  }, [safeData?.step1?.category]);

  // Kompakter Kategoriename für Frontseite
  const categoryCompactLabel = useMemo(() => {
    const cat = safeData?.step1?.category;
    switch (cat) {
      case "UNKNOWN_DEAD":
        return "TOTE";
      case "WANTED_PERSON":
        return "STRAFTÄTER";
      case "MISSING_PERSON":
        return "VERMISSTE";
      case "STOLEN_GOODS":
        return "SACHEN";
      default:
        return category.label;
    }
  }, [safeData?.step1?.category, category.label]);

  // Extrahiere den Stadtnamen aus der Dienststelle
  const cityName = useMemo(() => {
    const department =
      safeData.step1.department ?? safeData.step5.department ?? "";
    return getCityFromDepartment(department);
  }, [safeData.step1.department, safeData.step5.department]);

  const priority = useMemo(() => {
    return safeData?.step2?.priority
      ? PRIORITY_CONFIG[safeData.step2.priority]
      : PRIORITY_CONFIG.normal;
  }, [safeData?.step2?.priority]);

  // Event-Handler
  const updateState = useCallback(
    (updates: Partial<typeof state>) =>
      setState((prev) => ({ ...prev, ...updates })),
    [],
  );
  const handleImageError = () => updateState({ imageError: true });
  const handleQuickEdit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (investigationId) {
      try {
        const url = getFahndungEditUrl(
          safeData.step1.title,
          safeData.step1.caseNumber,
        );
        router.push(url);
      } catch (error) {
        // Fallback auf direkte ID-Navigation
        console.warn(
          "SEO-URL-Generierung fehlgeschlagen, verwende Fallback:",
          error,
        );
        router.push(`/fahndungen/${investigationId}?edit=true`);
      }
    }
  };

  const flipCard = useCallback((): void => {
    if (state.isAnimating) return;
    const newFlipState = !state.isFlipped;
    updateState({ isAnimating: true, isFlipped: newFlipState });

    // Callback aufrufen, wenn vorhanden
    if (onFlipStatusChange) {
      onFlipStatusChange(newFlipState);
    }

    setTimeout(() => updateState({ isAnimating: false }), 500);
  }, [state.isFlipped, state.isAnimating, updateState, onFlipStatusChange]);

  const navigateToDetail = () => {
    // 🚀 Navigation nur ausführen, wenn nicht deaktiviert und eine ID vorhanden ist
    if (disableNavigation || !investigationId) return;

    // Verwende SEO-freundliche URL basierend auf Titel und Fallnummer
    try {
      const url = getFahndungUrl(
        safeData.step1.title,
        safeData.step1.caseNumber,
      );
      router.push(url);
    } catch (error) {
      // Fallback auf direkte ID-Navigation
      console.warn(
        "SEO-URL-Generierung fehlgeschlagen, verwende Fallback:",
        error,
      );
      router.push(`/fahndungen/${investigationId}`);
    }
  };

  // Retry-Funktion für NetworkErrors
  const handleRetry = useCallback(async () => {
    updateState({ networkError: null });
    try {
      await retryFromHook();
    } catch (error) {
      console.error("❌ Retry fehlgeschlagen:", error);
    }
  }, [updateState, retryFromHook]);

  // Vereinfachte Effects
  useEffect(() => {
    // Auto-sync
    if (!investigationId) return;
    const interval = setInterval(() => {
      // void syncAfterUpdate(); // This line was removed from the new_code, so it's removed here.
    }, 5000);
    return () => clearInterval(interval);
  }, [investigationId]);

  // Keyboard & Click-Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cardRef.current?.contains(document.activeElement)) return;
      const activeElement = document.activeElement;

      if (!state.isFlipped) {
        if (
          (e.key === "Enter" || e.key === " ") &&
          activeElement === detailsButtonRef.current
        ) {
          e.preventDefault();
          e.stopPropagation();
          flipCard();
        }
        if (e.key === "Tab") {
          if (activeElement === frontRef.current && !e.shiftKey) {
            e.preventDefault();
            detailsButtonRef.current?.focus();
          } else if (activeElement === detailsButtonRef.current && e.shiftKey) {
            e.preventDefault();
            frontRef.current?.focus();
          }
        }
      }
      if (state.isFlipped && e.key === "Escape") {
        e.preventDefault();
        flipCard();
        setTimeout(() => frontRef.current?.focus(), 100);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        state.isFlipped &&
        cardRef.current &&
        !cardRef.current.contains(e.target as Node)
      ) {
        flipCard();
      }
    };

    const handleScroll = () => {
      if (state.isFlipped) flipCard();
    };
    const handlePopState = () => {
      if (state.isFlipped) flipCard();
    };

    const cardElement = cardRef.current;
    if (cardElement) cardElement.addEventListener("keydown", handleKeyDown);
    if (state.isFlipped) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      if (cardElement)
        cardElement.removeEventListener("keydown", handleKeyDown);
      if (state.isFlipped) {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("popstate", handlePopState);
      }
    };
  }, [state.isFlipped, flipCard]);

  // Tab-Index Management
  useEffect(() => {
    if (backRef.current) {
      const focusableElements = backRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusableElements.forEach((element) => {
        element.setAttribute("tabindex", state.isFlipped ? "0" : "-1");
      });
    }
  }, [state.isFlipped]);

  // Zeige NetworkError-Diagnose wenn Fehler vorhanden
  if (networkError) {
    return (
      <div className={`${styles["fahndungskarte"]} ${className}`}>
        <NetworkErrorDiagnostic
          error={networkError}
          onRetry={handleRetry}
          className="h-full"
        />
      </div>
    );
  }

  // Zeige Loading nur wenn wirklich Daten geladen werden (nicht im Preview-Modus)
  if (isDataLoading && investigationId && !disableNavigation) {
    return (
      <div className={`${styles["fahndungskarte"]} ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              Lade Fahndungsdaten...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`relative mx-auto w-full max-w-sm ${className}`}
      style={{
        perspective: "1000px",
        height: layoutMode === "grid-4" ? "400px" : "513px",
      }}
      role="region"
      aria-label={`Fahndungskarte: ${safeData.step1.title}`}
      onMouseEnter={() => updateState({ showQuickEdit: true })}
      onMouseLeave={() => updateState({ showQuickEdit: false })}
    >
      <div
        className="relative h-full w-full transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: state.isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT SIDE */}
        <div
          ref={frontRef}
          className="group absolute inset-0 flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.10)] transition-all duration-300 hover:border-gray-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-border/30 dark:bg-muted/20 dark:shadow-[0_1px_8px_rgba(255,255,255,0.01)] dark:hover:shadow-[0_4px_24px_rgba(255,255,255,0.03)]"
          style={{
            backfaceVisibility: "hidden",
          }}
          onClick={
            disableNavigation || !investigationId ? flipCard : navigateToDetail
          }
          role="button"
          aria-label={
            disableNavigation || !investigationId
              ? `Fahndungskarte umdrehen`
              : `Zur Detailseite von ${safeData.step1.title} navigieren`
          }
          tabIndex={state.isFlipped ? -1 : 0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (disableNavigation || !investigationId) {
                flipCard();
              } else {
                navigateToDetail();
              }
            }
          }}
        >
          {/* Image Section */}
          <div
            className={`relative w-full overflow-hidden bg-muted dark:bg-muted ${
              layoutMode === "grid-4" ? "rounded-t-lg" : ""
            }`}
            style={{
              height: layoutMode === "grid-4" ? "60%" : "65%",
              borderRadius:
                layoutMode === "grid-4" ? "0.5rem 0.5rem 0 0" : undefined,
            }}
          >
            {!disableEdit &&
              userPermissions?.canEdit &&
              state.showQuickEdit && (
                <button
                  onClick={handleQuickEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      handleQuickEdit(e);
                    }
                  }}
                  className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  aria-label="Schnell bearbeiten"
                  tabIndex={0}
                >
                  <Edit className="h-3 w-3" />
                  Bearbeiten
                </button>
              )}

            <FahndungskarteImage
              src={safeData.step3?.mainImage}
              alt={`Hauptfoto von ${safeData.step1.title}`}
              className={`transition-transform duration-500 group-hover:scale-105 ${
                layoutMode === "grid-4"
                  ? "aspect-square rounded-t-lg object-cover object-center"
                  : "object-cover object-center"
              }`}
              fallbackSrc="/images/placeholders/fotos/platzhalterbild.svg"
              showPlaceholder={true}
              priority={imagePriority}
            />

            {safeData.step2.priority !== "normal" && !state.isFlipped && (
              <div
                className={`absolute right-4 top-4 rounded px-2 py-0.5 text-xs font-bold text-white ${priority.color} ${priority.pulse ? "animate-pulse" : ""}`}
                style={{ zIndex: 1 }}
                role="status"
                aria-label={`Priority: ${priority.label}`}
              >
                {priority.label}
              </div>
            )}
          </div>

          {/* Info Section - Fester Hintergrund für bessere Sichtbarkeit */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm dark:bg-black/95 ${
              layoutMode === "grid-4" ? "rounded-b-lg" : ""
            }`}
            style={{
              height: layoutMode === "grid-4" ? "40%" : "35%",
              borderRadius:
                layoutMode === "grid-4" ? "0 0 0.5rem 0.5rem" : undefined,
            }}
          >
            <div className="relative z-10 flex h-full flex-col justify-between p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="truncate text-xs text-muted-foreground dark:text-muted-foreground">
                    {cityName}
                    {" | "}
                    {safeData.step1.caseDate
                      ? new Date(safeData.step1.caseDate).toLocaleDateString(
                          "de-DE",
                          { day: "2-digit", month: "2-digit", year: "2-digit" },
                        )
                      : "Datum unbekannt"}
                    {" | "}
                    {categoryCompactLabel}
                    {safeData.step1?.variant &&
                    safeData.step1.variant.trim().length > 0
                      ? ` · ${safeData.step1.variant}`
                      : ""}
                  </div>
                </div>

                <h3 className="line-clamp-2 text-lg font-bold text-muted-foreground dark:text-white">
                  {safeData.step1.title}
                </h3>
                {/* Kurzbeschreibung entfernt - wird nur auf der Rückseite angezeigt */}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex-1">
                  {!disableNavigation && investigationId && (
                    <button
                      className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-border dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToDetail();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          navigateToDetail();
                        }
                      }}
                      aria-label="Mehr erfahren"
                      tabIndex={0}
                    >
                      <span>Mehr erfahren</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Details Button - immer sichtbar, auch im Preview-Modus */}
                <button
                  ref={detailsButtonRef}
                  className="flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-border dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    flipCard();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      flipCard();
                    }
                  }}
                  aria-label="Details anzeigen"
                  tabIndex={0}
                >
                  <span>Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          ref={backRef}
          className="absolute inset-0 flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-[0_2px_16px_rgba(0,0,0,0.10)] dark:border-border/30 dark:bg-muted/20 dark:shadow-[0_1px_8px_rgba(255,255,255,0.01)]"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-center justify-between border-b border-border p-4 dark:border-border">
            <h3 className="text-lg font-semibold text-muted-foreground dark:text-white">
              Details
            </h3>
            <button
              onClick={flipCard}
              className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted dark:hover:text-muted-foreground"
              aria-label="Karte schließen"
            >
              <EyeOff className="h-5 w-5" />
            </button>
          </div>

          <div className="flex border-b border-border dark:border-border">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => updateState({ activeTab: tab.id })}
                className={`flex min-w-0 flex-1 items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-colors ${
                  state.activeTab === tab.id
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-muted-foreground"
                }`}
              >
                <tab.icon className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <TabContent
              activeTab={state.activeTab}
              safeData={safeData}
              imageError={state.imageError}
              handleImageError={handleImageError}
              investigationId={investigationId}
            />
          </div>

          <div className="border-t border-border p-4 dark:border-border">
            <div className="flex items-center justify-between">
              {!disableNavigation && investigationId && (
                <button
                  onClick={navigateToDetail}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Eye className="h-4 w-4" />
                  Vollständige Ansicht
                </button>
              )}

              {!disableEdit && userPermissions?.canEdit && (
                <button
                  onClick={handleQuickEdit}
                  className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-border dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
                >
                  <Edit className="h-4 w-4" />
                  Bearbeiten
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fahndungskarte;
