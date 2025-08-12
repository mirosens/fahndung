import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Konfiguration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const maxResults = parseInt(searchParams.get("max_results") || "50");
    const type = searchParams.get("type") || "upload";

    // Cloudinary API aufrufen
    const result = await cloudinary.api.resources({
      type: type as "upload" | "private" | "authenticated",
      max_results: maxResults,
      prefix: search || undefined,
      tags: search ? [search] : undefined,
    });

    return NextResponse.json({
      success: true,
      resources: result.resources,
      total_count: result.total_count,
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Cloudinary Ressourcen:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Fehler beim Laden der Media Library",
      },
      { status: 500 },
    );
  }
}
