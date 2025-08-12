"use client";

import React, { useState, useEffect } from "react";
import { X, Search, Image as ImageIcon, Loader2, Check } from "lucide-react";

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

  // 🚀 PROTOYP-MODUS: Prüfe ob Prototyp-Modus aktiv ist
  const isPrototypeMode =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_PROTOTYPE_MODE === "true";

  // Cloudinary Media Library Widget laden
  useEffect(() => {
    if (!isOpen) return;

    // 🚀 PROTOYP-MODUS: Verwende REST API statt Widget
    if (isPrototypeMode) {
      console.log("🚀 Prototyp-Modus: Verwende REST API für Media Library");
      void fetchMediaLibrary();
      return;
    }

    const loadCloudinaryWidget = () => {
      // Cloudinary Widget Script laden
      const script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      script.onload = () => {
        // Widget initialisieren
        if (window.cloudinary) {
          const widget = window.cloudinary.createMediaLibrary(
            {
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
            },
            {
              insertHandler: (data: any) => {
                if (data.assets && data.assets.length > 0) {
                  if (multiple && onSelectMultipleImages) {
                    const images = data.assets.map((asset: any) => ({
                      url: asset.secure_url,
                      publicId: asset.public_id,
                    }));
                    onSelectMultipleImages(images);
                  } else {
                    const asset = data.assets[0];
                    onSelectImage(asset.secure_url, asset.public_id);
                  }
                  onClose();
                }
              },
            },
          );

          // Widget öffnen
          widget.open();
        }
      };
      document.head.appendChild(script);

      return () => {
        // Script entfernen beim Cleanup
        const existingScript = document.querySelector(
          'script[src*="upload-widget.cloudinary.com"]',
        );
        if (existingScript) {
          existingScript.remove();
        }
      };
    };

    loadCloudinaryWidget();
  }, [isOpen, cloudName, onSelectImage, onClose, isPrototypeMode]);

  // Alternative: REST API für Media Library (falls Widget nicht funktioniert)
  const fetchMediaLibrary = async () => {
    setLoading(true);
    try {
      // 🚀 PROTOYP-MODUS: Verwende Mock-Daten falls API nicht verfügbar
      if (isPrototypeMode) {
        console.log("🚀 Prototyp-Modus: Verwende Mock-Daten für Media Library");
        // Mock-Daten für Prototyp-Modus
        const mockResources: CloudinaryResource[] = [
          {
            public_id: "fahndungen/sample1",
            secure_url:
              "https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Sample+Image+1",
            width: 800,
            height: 600,
            format: "jpg",
            created_at: "2024-01-01T00:00:00Z",
            tags: ["sample", "fahndung"],
          },
          {
            public_id: "fahndungen/sample2",
            secure_url:
              "https://via.placeholder.com/1200x800/10B981/FFFFFF?text=Sample+Image+2",
            width: 1200,
            height: 800,
            format: "jpg",
            created_at: "2024-01-01T00:00:00Z",
            tags: ["sample", "fahndung"],
          },
          {
            public_id: "fahndungen/sample3",
            secure_url:
              "https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=Sample+Image+3",
            width: 600,
            height: 400,
            format: "jpg",
            created_at: "2024-01-01T00:00:00Z",
            tags: ["sample", "fahndung"],
          },
          {
            public_id: "fahndungen/sample4",
            secure_url:
              "https://via.placeholder.com/800x600/EF4444/FFFFFF?text=Sample+Image+4",
            width: 800,
            height: 600,
            format: "jpg",
            created_at: "2024-01-01T00:00:00Z",
            tags: ["sample", "fahndung"],
          },
          {
            public_id: "fahndungen/sample5",
            secure_url:
              "https://via.placeholder.com/1000x700/8B5CF6/FFFFFF?text=Sample+Image+5",
            width: 1000,
            height: 700,
            format: "jpg",
            created_at: "2024-01-01T00:00:00Z",
            tags: ["sample", "fahndung"],
          },
          {
            public_id: "fahndungen/sample6",
            secure_url:
              "https://via.placeholder.com/900x600/06B6D4/FFFFFF?text=Sample+Image+6",
            width: 900,
            height: 600,
            format: "jpg",
            created_at: "2024-01-01T00:00:00Z",
            tags: ["sample", "fahndung"],
          },
        ];

        // Filtere nach Suchbegriff
        const filteredResources = searchTerm
          ? mockResources.filter(
              (resource) =>
                resource.public_id
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                resource.tags?.some((tag) =>
                  tag.toLowerCase().includes(searchTerm.toLowerCase()),
                ),
            )
          : mockResources;

        setResources(filteredResources);
        return;
      }

      const response = await fetch(
        `/api/cloudinary/resources?search=${searchTerm}`,
      );
      if (response.ok) {
        const data = await response.json();
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Media Library:", error);
      // 🚀 PROTOYP-MODUS: Fallback zu Mock-Daten bei Fehler
      if (isPrototypeMode) {
        console.log("🚀 Prototyp-Modus: Fallback zu Mock-Daten bei API-Fehler");
        setResources([
          {
            public_id: "fahndungen/fallback1",
            secure_url:
              "https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Sample+Image+1",
            width: 800,
            height: 600,
            format: "jpg",
            created_at: "2024-01-01T00:00:00Z",
            tags: ["fallback", "sample"],
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Lade Bilder beim Öffnen der Media Library (nur wenn nicht im Prototyp-Modus)
  useEffect(() => {
    if (isOpen && !isPrototypeMode) {
      void fetchMediaLibrary();
    }
  }, [isOpen, searchTerm, isPrototypeMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Cloudinary Media Library
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
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
                  <img
                    src={resource.secure_url}
                    alt={resource.public_id}
                    className="h-32 w-full rounded-lg object-cover"
                    onError={(e) => {
                      // Fallback bei Fehler
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/200x128/6B7280/FFFFFF?text=${encodeURIComponent(resource.public_id.split("/").pop() || "Image")}`;
                    }}
                  />
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
      createMediaLibrary: (config: any, options: any) => any;
    };
  }
}
