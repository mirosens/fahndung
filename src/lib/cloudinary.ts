import { v2 as cloudinary } from "cloudinary";

// Cloudinary-Konfiguration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dpfpr3yxc",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Bildbearbeitungs-Optionen für Fahndungen
export interface ImageEditOptions {
  crop?: "fill" | "fit" | "limit" | "thumb" | "scale";
  width?: number;
  height?: number;
  gravity?: "auto" | "face" | "center" | "north" | "south" | "east" | "west";
  quality?: "auto" | "low" | "medium" | "high";
  format?: "auto" | "jpg" | "png" | "webp";
  effect?: "brightness" | "contrast" | "saturation" | "sharpen" | "blur";
  effectValue?: number;
}

// Erweiterte Upload-Optionen
export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
  editOptions?: ImageEditOptions;
  public_id?: string;
  overwrite?: boolean;
}

// Hilfsfunktionen für Cloudinary
export const uploadImage = async (
  file: File,
  options: CloudinaryUploadOptions = {},
): Promise<string> => {
  try {
    // Konvertiere File zu Base64
    const base64 = await fileToBase64(file);

    // Standard-Transformationen für Fahndungen
    const transformations = getTransformations(options.editOptions);

    // Upload zu Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: options.folder || "fahndungen",
      tags: options.tags || ["fahndung", "upload"],
      resource_type: "auto",
      transformation: transformations,
      public_id: options.public_id,
      overwrite: options.overwrite || false,
      eager: [
        // Verschiedene Größen für responsive Design
        { width: 1200, height: 800, crop: "limit", quality: "auto" },
        { width: 800, height: 600, crop: "limit", quality: "auto" },
        { width: 400, height: 300, crop: "limit", quality: "auto" },
        { width: 200, height: 150, crop: "limit", quality: "auto" },
      ],
      eager_async: true,
      eager_notification_url: process.env.CLOUDINARY_NOTIFICATION_URL,
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Bild-Upload fehlgeschlagen");
  }
};

// Bildbearbeitung anwenden
export const editImage = async (
  publicId: string,
  editOptions: ImageEditOptions,
): Promise<string> => {
  try {
    const transformations = getTransformations(editOptions);

    // Erstelle neue URL mit Transformationen
    const editedUrl = cloudinary.url(publicId, {
      transformation: transformations,
    });

    return editedUrl;
  } catch (error) {
    console.error("Cloudinary Edit Error:", error);
    throw new Error("Bild-Bearbeitung fehlgeschlagen");
  }
};

// Transformationen aus Edit-Optionen erstellen
const getTransformations = (editOptions?: ImageEditOptions) => {
  const transformations: any[] = [];

  if (editOptions) {
    if (editOptions.width || editOptions.height) {
      transformations.push({
        width: editOptions.width,
        height: editOptions.height,
        crop: editOptions.crop || "limit",
        gravity: editOptions.gravity || "auto",
      });
    }

    if (editOptions.quality) {
      transformations.push({
        quality: editOptions.quality,
      });
    }

    if (editOptions.format) {
      transformations.push({
        fetch_format: editOptions.format,
      });
    }

    if (editOptions.effect && editOptions.effectValue !== undefined) {
      transformations.push({
        effect: `${editOptions.effect}:${editOptions.effectValue}`,
      });
    }
  }

  // Standard-Transformationen für Fahndungen
  if (transformations.length === 0) {
    transformations.push({
      width: 1200,
      height: 800,
      crop: "limit",
      quality: "auto",
      fetch_format: "auto",
    });
  }

  return transformations;
};

// Optimierte URL für verschiedene Anwendungsfälle
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {},
): string => {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options.width || 800,
        height: options.height || 600,
        crop: options.crop || "limit",
        quality: options.quality || "auto",
        fetch_format: options.format || "auto",
      },
    ],
  });
};

// Thumbnail-URL generieren
export const getThumbnailUrl = (
  publicId: string,
  size: number = 200,
): string => {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: size,
        height: size,
        crop: "thumb",
        gravity: "face",
        quality: "auto",
      },
    ],
  });
};

// Mehrere Bilder hochladen mit Fortschritt
export const uploadMultipleImages = async (
  files: File[],
  options: CloudinaryUploadOptions = {},
  onProgress?: (progress: number) => void,
): Promise<string[]> => {
  const results: string[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const url = await uploadImage(files[i], options);
      results.push(url);

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
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw new Error("Bild-Löschung fehlgeschlagen");
  }
};

// Hilfsfunktion: File zu Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Entferne den Data URL Prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Hilfsfunktion: URL zu Public ID extrahieren
export const getPublicIdFromUrl = (url: string): string => {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  return filename.split(".")[0];
};

// Server-seitige Upload-Funktion für tRPC
export const uploadToCloudinary = async (
  buffer: Buffer,
  options: {
    folder?: string;
    tags?: string[];
    editOptions?: ImageEditOptions;
  } = {},
  contentType?: string,
) => {
  try {
    // Konvertiere Buffer zu Base64
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${contentType || "image/jpeg"};base64,${base64}`;

    // Transformationen erstellen
    const transformations = getTransformations(options.editOptions);

    // Upload zu Cloudinary
    const result = await cloudinary.uploader.upload(dataUrl, {
      folder: options.folder || "fahndungen",
      tags: options.tags || ["fahndung", "upload"],
      resource_type: "auto",
      transformation: transformations,
      eager: [
        { width: 1200, height: 800, crop: "limit", quality: "auto" },
        { width: 800, height: 600, crop: "limit", quality: "auto" },
        { width: 400, height: 300, crop: "limit", quality: "auto" },
      ],
      eager_async: true,
    });

    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Bild-Upload fehlgeschlagen");
  }
};

// Server-seitige Delete-Funktion für tRPC
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw new Error("Bild-Löschung fehlgeschlagen");
  }
};

// Bild-Metadaten abrufen
export const getImageInfo = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error("Cloudinary Info Error:", error);
    throw new Error("Bild-Informationen konnten nicht abgerufen werden");
  }
};
