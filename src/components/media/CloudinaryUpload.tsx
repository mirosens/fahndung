"use client";

import { useState, useCallback } from "react";
// import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface CloudinaryUploadProps {
  onUploadComplete?: (result: {
    url: string;
    public_id: string;
    cloudinary: any;
  }) => void;
  folder?: string;
  tags?: string[];
  className?: string;
}

export default function CloudinaryUpload({
  onUploadComplete,
  folder = "fahndung",
  tags = [],
  className = "",
}: CloudinaryUploadProps) {
  // const { data: session } = useSession();
  const session = { user: { id: "test-user" } }; // Mock session for testing
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadMutation = api.cloudinary.uploadImage.useMutation({
    onSuccess: (data) => {
      console.log("✅ Cloudinary Upload erfolgreich:", data);
      setUploadResult(data);
      setError(null);
      toast.success("Bild erfolgreich zu Cloudinary hochgeladen!");
      onUploadComplete?.(data);
    },
    onError: (error) => {
      console.error("❌ Cloudinary Upload fehlgeschlagen:", error);
      setError(error.message);
      toast.error(`Upload fehlgeschlagen: ${error.message}`);
    },
  });

  // Hilfsfunktion: File zu Base64 konvertieren
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Entferne den Data URL Prefix (data:image/jpeg;base64,)
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // Prüfe Dateityp
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          setError("Nur Bilder (JPEG, PNG, GIF, WebP) sind erlaubt");
          return;
        }

        // Prüfe Dateigröße (10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          setError("Datei zu groß. Maximale Größe: 10MB");
          return;
        }

        setSelectedFile(file);
        setError(null);
        setUploadResult(null);
      }
    },
    [],
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setError("Bitte wählen Sie eine Datei aus");
      return;
    }

    if (!session) {
      setError("Sie müssen angemeldet sein, um Dateien hochzuladen");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      console.log("🚀 Cloudinary Upload startet für:", selectedFile.name);

      // Progress simulieren
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // File zu Base64 konvertieren
      const base64Data = await fileToBase64(selectedFile);

      // Upload zu Cloudinary
      await uploadMutation.mutateAsync({
        file: base64Data,
        filename: selectedFile.name,
        contentType: selectedFile.type,
        folder,
        tags,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log("✅ Cloudinary Upload abgeschlossen");
    } catch (error) {
      console.error("❌ Upload fehlgeschlagen:", error);
      setError(error instanceof Error ? error.message : "Unbekannter Fehler");
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, session, uploadMutation, folder, tags]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        const input = document.createElement("input");
        input.type = "file";
        input.files = event.dataTransfer.files;
        const changeEvent = new Event("change", { bubbles: true });
        Object.defineProperty(changeEvent, "target", { value: input });
        handleFileSelect(changeEvent as any);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );

  const resetUpload = useCallback(() => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
    setUploadProgress(0);
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Cloudinary Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selectedFile ? (
          <div
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center transition-colors hover:border-gray-400"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-gray-600">
              Klicken Sie hier oder ziehen Sie eine Datei hierher
            </p>
            <p className="text-sm text-gray-500">
              Unterstützte Formate: JPEG, PNG, GIF, WebP (max. 10MB)
            </p>
            <Input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetUpload}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload läuft...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {uploadResult && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">Upload erfolgreich!</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                className="flex-1"
              >
                {isUploading ? "Upload läuft..." : "Zu Cloudinary hochladen"}
              </Button>
              {!isUploading && (
                <Button variant="outline" onClick={resetUpload}>
                  Abbrechen
                </Button>
              )}
            </div>
          </div>
        )}

        {uploadResult && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">Upload Details:</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>
                <strong>URL:</strong> {uploadResult.url}
              </p>
              <p>
                <strong>Public ID:</strong> {uploadResult.public_id}
              </p>
              <p>
                <strong>Größe:</strong>{" "}
                {(uploadResult.cloudinary.bytes / 1024 / 1024).toFixed(2)} MB
              </p>
              <p>
                <strong>Format:</strong> {uploadResult.cloudinary.format}
              </p>
              <p>
                <strong>Dimensionen:</strong> {uploadResult.cloudinary.width} x{" "}
                {uploadResult.cloudinary.height}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
