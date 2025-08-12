export const runtime = "nodejs"; // <-- wichtig: nicht Edge

import { NextResponse } from "next/server";
import crypto from "node:crypto";

function required(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file)
      return NextResponse.json(
        { success: false, error: "No file" },
        { status: 400 },
      );

    // --- Cloudinary creds (server-side only) ---
    const cloudName = required("CLOUDINARY_CLOUD_NAME");
    const apiKey = required("CLOUDINARY_API_KEY");
    const apiSecret = required("CLOUDINARY_API_SECRET");

    // --- Upload-Parameter ---
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "fahndungen/uploads"; // optional anpassen
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

    const resp = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body,
      },
    );

    const json = (await resp.json()) as { error?: { message?: string } };
    if (!resp.ok) {
      // Cloudinary-Fehler sauber durchreichen
      return NextResponse.json(
        {
          success: false,
          error: json?.error?.message ?? "Cloudinary upload failed",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, data: json }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
