"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Search,
  Image as ImageIcon,
  Loader2,
  Check,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CloudinaryMediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, publicId: string) => void;
  onSelectMultipleImages?: (
    images: Array<{ url: string; publicId: string }>,
  ) => void;
  cloudName: string;
  multiple?: boolean;
}

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  tags?: string[];
}

interface CloudinaryAsset {
  secure_url: string;
  public_id: string;
}

interface CloudinaryWidgetData {
  assets: CloudinaryAsset[];
}

interface CloudinaryWidget {
  open: () => void;
}

interface CloudinaryConfig {
  cloudName: string;
  insertCaption: string;
  multiple: boolean;
  maxFiles: number;
  searchByRights: boolean;
  showAdvancedOptions: boolean;
  showInsecureSource: boolean;
  showUploadMoreButton: boolean;
  showPoweredBy: boolean;
  showPublicId: boolean;
  showUrl: boolean;
  transformation: {
    crop: string;
    width: number;
    height: number;
  };
}

interface CloudinaryOptions {
  insertHandler: (data: CloudinaryWidgetData) => void;
}

export default function CloudinaryMediaLibrary({
  isOpen,
  onClose,
  onSelectImage,
  onSelectMultipleImages,
  cloudName,
  multiple = false,
}: CloudinaryMediaLibraryProps) {
  const [resources, setResources] = useState<CloudinaryResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  // Alternative: REST API für Media Library (falls Widget nicht funktioniert)
  const fetchMediaLibrary = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      try {
        console.log("🔍 Lade Media Library über REST API");

        // Echte Cloudinary-API für Produktion
        const response = await fetch(
          `/api/cloudinary/resources?search=${encodeURIComponent(searchTerm)}&force_refresh=${forceRefresh}`,
        );

        if (response.ok) {
          const data = (await response.json()) as {
            resources?: CloudinaryResource[];
          };
          setResources(data.resources ?? []);
          setLastSync(new Date());
          console.log("✅ Media Library erfolgreich geladen:", data.resources?.length ?? 0, "Bilder");
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      } catch (error) {
        console.error("Fehler beim Laden der Media Library:", error);
        // Fallback zu echten Cloudinary-Bildern bei Fehler
        console.log("📸 Verwende Fallback-Bilder bei API-Fehler");
        setResources([
          {
            public_id: "fahndungen/uploads/fallback1",
            secure_url:
              "https://res.cloudinary.com/dpfpr3yxc/image/upload/v1754983515/fahndungen/uploads/fallback1.jpg",
            width: 800,
            height: 600,
            format: "jpg",
            created_at: "2024-01-01T00:00:00Z",
            tags: ["fallback", "fahndung"],
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm],
  );

  // Cloudinary Media Library Widget laden
  useEffect(() => {
    if (!isOpen) return;

    const loadCloudinaryWidget = () => {
      // Prüfe ob Widget bereits geladen ist
      if (window.cloudinary && window.cloudinary.createMediaLibrary) {
        console.log("✅ Cloudinary Widget bereits geladen");
        setWidgetLoaded(true);
        return;
      }

      // Cloudinary Widget Script laden
      const script = document.createElement("script");
      script.src = "https://media-library.cloudinary.com/global/all.js";
      script.async = true;
      script.onload = () => {
        console.log("✅ Cloudinary Media Library Script geladen");
        
        // Warte kurz und prüfe dann erneut
        setTimeout(() => {
          if (window.cloudinary && window.cloudinary.createMediaLibrary) {
            console.log("✅ Cloudinary Widget erfolgreich initialisiert");
            setWidgetLoaded(true);
          } else {
            console.warn("⚠️ Cloudinary Widget nicht verfügbar, verwende REST API");
            setWidgetLoaded(false);
            void fetchMediaLibrary();
          }
        }, 1000);
      };
      
      script.onerror = () => {
        console.error("❌ Fehler beim Laden des Cloudinary Scripts");
        setWidgetLoaded(false);
        void fetchMediaLibrary();
      };
      
      document.head.appendChild(script);

      return () => {
        // Script entfernen beim Cleanup
        const existingScript = document.querySelector(
          'script[src*="media-library.cloudinary.com"]',
        );
        if (existingScript) {
          existingScript.remove();
        }
      };
    };

    loadCloudinaryWidget();
  }, [isOpen, fetchMediaLibrary]);

  // Widget öffnen wenn geladen
  useEffect(() => {
    if (!isOpen || !widgetLoaded) return;

    const openWidget = () => {
      if (!window.cloudinary || !window.cloudinary.createMediaLibrary) {
        console.warn("⚠️ Cloudinary Widget nicht verfügbar");
        return;
      }

      try {
        const config: CloudinaryConfig = {
          cloudName: cloudName,
          insertCaption: "Bild auswählen",
          multiple: multiple,
          maxFiles: multiple ? 10 : 1,
          searchByRights: false,
          showAdvancedOptions: false,
          showInsecureSource: false,
          showUploadMoreButton: false,
          showPoweredBy: false,
          showPublicId: false,
          showUrl: false,
          transformation: {
            crop: "limit",
            width: 800,
            height: 600,
          },
        };

        const options: CloudinaryOptions = {
          insertHandler: (data: CloudinaryWidgetData) => {
            console.log("✅ Widget Handler aufgerufen:", data);
            if (data.assets && data.assets.length > 0) {
              if (multiple && onSelectMultipleImages) {
                const images = data.assets.map((asset: CloudinaryAsset) => ({
                  url: asset.secure_url,
                  publicId: asset.public_id,
                }));
                onSelectMultipleImages(images);
              } else {
                const asset = data.assets[0];
                if (asset) {
                  onSelectImage(asset.secure_url, asset.public_id);
                }
              }
              onClose();
            }
          },
        };

        const widget: CloudinaryWidget = window.cloudinary.createMediaLibrary(
          config,
          options,
        );

        // Widget öffnen
        widget.open();
      } catch (error) {
        console.error("❌ Fehler beim Öffnen des Widgets:", error);
        // Fallback zu REST API
        void fetchMediaLibrary();
      }
    };

    // Kurze Verzögerung für Widget-Initialisierung
    const timer = setTimeout(openWidget, 500);
    return () => clearTimeout(timer);
  }, [isOpen, widgetLoaded, cloudName, onSelectImage, onClose, multiple, onSelectMultipleImages, fetchMediaLibrary]);

  // Lade Bilder beim Öffnen der Media Library (nur wenn Widget nicht verfügbar)
  useEffect(() => {
    if (isOpen && !widgetLoaded) {
      void fetchMediaLibrary();
    }
  }, [isOpen, widgetLoaded, fetchMediaLibrary]);

  // Automatische Synchronisation alle 30 Sekunden (nur wenn Widget nicht verfügbar)
  useEffect(() => {
    if (!isOpen || widgetLoaded) return;

    const interval = setInterval(() => {
      void fetchMediaLibrary(true); // Force refresh
    }, 30000); // 30 Sekunden

    return () => clearInterval(interval);
  }, [isOpen, widgetLoaded, fetchMediaLibrary]);

  // Manuelle Synchronisation
  const handleManualSync = () => {
    void fetchMediaLibrary(true);
  };

  // Wenn Widget geladen ist, zeige nur Widget-Button
  if (isOpen && widgetLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cloudinary Media Library
              </h2>
              <p className="text-xs text-muted-foreground">
                Widget wird geöffnet...
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Loading State */}
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Öffne Media Library Widget...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cloudinary Media Library
            </h2>
            {lastSync && (
              <p className="text-xs text-muted-foreground">
                Letzte Synchronisation: {lastSync.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleManualSync}
              disabled={loading}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              title="Media Library synchronisieren"
            >
              <RefreshCw className={cn("h-5 w-5", loading && "animate-spin")} />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nach Bildern suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void fetchMediaLibrary();
                  }
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-10 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
              <button
                onClick={() => void fetchMediaLibrary()}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Search className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Lade Bilder...
              </span>
            </div>
          )}

          {/* Image Grid */}
          {!loading && resources.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {resources.map((resource) => (
                <div
                  key={resource.public_id}
                  className={`group relative cursor-pointer rounded-lg border-2 transition-all hover:border-blue-500 ${
                    selectedImages.has(resource.public_id)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  onClick={() => {
                    if (multiple) {
                      setSelectedImages((prev) => {
                        const newSet = new Set(prev);
                        if (newSet.has(resource.public_id)) {
                          newSet.delete(resource.public_id);
                        } else {
                          newSet.add(resource.public_id);
                        }
                        return newSet;
                      });
                    } else {
                      setSelectedImages(new Set([resource.public_id]));
                    }
                  }}
                >
                  <Image
                    src={resource.secure_url}
                    alt={resource.public_id}
                    width={200}
                    height={128}
                    className="h-32 w-full rounded-lg object-cover"
                    onError={(e) => {
                      // Fallback bei Fehler
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/200x128/6B7280/FFFFFF?text=${encodeURIComponent(resource.public_id.split("/").pop() ?? "Image")}`;
                    }}
                  />

                  {/* Tags anzeigen */}
                  {resource.tags && resource.tags.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="rounded bg-blue-600 px-1 text-xs text-white"
                          >
                            {tag}
                          </span>
                        ))}
                        {resource.tags.length > 2 && (
                          <span className="text-xs text-white">
                            +{resource.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedImages.has(resource.public_id) && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-blue-500/20">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && resources.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <ImageIcon className="h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Keine Bilder gefunden
              </p>
              {searchTerm && (
                <p className="text-sm text-gray-500">
                  Versuchen Sie einen anderen Suchbegriff
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-gray-200 p-4 dark:border-gray-700">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            Abbrechen
          </button>
          {selectedImages.size > 0 && (
            <button
              onClick={() => {
                if (multiple && onSelectMultipleImages) {
                  const selectedResources = resources.filter((r) =>
                    selectedImages.has(r.public_id),
                  );
                  const images = selectedResources.map((r) => ({
                    url: r.secure_url,
                    publicId: r.public_id,
                  }));
                  onSelectMultipleImages(images);
                } else {
                  const selectedId = Array.from(selectedImages)[0];
                  const resource = resources.find(
                    (r) => r.public_id === selectedId,
                  );
                  if (resource) {
                    onSelectImage(resource.secure_url, resource.public_id);
                  }
                }
                onClose();
              }}
              className="ml-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              {multiple
                ? `${selectedImages.size} Bilder auswählen`
                : "Bild auswählen"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// TypeScript Deklaration für Cloudinary Widget
declare global {
  interface Window {
    cloudinary: {
      createMediaLibrary: (
        config: CloudinaryConfig,
        options: CloudinaryOptions,
      ) => CloudinaryWidget;
    };
  }
}
