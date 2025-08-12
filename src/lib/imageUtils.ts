// Hilfsfunktionen für robuste Bildverarbeitung

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  fallbackUrl?: string;
}

// Robuste Fallback-Bilder für verschiedene Anwendungsfälle
export const FALLBACK_IMAGES = {
  default:
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&crop=center",
  person:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center",
  object:
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center",
  vehicle:
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop&crop=center",
  document:
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&crop=center",
} as const;

// Bestimme passendes Fallback-Bild basierend auf Kontext
export function getAppropriateFallback(context?: string): string {
  if (!context) return FALLBACK_IMAGES.default;

  const contextLower = context.toLowerCase();

  if (
    contextLower.includes("person") ||
    contextLower.includes("portrait") ||
    contextLower.includes("face")
  ) {
    return FALLBACK_IMAGES.person;
  } else if (
    contextLower.includes("car") ||
    contextLower.includes("vehicle") ||
    contextLower.includes("auto")
  ) {
    return FALLBACK_IMAGES.vehicle;
  } else if (
    contextLower.includes("document") ||
    contextLower.includes("paper") ||
    contextLower.includes("file")
  ) {
    return FALLBACK_IMAGES.document;
  } else if (contextLower.includes("object") || contextLower.includes("item")) {
    return FALLBACK_IMAGES.object;
  }

  return FALLBACK_IMAGES.default;
}

// Validiere Bild-URL
export async function validateImageUrl(
  url: string,
): Promise<ImageValidationResult> {
  if (!url || url.trim() === "") {
    return {
      isValid: false,
      error: "URL ist leer",
      fallbackUrl: FALLBACK_IMAGES.default,
    };
  }

  // Prüfe auf bekannte problematische URLs
  if (url.includes("via.placeholder.com")) {
    return {
      isValid: false,
      error: "Placeholder-URL erkannt",
      fallbackUrl: FALLBACK_IMAGES.default,
    };
  }

  // Prüfe auf Blob-URLs
  if (url.startsWith("blob:")) {
    try {
      const response = await fetch(url, { method: "HEAD" });
      if (!response.ok) {
        return {
          isValid: false,
          error: "Blob-URL ist ungültig",
          fallbackUrl: FALLBACK_IMAGES.default,
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: "Blob-URL konnte nicht validiert werden",
        fallbackUrl: FALLBACK_IMAGES.default,
      };
    }
  }

  // Prüfe auf gültige HTTP/HTTPS URLs
  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("blob:")
  ) {
    return {
      isValid: false,
      error: "Ungültiges URL-Format",
      fallbackUrl: FALLBACK_IMAGES.default,
    };
  }

  return { isValid: true };
}

// Erstelle optimierte Bild-URL für Cloudinary
export function createOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {},
): string {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dpfpr3yxc";

  let url = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const transformations = [];

  // Transformationen hinzufügen
  if (options.width || options.height) {
    const size = [];
    if (options.width) size.push(`w_${options.width}`);
    if (options.height) size.push(`h_${options.height}`);
    if (options.crop) size.push(`c_${options.crop}`);
    if (size.length > 0) transformations.push(size.join(","));
  }

  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }

  if (options.format) {
    transformations.push(`f_${options.format}`);
  }

  if (transformations.length > 0) {
    url += `/${transformations.join("/")}`;
  }

  url += `/${publicId}`;
  return url;
}

// Erstelle Thumbnail-URL
export function createThumbnailUrl(
  publicId: string,
  size: number = 200,
): string {
  return createOptimizedImageUrl(publicId, {
    width: size,
    height: size,
    crop: "thumb",
    quality: "auto",
  });
}

// Extrahiere Public ID aus Cloudinary-URL
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("cloudinary.com")) {
      const pathParts = urlObj.pathname.split("/");
      const uploadIndex = pathParts.findIndex((part) => part === "upload");
      if (uploadIndex !== -1 && uploadIndex + 1 < pathParts.length) {
        return pathParts
          .slice(uploadIndex + 2)
          .join("/")
          .split(".")[0];
      }
    }
  } catch (error) {
    console.warn("Fehler beim Extrahieren der Public ID:", error);
  }
  return null;
}

// Erstelle responsive Bild-URLs
export function createResponsiveImageUrls(
  publicId: string,
  sizes: number[] = [400, 800, 1200],
): Record<string, string> {
  const urls: Record<string, string> = {};

  sizes.forEach((size) => {
    urls[`${size}w`] = createOptimizedImageUrl(publicId, {
      width: size,
      quality: "auto",
      format: "auto",
    });
  });

  return urls;
}

// Validiere und repariere Bild-URL
export async function validateAndRepairImageUrl(
  url: string,
  context?: string,
): Promise<{ url: string; isValid: boolean; wasRepaired: boolean }> {
  const validation = await validateImageUrl(url);

  if (validation.isValid) {
    return { url, isValid: true, wasRepaired: false };
  }

  // Versuche URL zu reparieren
  const fallbackUrl = validation.fallbackUrl || getAppropriateFallback(context);

  return {
    url: fallbackUrl,
    isValid: false,
    wasRepaired: true,
  };
}
