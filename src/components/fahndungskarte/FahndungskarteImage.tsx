"use client";

import React, { useState, useEffect } from "react";
import { Eye, Image as ImageIcon, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";

interface FahndungskarteImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  showPlaceholder?: boolean;
  onClick?: () => void;
  priority?: boolean;
}

export default function FahndungskarteImage({
  src,
  alt = "Fahndungsbild",
  className = "",
  fallbackSrc = "/images/placeholder-image.jpg",
  showPlaceholder = true,
  onClick,
  priority = false,
}: FahndungskarteImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(src || null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Debug-Logging für Bildprobleme
  useEffect(() => {
    console.log("🖼️ FahndungskarteImage Debug:", {
      originalSrc: src,
      imageSrc,
      hasError,
      isLoading,
      isImageLoaded,
    });
  }, [src, imageSrc, hasError, isLoading, isImageLoaded]);

  // Aktualisiere Bildquelle wenn sich src ändert
  useEffect(() => {
    if (src) {
      setImageSrc(src);
      setIsLoading(true);
      setHasError(false);
      setIsImageLoaded(false);
    }
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setIsImageLoaded(true);
    setHasError(false);
    console.log("✅ Bild erfolgreich geladen:", imageSrc);
  };

  const handleImageError = () => {
    console.error("❌ Bildfehler für:", imageSrc);
    setIsLoading(false);
    setHasError(true);
    
    // Versuche Fallback-Bild
    if (imageSrc !== fallbackSrc) {
      console.log("🔄 Versuche Fallback-Bild:", fallbackSrc);
      setImageSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
    }
  };

  // Zeige Placeholder wenn kein Bild verfügbar
  if (!imageSrc && showPlaceholder) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted dark:bg-muted",
          "min-h-[200px] rounded-lg border-2 border-dashed border-muted-foreground/20",
          className
        )}
        onClick={onClick}
      >
        <div className="text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground/70">
            Kein Bild verfügbar
          </p>
        </div>
      </div>
    );
  }

  // Zeige Fehler-Zustand
  if (hasError && !isLoading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted dark:bg-muted",
          "min-h-[200px] rounded-lg border-2 border-dashed border-red-200",
          className
        )}
        onClick={onClick}
      >
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            Bild konnte nicht geladen werden
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Loading-Zustand */}
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-muted dark:bg-muted",
            "rounded-lg animate-pulse",
            className
          )}
        >
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-2 text-xs text-muted-foreground">
              Lade Bild...
            </p>
          </div>
        </div>
      )}

      {/* Hauptbild */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            "w-full h-auto object-cover rounded-lg transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            onClick ? "cursor-pointer hover:opacity-90" : "",
            className
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onClick={onClick}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      )}

      {/* Klick-Indikator */}
      {onClick && isImageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
          <div className="bg-black/50 rounded-full p-2">
            <Eye className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}
