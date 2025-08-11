"use client";

import * as React from "react";
import {
  Shield,
  Phone,
  MapPin,
  Building,
  Accessibility,
  ChevronDown,
  AlertTriangle,
  Users,
  Clock,
  ExternalLink,
} from "lucide-react";

import { cn } from "~/lib/utils";

interface PolizeiStandort {
  name: string;
  adresse: string;
  plz: string;
  stadt: string;
  telefon?: string;
  oeffnungszeiten?: string;
}

const polizeiStandorte: PolizeiStandort[] = [
  {
    name: "Polizeipräsidium Stuttgart",
    adresse: "Hahnemannstraße 1",
    plz: "70174",
    stadt: "Stuttgart",
    telefon: "0711 8990-0",
    oeffnungszeiten: "Mo-Fr: 8:00-18:00 Uhr",
  },
  {
    name: "Polizeipräsidium Karlsruhe",
    adresse: "Erbprinzenstraße 96",
    plz: "76133",
    stadt: "Karlsruhe",
    telefon: "0721 666-0",
    oeffnungszeiten: "Mo-Fr: 8:00-18:00 Uhr",
  },
  {
    name: "Polizeipräsidium Mannheim",
    adresse: "Collinistraße 1",
    plz: "68161",
    stadt: "Mannheim",
    telefon: "0621 174-0",
    oeffnungszeiten: "Mo-Fr: 8:00-18:00 Uhr",
  },
  {
    name: "Polizeipräsidium Freiburg",
    adresse: "Basler Landstraße 113",
    plz: "79111",
    stadt: "Freiburg",
    telefon: "0761 882-0",
    oeffnungszeiten: "Mo-Fr: 8:00-18:00 Uhr",
  },
];

const notrufnummern = [
  { name: "Polizei", nummer: "110", beschreibung: "Notruf Polizei" },
  {
    name: "Feuerwehr",
    nummer: "112",
    beschreibung: "Notruf Feuerwehr & Rettungsdienst",
  },
  {
    name: "Giftnotruf",
    nummer: "030 19240",
    beschreibung: "Giftnotrufzentrale",
  },
  {
    name: "Ärztlicher Bereitschaftsdienst",
    nummer: "116 117",
    beschreibung: "Kassenärztlicher Notdienst",
  },
];

interface SicherheitsDropdownProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function SicherheitsDropdown({
  className,
  variant = "default",
  size = "md",
}: SicherheitsDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleNotrufClick = (nummer: string) => {
    if (typeof window !== "undefined") {
      window.location.href = `tel:${nummer}`;
    }
  };

  const handleStandortClick = (standort: PolizeiStandort) => {
    const adresse = `${standort.adresse}, ${standort.plz} ${standort.stadt}`;
    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(adresse)}`;
    window.open(mapsUrl, "_blank");
  };

  const buttonVariants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
    outline: "bg-transparent hover:bg-blue-50 text-blue-600 border-blue-600",
    ghost: "bg-transparent hover:bg-blue-50 text-blue-600 border-transparent",
  };

  const sizeVariants = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          buttonVariants[variant],
          sizeVariants[size],
          className,
        )}
      >
        <Shield className="h-4 w-4" />
        <span>SICHERHEIT</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1">
          <div className="w-80 rounded-lg border bg-white p-2 shadow-lg">
            {/* Invisible Bridge */}
            <div className="absolute -top-1 left-0 h-1 w-full" />

            {/* Notrufnummern */}
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2 font-bold text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Notrufnummern
              </div>
              {notrufnummern.map((notruf) => (
                <div
                  key={notruf.nummer}
                  className="flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-red-50"
                  onClick={() => handleNotrufClick(notruf.nummer)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                      <Phone className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-red-600">
                        {notruf.nummer}
                      </div>
                      <div className="text-sm text-gray-600">
                        {notruf.beschreibung}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </div>
              ))}
            </div>

            <div className="mb-4 h-px bg-gray-200" />

            {/* Dienststellen */}
            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2 font-bold text-blue-600">
                <Building className="h-4 w-4" />
                Dienststellen
              </div>
              <div className="mb-2 flex items-center gap-2 rounded-lg p-3 transition-colors hover:bg-blue-50">
                <MapPin className="h-4 w-4" />
                <span>Standorte und Öffnungszeiten</span>
                <ChevronDown className="ml-auto h-4 w-4" />
              </div>
              <div className="ml-4 space-y-2">
                {polizeiStandorte.map((standort) => (
                  <div
                    key={standort.name}
                    className="flex cursor-pointer flex-col items-start gap-2 rounded-lg p-3 transition-colors hover:bg-blue-50"
                    onClick={() => handleStandortClick(standort)}
                  >
                    <div className="flex w-full items-center gap-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <div className="font-semibold text-blue-600">
                          {standort.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {standort.adresse}
                        </div>
                        <div className="text-sm text-gray-600">
                          {standort.plz} {standort.stadt}
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                    {standort.telefon && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="h-3 w-3" />
                        <span>{standort.telefon}</span>
                      </div>
                    )}
                    {standort.oeffnungszeiten && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{standort.oeffnungszeiten}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 h-px bg-gray-200" />

            {/* Barrierefreiheit */}
            <div>
              <div className="mb-2 flex items-center gap-2 font-bold text-green-600">
                <Accessibility className="h-4 w-4" />
                Barrierefreiheit
              </div>
              <div className="flex items-center gap-2 rounded-lg p-3 transition-colors hover:bg-green-50">
                <Users className="h-4 w-4 text-green-600" />
                <span>Leichte Sprache und Gebärdensprache</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
