"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SimpleCloudinaryUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Bitte wählen Sie eine Datei aus");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Upload fehlgeschlagen");
      }

      setUploadResult(result.data);
      toast.success("Upload erfolgreich!");
      console.log("✅ Upload erfolgreich:", result.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
      setError(errorMessage);
      toast.error(`Upload fehlgeschlagen: ${errorMessage}`);
      console.error("❌ Upload fehlgeschlagen:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Cloudinary Upload Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full"
          />
          {selectedFile && (
            <p className="text-sm text-gray-600">
              Ausgewählt: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? "Upload läuft..." : "Hochladen"}
        </Button>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {uploadResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-green-700">Upload erfolgreich!</span>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <h4 className="mb-2 font-medium text-blue-900">Upload Details:</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>URL:</strong> {uploadResult.secure_url}</p>
                <p><strong>Public ID:</strong> {uploadResult.public_id}</p>
                <p><strong>Größe:</strong> {(uploadResult.bytes / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Format:</strong> {uploadResult.format}</p>
                <p><strong>Dimensionen:</strong> {uploadResult.width} x {uploadResult.height}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
