"use client";

import { useState } from "react";
import CloudinaryUpload from "~/components/media/CloudinaryUpload";
import CloudinaryImage from "~/components/media/CloudinaryImage";

interface UploadedImage {
  url: string;
  public_id: string;
  cloudinary: {
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
}

export default function TestCloudinaryPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null,
  );

  const handleUploadComplete = (result: UploadedImage) => {
    setUploadedImages((prev) => [...prev, result]);
    setSelectedImage(result);
  };

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">Cloudinary Integration Test</h1>
        <p className="text-gray-600">
          Teste die Cloudinary-Upload und Bildbearbeitungsfunktionen
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Upload Test */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Upload Test</h2>
          <CloudinaryUpload
            folder="test"
            tags={["test", "demo"]}
            onUploadComplete={handleUploadComplete}
          />
        </div>

        {/* Bildbearbeitung Test */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Bildbearbeitung</h2>
          {selectedImage ? (
            <CloudinaryImage
              publicId={selectedImage.public_id}
              alt="Hochgeladenes Bild"
              width={400}
              height={300}
              showControls={true}
            />
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">
                Lade zuerst ein Bild hoch, dann kannst du es hier bearbeiten
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hochgeladene Bilder */}
      {uploadedImages.length > 0 && (
        <div>
          <h2 className="mb-4 text-2xl font-semibold">Hochgeladene Bilder</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {uploadedImages.map((image, index) => (
              <div
                key={index}
                className="cursor-pointer rounded-lg border-2 border-gray-200 p-4 transition-colors hover:border-blue-300"
                onClick={() => setSelectedImage(image)}
              >
                <CloudinaryImage
                  publicId={image.public_id}
                  alt={`Hochgeladenes Bild ${index + 1}`}
                  width={300}
                  height={200}
                />
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    <strong>Format:</strong> {image.cloudinary.format}
                  </p>
                  <p>
                    <strong>Größe:</strong>{" "}
                    {(image.cloudinary.bytes / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <p>
                    <strong>Dimensionen:</strong> {image.cloudinary.width} x{" "}
                    {image.cloudinary.height}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anleitung */}
      <div className="rounded-lg bg-blue-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-blue-900">Anleitung:</h3>
        <ol className="list-inside list-decimal space-y-2 text-blue-800">
          <li>Lade ein Bild über die Upload-Komponente hoch</li>
          <li>Das Bild erscheint automatisch in der Bildbearbeitung</li>
          <li>Nutze die Einstellungen um das Bild zu bearbeiten</li>
          <li>Alle hochgeladenen Bilder werden unten angezeigt</li>
          <li>Klicke auf ein Bild um es in der Bildbearbeitung zu öffnen</li>
        </ol>
      </div>
    </div>
  );
}
