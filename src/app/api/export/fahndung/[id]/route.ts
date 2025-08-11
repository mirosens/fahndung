import { NextRequest, NextResponse } from "next/server";
import { getServerClient } from "~/lib/supabase/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = getServerClient();

    // Hole die Fahndung
    const { data: investigation, error } = await supabase
      .from("investigations")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error || !investigation) {
      return NextResponse.json(
        { error: "Fahndung nicht gefunden" },
        { status: 404 },
      );
    }

    // Hole die Bilder
    const { data: images } = await supabase
      .from("investigation_images")
      .select("*")
      .eq("investigation_id", params.id);

    // Erstelle PDF-Inhalt (vereinfachte Version)
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Fahndung - ${investigation.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #333; }
            .case-number { font-size: 18px; color: #666; margin-top: 10px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px; }
            .content { line-height: 1.6; }
            .priority { display: inline-block; padding: 5px 10px; border-radius: 4px; font-weight: bold; }
            .priority-urgent { background-color: #ffebee; color: #c62828; }
            .priority-normal { background-color: #e3f2fd; color: #1565c0; }
            .priority-new { background-color: #e8f5e8; color: #2e7d32; }
            .images { margin-top: 20px; }
            .image { margin: 10px 0; text-align: center; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${investigation.title}</div>
            <div class="case-number">Aktennummer: ${investigation.case_number}</div>
            <div class="priority priority-${investigation.priority}">
              ${
                investigation.priority === "urgent"
                  ? "Dringend"
                  : investigation.priority === "new"
                    ? "Neu"
                    : "Normal"
              }
            </div>
          </div>

          <div class="section">
            <div class="section-title">Kurzbeschreibung</div>
            <div class="content">${investigation.short_description || "Keine Kurzbeschreibung verfügbar"}</div>
          </div>

          <div class="section">
            <div class="section-title">Beschreibung</div>
            <div class="content">${investigation.description || "Keine Beschreibung verfügbar"}</div>
          </div>

          <div class="section">
            <div class="section-title">Details</div>
            <div class="content">
              <strong>Kategorie:</strong> ${investigation.category}<br>
              <strong>Standort:</strong> ${investigation.location || "Nicht angegeben"}<br>
              <strong>Dienststelle:</strong> ${investigation.station || "Nicht angegeben"}<br>
              <strong>Datum:</strong> ${investigation.date || "Nicht angegeben"}<br>
              <strong>Merkmale:</strong> ${investigation.features || "Keine Merkmale angegeben"}
            </div>
          </div>

          ${
            images && images.length > 0
              ? `
            <div class="section">
              <div class="section-title">Bilder</div>
              <div class="images">
                ${images
                  .map(
                    (img: any) => `
                  <div class="image">
                    <img src="${img.url}" alt="${img.alt_text || "Bild"}" style="max-width: 100%; max-height: 300px;">
                    ${img.caption ? `<p><em>${img.caption}</em></p>` : ""}
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
          `
              : ""
          }

          <div class="footer">
            <p>Erstellt am: ${new Date(investigation.created_at).toLocaleDateString("de-DE")}</p>
            <p>Fahndung System - Automatisch generiert</p>
          </div>
        </body>
      </html>
    `;

    // Für eine echte PDF-Generierung würdest du hier eine Bibliothek wie puppeteer oder jsPDF verwenden
    // Hier geben wir HTML zurück, das der Browser als PDF drucken kann
    return new NextResponse(pdfContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="fahndung-${investigation.case_number}.html"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Fehler beim Exportieren der Fahndung" },
      { status: 500 },
    );
  }
}
