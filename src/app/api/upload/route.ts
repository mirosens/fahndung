export const runtime = "nodejs"; // <-- wichtig: nicht Edge

import { NextResponse } from "next/server";
import crypto from "node:crypto";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

// Hilfsfunktion für Fallback-Response
function createFallbackResponse(file: File) {
  return {
    public_id: `fahndungen/fallback_${Date.now()}`,
    secure_url:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=600&fit=crop&crop=center",
    width: 800,
    height: 600,
    format: file.type.split("/")[1] ?? "jpg",
    bytes: file.size,
    created_at: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const tags = form.get("tags") as string | null;
    const context = form.get("context") as string | null;

    if (!file)
      return NextResponse.json(
        { success: false, error: "No file" },
        { status: 400 },
      );

    // Prüfe Dateityp
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type" },
        { status: 400 },
      );
    }

    // Prüfe Dateigröße (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large" },
        { status: 400 },
      );
    }

    // Normale Upload-Logik für Produktion
    const cloudName = required("CLOUDINARY_CLOUD_NAME");
    const apiKey = required("CLOUDINARY_API_KEY");
    const apiSecret = required("CLOUDINARY_API_SECRET");

    // --- Upload-Parameter ---
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "fahndungen/uploads";
    const uploadTags = parseTags(tags, context);

    // Signatur: alphabetisch sortierte Param-String + API_SECRET
    const params = {
      folder: folder,
      timestamp: timestamp,
    };

    // Tags hinzufügen falls vorhanden
    if (uploadTags.length > 0) {
      params.tags = uploadTags.join(",");
    }

    // Alphabetisch sortierte Parameter für Signatur
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join("&");

    console.log("🔍 Signatur-Parameter:", sortedParams);

    const signature = crypto
      .createHash("sha1")
      .update(sortedParams + apiSecret)
      .digest("hex");

    console.log("🔍 Generierte Signatur:", signature);

    // --- Request an Cloudinary ---
    const body = new FormData();
    body.append(
      "file",
      new Blob([new Uint8Array(await file.arrayBuffer())], { type: file.type }),
      file.name,
    );
    body.append("api_key", apiKey);
    body.append("timestamp", String(timestamp));
    body.append("folder", folder);
    body.append("signature", signature);

    // Tags hinzufügen
    if (uploadTags.length > 0) {
      body.append("tags", uploadTags.join(","));
    }

    console.log("🚀 Sende Upload an Cloudinary:", {
      cloudName,
      apiKey: apiKey.substring(0, 8) + "...",
      timestamp,
      folder,
      signature: signature.substring(0, 8) + "...",
      tags: uploadTags,
    });

    // Timeout für Cloudinary-Request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 Sekunden

    try {
      const resp = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body,
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      const json = (await resp.json()) as { error?: { message?: string } };
      
      console.log("📡 Cloudinary Response Status:", resp.status);
      console.log("📡 Cloudinary Response:", json);

      if (!resp.ok) {
        console.error("❌ Cloudinary Upload-Fehler:", json?.error?.message);

        // Bei Cloudinary-Fehlern verwende lokales Fallback-Bild
        const fallbackData = {
          public_id: `fahndungen/uploads/fallback_${Date.now()}`,
          secure_url: "/images/placeholders/fotos/platzhalterbild.svg",
          width: 800,
          height: 600,
          format: file.type.split("/")[1] ?? "svg",
          bytes: file.size,
          created_at: new Date().toISOString(),
        };
        return NextResponse.json(
          {
            success: true,
            data: fallbackData,
            warning: "Cloudinary upload failed, using fallback image",
          },
          { status: 200 },
        );
      }

      // Erfolgreicher Upload - füge zusätzliche Metadaten hinzu
      const uploadResult = {
        ...json,
        tags: uploadTags,
        context: context,
        uploaded_at: new Date().toISOString(),
      };

      // Füge das neue Bild zur Media Library hinzu
      console.log("📸 Neues Bild zur Media Library hinzugefügt:", {
        public_id: (json as any).public_id,
        secure_url: (json as any).secure_url,
        tags: uploadTags,
      });

      return NextResponse.json(
        { success: true, data: uploadResult },
        { status: 200 },
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("❌ Cloudinary Upload-Timeout");
      } else {
        console.error("❌ Cloudinary Upload-Netzwerkfehler:", fetchError);
      }

      // Bei Netzwerkfehlern verwende lokales Fallback-Bild
      const fallbackData = {
        public_id: `fahndungen/uploads/network_fallback_${Date.now()}`,
        secure_url: "/images/placeholders/fotos/platzhalterbild.svg",
        width: 800,
        height: 600,
        format: file.type.split("/")[1] ?? "svg",
        bytes: file.size,
        created_at: new Date().toISOString(),
      };
      return NextResponse.json(
        {
          success: true,
          data: fallbackData,
          warning: "Network error, using fallback image",
        },
        { status: 200 },
      );
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Upload failed";
    console.error("❌ Upload-Fehler:", errorMessage);

    // Bei allgemeinen Fehlern verwende lokales Fallback-Bild
    const fallbackData = {
      public_id: `fahndungen/uploads/error_${Date.now()}`,
      secure_url: "/images/placeholders/fotos/platzhalterbild.svg",
      width: 800,
      height: 600,
      format: "svg",
      bytes: 0,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: fallbackData,
        warning: "Upload error, using fallback image",
      },
      { status: 200 },
    );
  }
}

// Hilfsfunktion für Platzhalterbilder
function getPlaceholderImage(type: string): string {
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

  return (
    PLACEHOLDER_IMAGES[type as keyof typeof PLACEHOLDER_IMAGES] ??
    PLACEHOLDER_IMAGES.default
  );
}

// Hilfsfunktion für Tag-Parsing
function parseTags(tags?: string | null, context?: string | null): string[] {
  const tagArray: string[] = ["fahndung", "upload"];

  // Tags aus Formular hinzufügen
  if (tags) {
    const parsedTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    tagArray.push(...parsedTags);
  }

  // Kontext-basierte Tags hinzufügen
  if (context) {
    const contextLower = context.toLowerCase();
    if (contextLower.includes("person") || contextLower.includes("portrait")) {
      tagArray.push("person", "portrait");
    } else if (
      contextLower.includes("vehicle") ||
      contextLower.includes("car")
    ) {
      tagArray.push("vehicle", "transport");
    } else if (
      contextLower.includes("document") ||
      contextLower.includes("paper")
    ) {
      tagArray.push("document", "paper");
    } else if (
      contextLower.includes("object") ||
      contextLower.includes("item")
    ) {
      tagArray.push("object", "item");
    }
  }

  // Entferne Duplikate
  return [...new Set(tagArray)];
}
