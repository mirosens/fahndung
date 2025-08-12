"use client";

import React, { useState, useCallback } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, X, AlertCircle, Tag, RefreshCw } from "lucide-react";
import { cn } from "~/lib/utils";
import { uploadToCloudinary } from "~/lib/cloudinary-client";
import { validateAndRepairImageUrl } from "~/lib/imageUtils";
import type { CloudinaryUploadResult } from "~/lib/cloudinary-client";

interface ImageUploadProps {
  onUpload: (result: CloudinaryUploadResult) => void;
  onError?: (error: string) => void;
  onMediaLibrarySync?: () => void; // Callback für Media Library Synchronisation
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
  disabled?: boolean;
  context?: string; // Kontext für besseres Tagging
  showTags?: boolean; // Zeige Tag-Eingabe
}

export default function ImageUpload({
  onUpload,
  onError,
  onMediaLibrarySync,
  multiple = false,
  maxFiles = 1,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedFileTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  className = "",
  disabled = false,
  context = "",
  showTags = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [customTags, setCustomTags] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return;

      void (async () => {
        setIsUploading(true);
        setUploadErrors({});

        try {
          for (const file of acceptedFiles) {
            const fileId = `${file.name}-${Date.now()}`;

            // Validiere Datei
            if (!acceptedFileTypes.includes(file.type)) {
              const error = `Dateityp ${file.type} wird nicht unterstützt`;
              setUploadErrors((prev) => ({ ...prev, [fileId]: error }));
              onError?.(error);
              continue;
            }

            if (file.size > maxSize) {
              const error = `Datei ist zu groß (${(file.size / 1024 / 1024).toFixed(1)}MB)`;
              setUploadErrors((prev) => ({ ...prev, [fileId]: error }));
              onError?.(error);
              continue;
            }

            try {
              // Starte Upload
              setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

              // Erstelle FormData mit zusätzlichen Metadaten
              const formData = new FormData();
              formData.append("file", file);

              // Tags und Kontext hinzufügen
              if (customTags.trim()) {
                formData.append("tags", customTags.trim());
              }
              if (context.trim()) {
                formData.append("context", context.trim());
              }

              // Upload mit erweiterten Optionen
              const result = (await uploadToCloudinary(file, {
                folder: "fahndungen/uploads",
                tags: [
                  "fahndung",
                  "upload",
                  ...(customTags.trim()
                    ? customTags.split(",").map((t) => t.trim())
                    : []),
                  ...(context.trim() ? [context.trim()] : []),
                ],
              })) as CloudinaryUploadResult;

              // Validiere und repariere URL falls nötig
              const { url: validatedUrl, wasRepaired } =
                await validateAndRepairImageUrl(result.secure_url, file.name);

              if (wasRepaired) {
                console.warn("⚠️ Bild-URL wurde repariert:", file.name);
              }

              // Aktualisiere Result mit validierter URL
              const validatedResult: CloudinaryUploadResult = {
                ...result,
                secure_url: validatedUrl,
              };

              setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

              // Callback mit Ergebnis
              onUpload(validatedResult);

              // Kurze Verzögerung für visuelles Feedback
              await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (uploadError) {
              const error =
                uploadError instanceof Error
                  ? uploadError.message
                  : "Upload fehlgeschlagen";
              setUploadErrors((prev) => ({ ...prev, [fileId]: error }));
              onError?.(error);
            }
          }
        } finally {
          setIsUploading(false);
          // Reset Progress nach kurzer Verzögerung
          setTimeout(() => setUploadProgress({}), 2000);
        }
      })();
    },
    [
      onUpload,
      onError,
      maxSize,
      acceptedFileTypes,
      disabled,
      customTags,
      context,
    ],
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      multiple,
      maxFiles,
      maxSize,
      accept: acceptedFileTypes.reduce(
        (acc, type) => {
          acc[type] = [];
          return acc;
        },
        {} as Record<string, string[]>,
      ),
      disabled: disabled || isUploading,
    });

  // Behandle abgelehnte Dateien
  React.useEffect(() => {
    if (Array.isArray(fileRejections)) {
      fileRejections.forEach(({ file, errors }: FileRejection) => {
        const error = errors.map((e) => e.message).join(", ");
        const fileId = `${file.name}-${Date.now()}`;
        setUploadErrors((prev) => ({ ...prev, [fileId]: error }));
        onError?.(error);
      });
    }
  }, [fileRejections, onError]);

  // Synchronisiere mit Media Library
  const handleMediaLibrarySync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      // Trigger Media Library Refresh
      onMediaLibrarySync?.();

      // Kurze Verzögerung für visuelles Feedback
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("✅ Media Library synchronisiert");
    } catch (error) {
      console.error("❌ Media Library Synchronisation fehlgeschlagen:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Upload-Bereich */}
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragActive && "border-primary bg-primary/5",
          disabled && "cursor-not-allowed opacity-50",
          isUploading && "pointer-events-none",
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-2">
          {isUploading ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">Upload läuft...</p>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {isDragActive
                    ? "Dateien hier ablegen"
                    : "Dateien hier ablegen oder klicken"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {acceptedFileTypes.join(", ").toUpperCase()} bis{" "}
                  {Math.round(maxSize / 1024 / 1024)}MB
                </p>
                {context && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                    Kontext: {context}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tag-Eingabe */}
      {showTags && !isUploading && (
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tags (durch Komma getrennt, z.B.: person, portrait, wichtig)"
              value={customTags}
              onChange={(e) => setCustomTags(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Tags helfen bei der Organisation und Suche in der Media Library
          </p>
        </div>
      )}

      {/* Media Library Sync Button */}
      {onMediaLibrarySync && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={handleMediaLibrarySync}
            disabled={isSyncing}
            className={cn(
              "flex items-center space-x-2 rounded-md px-3 py-2 text-sm transition-colors",
              "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-950/40",
              isSyncing && "cursor-not-allowed opacity-50",
            )}
          >
            <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
            <span>
              {isSyncing ? "Synchronisiere..." : "Media Library aktualisieren"}
            </span>
          </button>
        </div>
      )}

      {/* Upload-Fortschritt */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="flex items-center space-x-2">
              <div className="h-2 flex-1 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="w-12 text-right text-xs text-muted-foreground">
                {progress}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Upload-Fehler */}
      {Object.keys(uploadErrors).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadErrors).map(([fileId, error]) => (
            <div
              key={fileId}
              className="flex items-center space-x-2 rounded-md bg-red-50 p-2 dark:bg-red-950/20"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-500" />
              <span className="flex-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </span>
              <button
                onClick={() =>
                  setUploadErrors((prev) => {
                    const { [fileId]: _removed, ...rest } = prev;
                    return rest;
                  })
                }
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Abgelehnte Dateien */}
      {Array.isArray(fileRejections) && fileRejections.length > 0 && (
        <div className="mt-4 space-y-2">
          {fileRejections.map(({ file, errors }: FileRejection) => (
            <div
              key={file.name}
              className="flex items-center space-x-2 rounded-md bg-yellow-50 p-2 dark:bg-yellow-950/20"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-yellow-500" />
              <span className="flex-1 text-sm text-yellow-600 dark:text-yellow-400">
                {file.name}: {errors.map((e) => e.message).join(", ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
