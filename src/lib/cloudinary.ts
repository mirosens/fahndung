import { v2 as cloudinary } from "cloudinary";

// Cloudinary Konfiguration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

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
  transformation?: any;
  public_id?: string;
}

/**
 * Upload ein Bild zu Cloudinary
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: CloudinaryUploadOptions = {},
  mimeType?: string,
): Promise<CloudinaryUploadResult> {
  try {
    const uploadOptions = {
      folder: options.folder || "fahndung",
      tags: options.tags || [],
      transformation: options.transformation,
      public_id: options.public_id,
    };

    // Wenn es ein Buffer ist, konvertiere zu Base64 mit korrektem MIME-Type
    let uploadData: string;
    if (Buffer.isBuffer(file)) {
      const mime = mimeType || "image/jpeg";
      uploadData = `data:${mime};base64,${file.toString("base64")}`;
    } else {
      uploadData = file;
    }

    const result = await cloudinary.uploader.upload(uploadData, uploadOptions);

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error(
      `Upload zu Cloudinary fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
    );
  }
}

/**
 * Generiere optimierte URL für Cloudinary-Bilder
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "jpg" | "png";
    crop?: "fill" | "fit" | "scale" | "thumb";
  } = {},
): string {
  const transformation = {
    width: options.width,
    height: options.height,
    quality: options.quality || "auto",
    fetch_format: options.format || "auto",
    crop: options.crop || "fill",
  };

  return cloudinary.url(publicId, transformation);
}

/**
 * Lösche ein Bild von Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw new Error(
      `Löschen von Cloudinary fehlgeschlagen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
    );
  }
}

export { cloudinary };
