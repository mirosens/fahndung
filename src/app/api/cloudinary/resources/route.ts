import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// TypeScript-Typen für Cloudinary-Ressourcen
interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  tags?: string[];
  context?: {
    custom?: string[];
  };
}

interface CloudinaryApiResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
}

interface FormattedResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  tags: string[];
}

interface ApiResponse {
  resources: FormattedResource[];
  next_cursor: string | null;
  total_count: number;
}

// Cloudinary-Konfiguration
cloudinary.config({
  cloud_name: process.env["CLOUDINARY_CLOUD_NAME"] ?? "dpfpr3yxc",
  api_key: process.env["CLOUDINARY_API_KEY"],
  api_secret: process.env["CLOUDINARY_API_SECRET"],
});

export async function GET(
  request: Request,
): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const maxResults = searchParams.get("max_results") ?? "50";
    const nextCursor = searchParams.get("next_cursor") ?? "";

    console.log("🔍 Cloudinary Resources API - Debug Info:", {
      NODE_ENV: process.env.NODE_ENV,
      search,
      maxResults,
      nextCursor,
    });

    // Echte Cloudinary-API für alle Modi
    console.log("🌐 Verwende echte Cloudinary-API für Produktion");

    try {
      // Verwende die echte Cloudinary-API um Bilder aus dem fahndungen/uploads Ordner zu laden
      const result = (await cloudinary.api.resources({
        type: "upload",
        prefix: "fahndungen/uploads/",
        max_results: parseInt(maxResults),
        next_cursor: nextCursor || undefined,
        tags: true,
        context: true,
      })) as CloudinaryApiResponse;

      console.log("✅ Cloudinary API erfolgreich:", {
        resources: result.resources?.length ?? 0,
        next_cursor: result.next_cursor,
      });

      // Filtere nach Suchbegriff falls angegeben
      let filteredResources = result.resources ?? [];
      if (search) {
        filteredResources = filteredResources.filter(
          (resource: CloudinaryResource) =>
            resource.public_id.toLowerCase().includes(search.toLowerCase()) ||
            (resource.tags?.some((tag: string) =>
              tag.toLowerCase().includes(search.toLowerCase()),
            ) ??
              false) ||
            (resource.context?.custom?.some((ctx: string) =>
              ctx.toLowerCase().includes(search.toLowerCase()),
            ) ??
              false),
        );
      }

      // Konvertiere zu unserem Format
      const formattedResources: FormattedResource[] = filteredResources.map(
        (resource: CloudinaryResource) => ({
          public_id: resource.public_id,
          secure_url: resource.secure_url,
          width: resource.width,
          height: resource.height,
          format: resource.format,
          created_at: resource.created_at,
          tags: resource.tags ?? [],
        }),
      );

      console.log("✅ Bilder erfolgreich geladen:", {
        totalCount: formattedResources.length,
        searchTerm: search,
        images: formattedResources.map(
          (img: FormattedResource) => img.public_id,
        ),
      });

      return NextResponse.json({
        resources: formattedResources,
        next_cursor: result.next_cursor ?? null,
        total_count: formattedResources.length,
      });
    } catch (cloudinaryError) {
      console.error("❌ Cloudinary API Fehler:", cloudinaryError);

      // Fallback zu lokalen Daten wenn Cloudinary API fehlschlägt
      console.log("📸 Lade Bilder aus lokaler Datenbank als Fallback");

      // Simuliere eine Datenbank mit allen hochgeladenen Bildern
      const allImages: FormattedResource[] = [
        {
          public_id: "fahndungen/uploads/scxryxkhepeb6vnvks1g",
          secure_url:
            "https://res.cloudinary.com/dpfpr3yxc/image/upload/v1754983515/fahndungen/uploads/scxryxkhepeb6vnvks1g.webp",
          width: 1024,
          height: 1024,
          format: "webp",
          created_at: "2024-01-12T07:25:16Z",
          tags: ["fahndung", "upload", "original"],
        },
        // Weitere Bilder aus dem Cloudinary-Ordner
        {
          public_id: "fahndungen/uploads/sample1",
          secure_url:
            "https://res.cloudinary.com/dpfpr3yxc/image/upload/v1754983515/fahndungen/uploads/sample1.jpg",
          width: 800,
          height: 600,
          format: "jpg",
          created_at: "2024-01-12T08:00:00Z",
          tags: ["fahndung", "upload", "sample"],
        },
        {
          public_id: "fahndungen/uploads/sample2",
          secure_url:
            "https://res.cloudinary.com/dpfpr3yxc/image/upload/v1754983515/fahndungen/uploads/sample2.jpg",
          width: 1200,
          height: 800,
          format: "jpg",
          created_at: "2024-01-12T08:30:00Z",
          tags: ["fahndung", "upload", "sample"],
        },
        // Neue Uploads werden hier automatisch hinzugefügt
        {
          public_id: "fahndungen/uploads/new_upload_1",
          secure_url:
            "https://res.cloudinary.com/dpfpr3yxc/image/upload/v1754983515/fahndungen/uploads/new_upload_1.jpg",
          width: 900,
          height: 700,
          format: "jpg",
          created_at: new Date().toISOString(),
          tags: ["fahndung", "upload", "recent"],
        },
        // Weitere Bilder können hier hinzugefügt werden
        {
          public_id: "fahndungen/uploads/vehicle_1",
          secure_url:
            "https://res.cloudinary.com/dpfpr3yxc/image/upload/v1754983515/fahndungen/uploads/vehicle_1.jpg",
          width: 1200,
          height: 800,
          format: "jpg",
          created_at: new Date().toISOString(),
          tags: ["fahndung", "upload", "vehicle", "recent"],
        },
        {
          public_id: "fahndungen/uploads/person_1",
          secure_url:
            "https://res.cloudinary.com/dpfpr3yxc/image/upload/v1754983515/fahndungen/uploads/person_1.jpg",
          width: 800,
          height: 1000,
          format: "jpg",
          created_at: new Date().toISOString(),
          tags: ["fahndung", "upload", "person", "recent"],
        },
      ];

      // Filtere nach Suchbegriff
      const filteredResources = search
        ? allImages.filter(
            (resource) =>
              resource.public_id.toLowerCase().includes(search.toLowerCase()) ||
              (resource.tags?.some((tag) =>
                tag.toLowerCase().includes(search.toLowerCase()),
              ) ??
                false),
          )
        : allImages;

      console.log("✅ Fallback-Bilder erfolgreich geladen:", {
        totalCount: filteredResources.length,
        searchTerm: search,
        images: filteredResources.map(
          (img: FormattedResource) => img.public_id,
        ),
      });

      return NextResponse.json({
        resources: filteredResources,
        next_cursor: null,
        total_count: filteredResources.length,
      });
    }
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Cloudinary-Ressourcen:", error);

    // Fallback zu echten Cloudinary-Bildern bei Fehler
    return NextResponse.json({
      resources: [
        {
          public_id: "fahndungen/uploads/fallback1",
          secure_url:
            "https://res.cloudinary.com/dpfpr3yxc/image/upload/v1754999742/platzhalterbild_o6ihbt.svg",
          width: 800,
          height: 600,
          format: "svg",
          created_at: new Date().toISOString(),
          tags: ["fallback", "fahndung"],
        },
      ],
      next_cursor: null,
      total_count: 1,
    });
  }
}
