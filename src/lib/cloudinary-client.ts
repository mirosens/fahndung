// Client-seitige Cloudinary-Integration
// Diese Datei enthält nur Browser-kompatible Funktionen

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
  public_id?: string;
  overwrite?: boolean;
  editOptions?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
    format?: string;
  };
}

// Robuste Platzhalterbilder für verschiedene Anwendungsfälle
const PLACEHOLDER_IMAGES = {
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
};

// cloudinary-client.ts
export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {},
) {
  // 🚀 PROTOYP-MODUS: Prüfe ob Prototyp-Modus aktiv ist
  // Deaktiviert für echte Cloudinary-Uploads
  const isPrototypeMode = false;

  // 🚀 PROTOYP-MODUS: Verwende echte Uploads auch im Entwicklungsmodus
  if (isPrototypeMode) {
    console.log("🚀 Prototyp-Modus: Verwende echte Cloudinary-Uploads");

    // Verwende echte Cloudinary-Uploads auch im Entwicklungsmodus
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error ?? `Upload failed (${res.status})`);
      }
      return payload.data; // enthält secure_url, public_id, etc.
    } catch (error) {
      console.error("❌ Echter Upload-Fehler:", error);
      // Nur bei echten Fehlern Fallback verwenden
      return {
        public_id: `fahndungen/fallback_${Date.now()}`,
        secure_url: PLACEHOLDER_IMAGES.default,
        width: 800,
        height: 600,
        format: file.type.split("/")[1] || "jpg",
        bytes: file.size,
        created_at: new Date().toISOString(),
      };
    }
  }

  // Normale Upload-Logik für Produktion
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok || !payload?.success) {
      throw new Error(payload?.error ?? `Upload failed (${res.status})`);
    }
    return payload.data; // enthält secure_url, public_id, etc.
  } catch (error) {
    console.error("❌ Upload-Fehler:", error);
    // Fallback zu Platzhalterbild bei Upload-Fehlern
    return {
      public_id: `fahndungen/fallback_${Date.now()}`,
      secure_url: PLACEHOLDER_IMAGES.default,
      width: 800,
      height: 600,
      format: file.type.split("/")[1] || "jpg",
      bytes: file.size,
      created_at: new Date().toISOString(),
    };
  }
}

// Optimierte URL für verschiedene Anwendungsfälle
export function getOptimizedImageUrl(
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

  // Baue Cloudinary-URL manuell
  let url = `https://res.cloudinary.com/${cloudName}/image/upload`;

  // Transformationen hinzufügen
  const transformations = [];

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

// Thumbnail-URL generieren
export function getThumbnailUrl(publicId: string, size: number = 200): string {
  return getOptimizedImageUrl(publicId, {
    width: size,
    height: size,
    crop: "thumb",
    quality: "auto",
  });
}

// Public ID aus URL extrahieren
export function getPublicIdFromUrl(url: string): string {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0];
}

// Bildbearbeitung über Cloudinary-URLs
export function editImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    gravity?: string;
    quality?: string;
    format?: string;
    effect?: string;
    effectValue?: number;
  } = {},
): string {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dpfpr3yxc";

  let url = `https://res.cloudinary.com/${cloudName}/image/upload`;
  const transformations = [];

  // Größe und Zuschnitt
  if (options.width || options.height) {
    const size = [];
    if (options.width) size.push(`w_${options.width}`);
    if (options.height) size.push(`h_${options.height}`);
    if (options.crop) size.push(`c_${options.crop}`);
    if (options.gravity) size.push(`g_${options.gravity}`);
    if (size.length > 0) transformations.push(size.join(","));
  }

  // Qualität
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }

  // Format
  if (options.format) {
    transformations.push(`f_${options.format}`);
  }

  // Effekte
  if (options.effect && options.effectValue !== undefined) {
    transformations.push(`e_${options.effect}:${options.effectValue}`);
  }

  if (transformations.length > 0) {
    url += `/${transformations.join("/")}`;
  }

  url += `/${publicId}`;

  return url;
}

// Mehrere Bilder hochladen
export async function uploadMultipleImages(
  files: File[],
  options: CloudinaryUploadOptions = {},
  onProgress?: (progress: number) => void,
): Promise<CloudinaryUploadResult[]> {
  const results: CloudinaryUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await uploadToCloudinary(files[i], options);
      results.push(result);

      // Progress-Callback
      if (onProgress) {
        const progress = ((i + 1) / files.length) * 100;
        onProgress(progress);
      }
    } catch (error) {
      console.error(`Fehler beim Upload von ${files[i].name}:`, error);
      throw error;
    }
  }

  return results;
}
