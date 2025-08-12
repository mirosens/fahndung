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
}

// cloudinary-client.ts
export async function uploadToCloudinary(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || !payload?.success) {
    throw new Error(payload?.error ?? `Upload failed (${res.status})`);
  }
  return payload.data; // enthält secure_url, public_id, etc.
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
