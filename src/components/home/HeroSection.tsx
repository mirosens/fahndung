"use client";

import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";
import UrgentFahndungenCarousel from "./UrgentFahndungenCarousel";

interface HeroSectionProps {
  // Alert-Einstellungen
  showAlert?: boolean;
  alertText?: string;

  // Hauptinhalt
  title?: string;
  subtitle?: string;

  // Buttons
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;

  // Dringende Fahndungen
  showUrgentFahndungen?: boolean;
  urgentInvestigations?: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    tags?: string[];
    location?: string;
    created_at: string;
    updated_at: string;
    category: string;
    case_number: string;
    short_description?: string;
    station?: string;
    features?: string;
    contact_info?: Record<string, unknown>;
    images?: Array<{
      id: string;
      url: string;
      alt_text?: string;
      caption?: string;
    }>;
  }>;

  // Hintergrund
  showBackgroundSphere?: boolean;
  backgroundSphereColor?: string;
}

export default function HeroSection({
  showAlert = true,
  alertText = "Polizei sucht Zeugen",

  title = "Hinweise helfen",
  subtitle = "Unterstützen Sie die Polizei bei Ermittlungen!",

  primaryButtonText = "Hinweis abgeben",
  secondaryButtonText = "Fahndungen ansehen",

  showUrgentFahndungen = true,
  urgentInvestigations = [],

  showBackgroundSphere = false,
  backgroundSphereColor = "bg-muted",
}: HeroSectionProps) {
  return (
    <section className="relative bg-transparent" style={{ zIndex: 20 }}>
      {/* CSS um Sphere in diesem Bereich auszublenden */}
      <style jsx>{`
        .hero-section .sphere-scroll {
          display: none !important;
        }
      `}</style>

      {/* Hintergrund-Sphäre deaktiviert für globale Kugel */}
      {showBackgroundSphere && (
        <div className="absolute inset-0">
          <div
            className={`absolute -right-1/2 -top-1/2 h-full w-full rounded-full opacity-20 blur-3xl ${backgroundSphereColor} dark:bg-background`}
            style={{
              background: `radial-gradient(circle, ${backgroundSphereColor} 0%, transparent 70%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent dark:bg-background" />
        </div>
      )}

      <div className="hero-section container relative mx-auto px-4 py-12 lg:py-16">
        {/* Hauptinhalt - Zwei separate Container */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
          {/* Linker Container */}
          <div className="flex-1 space-y-6 lg:flex lg:items-center lg:justify-center">
            <div className="space-y-6 lg:max-w-md">
              {/* subtle backdrop lines */}
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 text-slate-400 opacity-[0.12] dark:text-slate-600"
                viewBox="0 0 1000 420"
                preserveAspectRatio="none"
              >
                <g fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M0,90 C220,30 520,150 1000,90" />
                  <path d="M0,180 C240,120 540,240 1000,180" />
                  <path d="M0,270 C260,210 560,330 1000,270" />
                  <path d="M0,360 C280,300 580,420 1000,360" />
                </g>
              </svg>

              {/* Eilmeldung */}
              {showAlert && (
                <div
                  role="alert"
                  aria-live="polite"
                  className="mb-6 inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-white/80 px-3.5 py-2.5 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/70"
                >
                  <span className="inline-flex size-5 items-center justify-center rounded-full border border-red-300 bg-white text-red-600">
                    <Target className="size-3.5" aria-hidden />
                  </span>
                  <strong className="text-sm tracking-wide text-slate-900 dark:text-slate-100">
                    EILMELDUNG!
                  </strong>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {alertText}
                  </span>
                  <ArrowRight
                    className="ml-1 size-4 text-slate-400"
                    aria-hidden
                  />
                </div>
              )}

              {/* Headline */}
              <h1
                className="text-4xl tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl"
                style={{ fontFamily: "'Inter-Black', Helvetica" }}
              >
                {title}
              </h1>
              <p className="mt-3 max-w-md text-lg text-slate-600 dark:text-slate-300 md:text-xl">
                {subtitle}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/fahndungen"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-base font-semibold text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:focus-visible:ring-offset-slate-900"
                >
                  {primaryButtonText}
                </Link>
                <Link
                  href="/fahndungen/neu/enhanced"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-6 py-3.5 text-base font-semibold text-white shadow hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                >
                  {secondaryButtonText}
                </Link>
              </div>
            </div>
          </div>

          {/* Rechter Container */}
          {showUrgentFahndungen && (
            <div className="flex flex-1 justify-center lg:justify-center">
              <div className="w-full max-w-sm">
                <UrgentFahndungenCarousel
                  investigations={urgentInvestigations}
                  autoPlay={false}
                  autoPlayInterval={6000}
                  showNavigation={true}
                  showDots={true}
                  showControls={true}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
