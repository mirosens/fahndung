import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { uploadToCloudinary, deleteFromCloudinary } from "~/lib/cloudinary";

export const cloudinaryRouter = createTRPCRouter({
  uploadImage: publicProcedure
    .input(
      z.object({
        file: z.string(), // Base64 encoded file
        filename: z.string(),
        contentType: z.string(),
        folder: z.string().optional().default("fahndung"),
        tags: z.array(z.string()).optional().default([]),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || "test-user";
      console.log("👤 Cloudinary Upload Request - User ID:", userId);

      try {
        console.log("🚀 Cloudinary Upload startet für:", input.filename);

        // Decode base64 to buffer
        const buffer = Buffer.from(input.file, "base64");

        // Zulässige MIME-Typen einschränken
        const allowedMimeTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedMimeTypes.includes(input.contentType)) {
          console.error("❌ Unsupported MIME type:", input.contentType);
          throw new TRPCError({
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: `Dateityp nicht unterstützt. Erlaubte Typen: ${allowedMimeTypes.join(", ")}`,
          });
        }

        // Prüfe Dateigröße (max 10MB nach Base64-Kodierung)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (buffer.length > maxSize) {
          console.error("❌ File too large:", {
            size: buffer.length,
            maxSize,
            filename: input.filename,
          });
          throw new TRPCError({
            code: "PAYLOAD_TOO_LARGE",
            message: `Datei zu groß (${Math.round(buffer.length / 1024 / 1024)}MB). Maximale Größe: 10MB`,
          });
        }

        console.log("📦 Buffer erstellt, Größe:", buffer.length);

        // Upload zu Cloudinary
        const uploadResult = await uploadToCloudinary(
          buffer,
          {
            folder: input.folder,
            tags: [
              ...input.tags,
              `user:${userId}`,
              `uploaded:${new Date().toISOString()}`,
            ],
          },
          input.contentType,
        );

        console.log("✅ Cloudinary Upload erfolgreich:", uploadResult);

        // Speichere Metadaten in der Datenbank (optional)
        // Hier könntest du die Cloudinary-URLs in deiner bestehenden Media-Tabelle speichern

        return {
          success: true,
          cloudinary: uploadResult,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        };
      } catch (error) {
        console.error("❌ Cloudinary Upload failed:", error);
        throw error;
      }
    }),

  deleteImage: publicProcedure
    .input(
      z.object({
        public_id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id || "test-user";
      console.log("👤 Cloudinary Delete Request - User ID:", userId);

      try {
        console.log("🗑️ Cloudinary Delete startet für:", input.public_id);

        await deleteFromCloudinary(input.public_id);

        console.log("✅ Cloudinary Delete erfolgreich:", input.public_id);

        return {
          success: true,
          deleted_public_id: input.public_id,
        };
      } catch (error) {
        console.error("❌ Cloudinary Delete failed:", error);
        throw error;
      }
    }),
});
