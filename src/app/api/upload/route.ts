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

    // 🚀 PROTOYP-MODUS: Prüfe ob Prototyp-Modus aktiv ist
    const isPrototypeMode =
      process.env.NODE_ENV === "development" ||
      process.env["NEXT_PUBLIC_PROTOTYPE_MODE"] === "true";

    if (isPrototypeMode) {
      console.log("🚀 Prototyp-Modus: Verwende Mock-Upload für Cloudinary");

      // Simuliere Upload-Verzögerung
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Bestimme passendes Platzhalterbild basierend auf Kontext
      let placeholderType = "default";
      const fileName = file.name.toLowerCase();
      const contextLower = context?.toLowerCase() ?? "";

      if (
        fileName.includes("person") ||
        fileName.includes("portrait") ||
        fileName.includes("face") ||
        contextLower.includes("person")
      ) {
        placeholderType = "person";
      } else if (
        fileName.includes("car") ||
        fileName.includes("vehicle") ||
        fileName.includes("auto") ||
        contextLower.includes("vehicle")
      ) {
        placeholderType = "vehicle";
      } else if (
        fileName.includes("document") ||
        fileName.includes("paper") ||
        fileName.includes("file") ||
        contextLower.includes("document")
      ) {
        placeholderType = "document";
      } else if (
        fileName.includes("object") ||
        fileName.includes("item") ||
        contextLower.includes("object")
      ) {
        placeholderType = "object";
      }

      // Erstelle Mock-Response mit robuster URL
      const mockResult = {
        public_id: `fahndungen/prototype_${Date.now()}`,
        secure_url: getPlaceholderImage(placeholderType),
        width: 800,
        height: 600,
        format: file.type.split("/")[1] ?? "jpg",
        bytes: file.size,
        created_at: new Date().toISOString(),
        tags: parseTags(tags, context),
      };

      console.log("✅ Mock-Upload erfolgreich:", mockResult);
      return NextResponse.json({ success: true, data: mockResult });
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
    const toSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(toSign + apiSecret)
      .digest("hex");

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
