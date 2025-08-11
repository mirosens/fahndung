"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

// Leaflet Typen definieren
interface LeafletMap {
  remove(): void;
  setView(center: [number, number], zoom: number): LeafletMap;
}

interface LeafletStatic {
  map(element: HTMLElement): LeafletMap;
  tileLayer(
    url: string,
    options: Record<string, unknown>,
  ): {
    addTo(map: LeafletMap): void;
  };
  circleMarker(
    latlng: [number, number],
    options: Record<string, unknown>,
  ): {
    addTo(map: LeafletMap): void;
    bindPopup(content: string): void;
    on(event: string, handler: () => void): void;
  };
  circle(
    latlng: [number, number],
    options: Record<string, unknown>,
  ): {
    addTo(map: LeafletMap): void;
  };
}

declare global {
  interface Window {
    L: LeafletStatic;
  }
}

export interface MapLocation {
  id: string;
  address: string;
  lat: number;
  lng: number;
  type:
    | "main"
    | "tatort"
    | "wohnort"
    | "arbeitsplatz"
    | "sichtung"
    | "sonstiges";
  description?: string;
  timestamp?: Date;
}

interface SimpleMapProps {
  locations: MapLocation[];
  center: [number, number];
  zoom: number;
  height: string;
  searchRadius?: number;
  showRadius?: boolean;
  editable?: boolean;
  onLocationClick?: (location: MapLocation) => void;
  onLocationRemove?: (id: string) => void;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  locations,
  center,
  zoom = 13,
  height,
  searchRadius = 5,
  showRadius = true,
  editable = false,
  onLocationClick,
  onLocationRemove,
}) => {
  const [mapError, setMapError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  const getLocationTypeLabel = (type: MapLocation["type"]) => {
    const labels = {
      main: "Hauptort",
      tatort: "Tatort",
      wohnort: "Wohnort",
      arbeitsplatz: "Arbeitsplatz",
      sichtung: "Sichtung",
      sonstiges: "Sonstiges",
    };
    return labels[type] ?? "Sonstiges";
  };

  const getLocationTypeColor = (type: MapLocation["type"]) => {
    const colors = {
      main: "#3b82f6", // blue-500
      tatort: "#ef4444", // red-500
      wohnort: "#22c55e", // green-500
      arbeitsplatz: "#eab308", // yellow-500
      sichtung: "#f97316", // orange-500
      sonstiges: "#6b7280", // gray-500
    };
    return colors[type] ?? "#6b7280";
  };

  const mainLocation = locations.find((loc) => loc.type === "main");

  // Lade Leaflet dynamisch
  const loadLeaflet = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      // Lade Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }

      // Lade Leaflet JS
      if (!window.L) {
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.integrity =
          "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
        script.crossOrigin = "";
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
    } catch (error) {
      console.error("Fehler beim Laden von Leaflet:", error);
      setMapError(true);
    }
  }, []);

  // Initialisiere Karte
  const initMap = useCallback(async () => {
    if (!mapRef.current || typeof window === "undefined") return;

    try {
      await loadLeaflet();
      const L = window.L;

      if (!L) {
        throw new Error("Leaflet nicht verfügbar");
      }

      // Zerstöre alte Karte falls vorhanden
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Erstelle neue Karte
      const map = L.map(mapRef.current).setView(center, zoom);
      mapInstanceRef.current = map;

      // Füge OpenStreetMap Tile Layer hinzu
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Füge Markierungen hinzu
      locations.forEach((location) => {
        const marker = L.circleMarker([location.lat, location.lng], {
          radius: 8,
          fillColor: getLocationTypeColor(location.type),
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        });

        marker.addTo(map);

        // Popup mit Informationen
        const popupContent = `
          <div class="p-2">
            <h3 class="font-semibold">${getLocationTypeLabel(location.type)}</h3>
            <p class="text-sm">${location.address}</p>
            ${location.description ? `<p class="text-xs text-gray-600">${location.description}</p>` : ""}
            <p class="text-xs text-gray-500">${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}</p>
          </div>
        `;
        marker.bindPopup(popupContent);

        // Click Handler
        marker.on("click", () => {
          onLocationClick?.(location);
        });
      });

      // Füge Suchradius hinzu
      if (showRadius && mainLocation) {
        const circle = L.circle([mainLocation.lat, mainLocation.lng], {
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.1,
          radius: searchRadius * 1000, // Konvertiere km zu Metern
        });
        circle.addTo(map);
      }

      setIsLoading(false);
      setMapError(false);
    } catch (error) {
      console.error("Fehler beim Initialisieren der Karte:", error);
      setMapError(true);
      setIsLoading(false);
    }
  }, [
    locations,
    center,
    zoom,
    searchRadius,
    showRadius,
    onLocationClick,
    loadLeaflet,
    mainLocation,
  ]);

  useEffect(() => {
    void initMap();
  }, [initMap]);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  const retryLoadMap = () => {
    setIsLoading(true);
    setMapError(false);
    void initMap();
  };

  return (
    <div className="relative" style={{ height }}>
      {/* Karte Container */}
      <div className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-muted dark:border-border dark:bg-muted">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
            <div className="flex items-center gap-2 text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm">Lade Karte...</span>
            </div>
          </div>
        )}

        {mapError && !isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
            <div className="text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Karte konnte nicht geladen werden
              </p>
              <button
                onClick={retryLoadMap}
                className="mt-2 rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
              >
                Erneut versuchen
              </button>
            </div>
          </div>
        )}

        {/* Leaflet Karte */}
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* Legende */}
      <div className="mt-2 rounded-lg bg-white p-3 shadow-sm dark:bg-muted">
        <h4 className="mb-2 text-sm font-medium">Standorte</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {locations.map((location) => (
            <div key={location.id} className="flex items-center space-x-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getLocationTypeColor(location.type) }}
              />
              <span>{getLocationTypeLabel(location.type)}</span>
              {editable && onLocationRemove && (
                <button
                  onClick={() => onLocationRemove(location.id)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Koordinaten-Info */}
        <div className="mt-2 border-t border-border pt-2 dark:border-border">
          <p className="text-xs text-muted-foreground">
            Zentrum: {center[0].toFixed(4)}, {center[1].toFixed(4)}
          </p>
          {mainLocation && (
            <p className="text-xs text-muted-foreground">
              Hauptort: {mainLocation.lat.toFixed(4)},{" "}
              {mainLocation.lng.toFixed(4)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleMap;
