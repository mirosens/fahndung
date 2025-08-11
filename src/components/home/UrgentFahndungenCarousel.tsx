"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Square } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import dynamic from "next/dynamic";
import styles from "~/styles/fahndungskarte.module.css";

// Dynamischer Import der Fahndungskarte
const Fahndungskarte = dynamic(
  () =>
    import("../fahndungskarte/Fahndungskarte").then((mod) => ({
      default: mod.default,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full animate-pulse rounded-lg bg-muted dark:bg-muted" />
    ),
  },
);

interface Investigation {
  id: string;
  title: string;
  description?: string;
  short_description?: string;
  status: string;
  priority: string;
  category: string;
  case_number: string;
  tags?: string[];
  location?: string;
  station?: string;
  features?: string;
  created_at: string;
  updated_at: string;
  contact_info?: Record<string, unknown>;
  images?: Array<{
    id: string;
    url: string;
    alt_text?: string;
    caption?: string;
  }>;
}

interface UrgentFahndungenCarouselProps {
  investigations: Investigation[];
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showNavigation?: boolean;
  showDots?: boolean;
  showControls?: boolean;
}

export default function UrgentFahndungenCarousel({
  investigations,
  className = "",
  autoPlay = false, // Standardmäßig deaktiviert
  autoPlayInterval = 5000,
  showNavigation = true,
  showDots = true,
  showControls = true,
}: UrgentFahndungenCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false); // Standardmäßig pausiert
  const [isCurrentCardFlipped, setIsCurrentCardFlipped] = useState(false);

  // Touch-Gesten für Mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Reduced Motion Support
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Konvertierung von Datenbank-Daten zu FahndungsData Format
  const convertInvestigationToFahndungsData = (
    investigation: Investigation,
  ) => {
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
        priority:
          (investigation.priority as "urgent" | "new" | "normal") ?? "normal",
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

  // Auto-Play Funktionalität mit Benutzerkontrolle
  const startAutoPlay = useCallback(() => {
    if (!autoPlay || investigations.length <= 1) return;

    setIsAutoPlaying(true);

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % investigations.length);
    }, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, investigations.length]);

  const stopAutoPlay = useCallback(() => {
    setIsAutoPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  }, [isAutoPlaying, startAutoPlay, stopAutoPlay]);

  // Navigation
  const goToPrevious = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + investigations.length) % investigations.length,
    );
  }, [investigations.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % investigations.length);
  }, [investigations.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsCurrentCardFlipped(false); // Reset flip status when changing slides
  }, []);

  // Funktion zum Überwachen des Flip-Status der aktuellen Karte
  const handleCardFlip = useCallback((isFlipped: boolean) => {
    setIsCurrentCardFlipped(isFlipped);
  }, []);

  // Tastatursteuerung
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!carouselRef.current?.contains(e.target as Node)) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          break;
        case " ":
          e.preventDefault();
          toggleAutoPlay();
          break;
        case "Home":
          e.preventDefault();
          goToSlide(0);
          break;
        case "End":
          e.preventDefault();
          goToSlide(investigations.length - 1);
          break;
      }
    },
    [investigations.length, goToPrevious, goToNext, toggleAutoPlay, goToSlide],
  );

  // Event-Listener für Tastatursteuerung
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Touch-Gesten für Mobile
  const minSwipeDistance = 50;

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    if (e.targetTouches[0]) {
      setTouchStart(e.targetTouches[0].clientX);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.targetTouches[0]) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrevious();
  }, [touchStart, touchEnd, goToNext, goToPrevious]);

  // Cleanup bei Unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Keyboard-Trap vermeiden - Fokus-Management
  useEffect(() => {
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" && carouselRef.current) {
        const focusableElements = carouselRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          // Lasse den Fokus das Carousel verlassen
          return;
        }

        if (!e.shiftKey && document.activeElement === lastElement) {
          // Lasse den Fokus das Carousel verlassen
          return;
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, []);

  // Reduced Motion Support
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (!investigations || investigations.length === 0) {
    return (
      <Card className={`w-full max-w-sm rounded-lg shadow-sm ${className}`}>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground dark:text-muted-foreground">
            Keine dringenden Fahndungen verfügbar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      ref={carouselRef}
      className={`relative h-[525px] w-full max-w-sm ${className}`}
      style={{ zIndex: 25 }}
      role="region"
      aria-label="Dringende Fahndungen Karussell"
      tabIndex={0}
    >
      {/* Skip-Link für Screen Reader */}
      <a
        href="#after-carousel"
        className="sr-only z-50 rounded bg-white px-4 py-2 focus:not-sr-only focus:absolute focus:left-0 focus:top-0"
      >
        Karussell überspringen
      </a>

      {/* Live-Region für Änderungen */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Fahndung {currentIndex + 1} von {investigations.length}:
        {investigations[currentIndex]?.title}
      </div>
      {/* Carousel Container */}
      <div
        className="relative overflow-hidden rounded-lg shadow-sm"
        style={{
          backdropFilter: "blur(5px)",
          WebkitBackdropFilter: "blur(5px)",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: `transform ${prefersReducedMotion ? "0ms" : "700ms"} ease-out`,
          }}
        >
          {investigations.map((investigation, index) => (
            <div key={investigation.id} className="w-full flex-shrink-0">
              <Fahndungskarte
                data={convertInvestigationToFahndungsData(investigation)}
                investigationId={investigation.id}
                className="w-full"
                onFlipStatusChange={
                  index === currentIndex ? handleCardFlip : undefined
                }
              />
            </div>
          ))}
        </div>

        {/* Ultra-moderne Navigation-Pfeile mit Frosted Glass Effekt */}
        {showNavigation &&
          investigations.length > 1 &&
          !isCurrentCardFlipped && (
            <>
              <button
                onClick={goToPrevious}
                className={`absolute top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${styles["carousel-nav-glass"]}`}
                style={{
                  left: "-20px",
                }}
                aria-label="Vorherige Fahndung"
              >
                <ChevronLeft className="h-5 w-5 text-black/80 hover:text-black" />
              </button>
              <button
                onClick={goToNext}
                className={`absolute top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${styles["carousel-nav-glass"]}`}
                style={{
                  right: "-20px",
                }}
                aria-label="Nächste Fahndung"
              >
                <ChevronRight className="h-5 w-5 text-black/80 hover:text-black" />
              </button>
            </>
          )}
      </div>

      {/* Kontrollleiste */}
      {showControls && investigations.length > 1 && (
        <div className="mt-6 flex flex-col items-center gap-4">
          {/* Moderne Zahlendarstellung mit Progress-Indikatoren */}
          {showDots && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="text-sm font-light text-gray-500/60">
                {String(currentIndex + 1).padStart(2, "0")}
              </span>

              <div className="flex gap-1">
                {investigations.map((_, index) => (
                  <div
                    key={index}
                    className={`
                      transition-all duration-500
                      ${
                        index === currentIndex
                          ? "h-px w-6 bg-gray-800/80"
                          : "h-px w-2 bg-gray-300/30"
                      }
                    `}
                  />
                ))}
              </div>

              <span className="text-sm font-light text-gray-400/40">
                {String(investigations.length).padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Auto-Play Controls - Optional, falls benötigt */}
          {autoPlay && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoPlay}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                aria-label={
                  isAutoPlaying ? "Auto-Play pausieren" : "Auto-Play starten"
                }
              >
                {isAutoPlaying ? (
                  <Pause className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                )}
                {isAutoPlaying ? "Pause" : "Start"}
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Square className="h-3 w-3" />
                  <span>Leertaste zum Pausieren/Starten</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
