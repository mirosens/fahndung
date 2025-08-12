"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Image as ImageIcon,
  FileText,
  Trash2,
  AlertCircle,
  Camera,
  Info,
  FileImage,
  FileVideo,
  FileAudio,
  Upload,
  Loader2,
  Edit3,
  FolderOpen,
} from "lucide-react";
import Image from "next/image";
import { uploadToCloudinary } from "~/lib/cloudinary-client";
import ImageEditor from "../ImageEditor";
import CloudinaryMediaLibrary from "../CloudinaryMediaLibrary";
import type { Step3Data } from "../types/WizardTypes";

interface Step3ComponentProps {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
  showValidation?: boolean;
}

const Step3Component: React.FC<Step3ComponentProps> = ({
  data,
  onChange,
  showValidation = false,
}) => {
  const [dragZone, setDragZone] = useState<
    "main" | "additional" | "documents" | null
  >(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string>("");
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaLibraryMode, setMediaLibraryMode] = useState<
    "main" | "additional"
  >("main");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Live-Vorschau für Hauptbild
  useEffect(() => {
    if (data.mainImageUrl) {
      setImagePreview(data.mainImageUrl);
    } else if (data.mainImage) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(data.mainImage);
    } else {
      setImagePreview(null);
    }
  }, [data.mainImage, data.mainImageUrl]);

  // Hilfsfunktion zum Hochladen von Bildern zu Cloudinary
  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    try {
      console.log("🚀 Starte Cloudinary-Upload für:", file.name);

      const result = await uploadToCloudinary(file, {
        folder: "fahndungen",
        tags: ["fahndung", "upload"],
      });

      console.log(
        "✅ Bild erfolgreich zu Cloudinary hochgeladen:",
        result.secure_url,
      );
      return result.secure_url;
    } catch (error: unknown) {
      console.error("❌ Cloudinary-Upload fehlgeschlagen:", error);
      throw error;
    }
  };

  const handleDrag = (
    e: React.DragEvent,
    zone: "main" | "additional" | "documents",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragZone(zone);
    } else if (e.type === "dragleave") {
      setDragZone(null);
    }
  };

  const handleDrop = (
    e: React.DragEvent,
    zone: "main" | "additional" | "documents",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragZone(null);

    if (e.dataTransfer.files?.[0]) {
      const files = Array.from(e.dataTransfer.files);
      void handleFilesUpload(files, zone);
    }
  };

  const handleFilesUpload = async (
    files: File[],
    zone: "main" | "additional" | "documents",
  ) => {
    const newErrors: string[] = [];

    files.forEach((file) => {
      // Validierung
      if (file.size > 20 * 1024 * 1024) {
        newErrors.push(`${file.name} ist zu groß (max. 20MB)`);
        return;
      }

      if (zone === "main" || zone === "additional") {
        if (!file.type.startsWith("image/")) {
          newErrors.push(`${file.name} ist kein gültiges Bildformat`);
          return;
        }
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 5000);
      return;
    }

    // Dateien verarbeiten
    if (zone === "main") {
      const file = files[0];
      if (file) {
        await handleImageUpload([file]);
      }
    } else if (zone === "additional") {
      await handleAdditionalImagesUpload(files);
    } else if (zone === "documents") {
      onChange({
        ...data,
        documents: [...data.documents, ...files],
      });
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (!file) return;

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simuliere Progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        // Bild hochladen
        const imageUrl = await uploadImageToCloudinary(file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        // Aktualisiere Daten mit URL statt File
        onChange({
          ...data,
          mainImage: file,
          mainImageUrl: imageUrl,
        });

        console.log("✅ Hauptbild erfolgreich hochgeladen:", imageUrl);
      } catch (error: unknown) {
        console.error("❌ Fehler beim Hochladen des Hauptbildes:", error);
        setErrors([
          `Fehler beim Hochladen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
        ]);
        setTimeout(() => setErrors([]), 5000);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleAdditionalImagesUpload = async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;

        // Progress für jedes Bild
        setUploadProgress((i / files.length) * 100);

        try {
          const imageUrl = await uploadImageToCloudinary(file);
          uploadedUrls.push(imageUrl);
        } catch (error: unknown) {
          console.error(`❌ Fehler beim Hochladen von ${file.name}:`, error);
          setErrors([
            `Fehler beim Hochladen von ${file.name}: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`,
          ]);
        }
      }

      // Aktualisiere Daten mit URLs
      const currentAdditionalImageUrls = data.additionalImageUrls ?? [];
      const updatedData: Step3Data = {
        ...data,
        additionalImages: [...data.additionalImages, ...files],
        additionalImageUrls: [...currentAdditionalImageUrls, ...uploadedUrls],
      };
      onChange(updatedData);

      console.log(
        "✅ Zusätzliche Bilder erfolgreich hochgeladen:",
        uploadedUrls,
      );
    } catch (error: unknown) {
      console.error("❌ Fehler beim Hochladen der zusätzlichen Bilder:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unbekannter Fehler";
      setErrors([`Fehler beim Hochladen: ${errorMessage}`]);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDocumentUpload = (files: File[]) => {
    const updatedData: Step3Data = {
      ...data,
      documents: [...data.documents, ...files],
    };
    onChange(updatedData);
  };

  const removeMainImage = () => {
    const updatedData: Step3Data = {
      ...data,
      mainImage: null,
      mainImageUrl: null,
    };
    onChange(updatedData);
  };

  const removeAdditionalImage = (index: number) => {
    const updatedImages = [...data.additionalImages];
    const updatedUrls = [...(data.additionalImageUrls ?? [])];
    updatedImages.splice(index, 1);
    updatedUrls.splice(index, 1);

    onChange({
      ...data,
      additionalImages: updatedImages,
      additionalImageUrls: updatedUrls,
    });
  };

  const removeDocument = (index: number) => {
    const updatedDocuments = [...data.documents];
    updatedDocuments.splice(index, 1);
    onChange({
      ...data,
      documents: updatedDocuments,
    });
  };

  // Bildbearbeitung öffnen
  const openImageEditor = (imageUrl: string) => {
    setEditingImageUrl(imageUrl);
    setIsImageEditorOpen(true);
  };

  // Bearbeitetes Bild speichern
  const handleImageEditSave = (editedUrl: string) => {
    onChange({
      ...data,
      mainImageUrl: editedUrl,
    });
    setIsImageEditorOpen(false);
  };

  // Bildbearbeitung abbrechen
  const handleImageEditCancel = () => {
    setIsImageEditorOpen(false);
  };

  // Cloudinary Media Library Handler
  const handleMediaLibrarySelect = (imageUrl: string, publicId: string) => {
    onChange({
      ...data,
      mainImageUrl: imageUrl,
      mainImage: null, // Kein File-Objekt, da aus Media Library
    });
    setIsMediaLibraryOpen(false);
  };

  // Cloudinary Media Library Handler für mehrere Bilder
  const handleMediaLibrarySelectMultiple = (
    images: Array<{ url: string; publicId: string }>,
  ) => {
    const currentAdditionalImageUrls = data.additionalImageUrls ?? [];
    const newUrls = images.map((img) => img.url);

    onChange({
      ...data,
      additionalImageUrls: [...currentAdditionalImageUrls, ...newUrls],
    });
    setIsMediaLibraryOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-muted-foreground dark:text-white">
          Schritt 3: Medien & Dokumente
        </h2>
        <p className="text-muted-foreground dark:text-muted-foreground">
          Fügen Sie Bilder und Dokumente zur Fahndung hinzu
        </p>
      </div>

      {/* Fehlermeldungen */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
              Fehler beim Hochladen
            </h3>
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700 dark:text-red-300">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Hauptbild Upload */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Hauptbild</h3>
          {data.mainImageUrl && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openImageEditor(data.mainImageUrl!)}
                className="flex items-center space-x-1 rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Edit3 className="h-3 w-3" />
                <span>Bearbeiten</span>
              </button>
              <button
                onClick={removeMainImage}
                className="flex items-center space-x-1 rounded border px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3 w-3" />
                <span>Entfernen</span>
              </button>
            </div>
          )}
        </div>

        <div
          className={`relative min-h-[200px] rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragZone === "main"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600"
          }`}
          onDragEnter={(e) => handleDrag(e, "main")}
          onDragOver={(e) => handleDrag(e, "main")}
          onDragLeave={(e) => handleDrag(e, "main")}
          onDrop={(e) => handleDrop(e, "main")}
        >
          {imagePreview ? (
            <div className="relative">
              <Image
                src={imagePreview}
                alt="Hauptbild Vorschau"
                width={192}
                height={192}
                className="mx-auto max-h-48 w-auto rounded-lg object-contain"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                  <div className="text-center text-white">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                    <p className="mt-2 text-sm">
                      Wird hochgeladen... {uploadProgress}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted dark:bg-muted">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-white">
                  Bild hierher ziehen oder klicken zum Auswählen
                </p>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                  PNG, JPG, GIF bis 20MB
                </p>
                {showValidation && !data.mainImage && (
                  <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                    Hauptbild ist erforderlich
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-muted"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                      Wird hochgeladen...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 inline-block h-4 w-4" />
                      Bild hochladen
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setMediaLibraryMode("main");
                    setIsMediaLibraryOpen(true);
                  }}
                  disabled={isUploading}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-muted"
                >
                  <FolderOpen className="mr-2 inline-block h-4 w-4" />
                  Aus Media Library
                </button>
              </div>
            </div>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files && handleImageUpload(Array.from(e.target.files))
            }
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Zusätzliche Bilder */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Weitere Bilder</h3>
        <div
          className={`min-h-[120px] rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragZone === "additional"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600"
          }`}
          onDragEnter={(e) => handleDrag(e, "additional")}
          onDragOver={(e) => handleDrag(e, "additional")}
          onDragLeave={(e) => handleDrag(e, "additional")}
          onDrop={(e) => handleDrop(e, "additional")}
        >
          {data.additionalImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {data.additionalImages.map((file, index) => (
                <div key={index} className="group relative">
                  <img
                    src={
                      data.additionalImageUrls?.[index] ??
                      URL.createObjectURL(file)
                    }
                    alt={`Zusätzliches Bild ${index + 1}`}
                    className="h-24 w-full rounded-lg object-cover"
                  />
                  <button
                    onClick={() => removeAdditionalImage(index)}
                    className="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-1 text-white hover:bg-red-600 group-hover:block"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted dark:bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-white">
                  Weitere Bilder hierher ziehen
                </p>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                  PNG, JPG, GIF bis 20MB
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-muted"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                      Wird hochgeladen...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 inline-block h-4 w-4" />
                      Bilder hochladen
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setMediaLibraryMode("additional");
                    setIsMediaLibraryOpen(true);
                  }}
                  disabled={isUploading}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-muted"
                >
                  <FolderOpen className="mr-2 inline-block h-4 w-4" />
                  Aus Media Library
                </button>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              e.target.files &&
              handleAdditionalImagesUpload(Array.from(e.target.files))
            }
            className="hidden"
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Dokumente */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dokumente</h3>
        <div
          className={`min-h-[120px] rounded-lg border-2 border-dashed p-6 transition-colors ${
            dragZone === "documents"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600"
          }`}
          onDragEnter={(e) => handleDrag(e, "documents")}
          onDragOver={(e) => handleDrag(e, "documents")}
          onDragLeave={(e) => handleDrag(e, "documents")}
          onDrop={(e) => handleDrop(e, "documents")}
        >
          {data.documents.length > 0 ? (
            <div className="space-y-2">
              {data.documents.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center space-x-3">
                    {file.type.startsWith("image/") ? (
                      <FileImage className="h-5 w-5 text-blue-500" />
                    ) : file.type.startsWith("video/") ? (
                      <FileVideo className="h-5 w-5 text-green-500" />
                    ) : file.type.startsWith("audio/") ? (
                      <FileAudio className="h-5 w-5 text-purple-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-gray-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(index)}
                    className="rounded p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted dark:bg-muted">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground dark:text-white">
                  Dokumente hierher ziehen
                </p>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                  PDF, DOC, TXT bis 20MB
                </p>
              </div>
              <button
                onClick={() => documentInputRef.current?.click()}
                className="rounded-lg bg-muted px-4 py-2 text-sm text-white hover:bg-muted"
              >
                <Upload className="mr-2 inline-block h-4 w-4" />
                Dokumente auswählen
              </button>
            </div>
          )}
          <input
            ref={documentInputRef}
            type="file"
            multiple
            onChange={(e) =>
              e.target.files && handleDocumentUpload(Array.from(e.target.files))
            }
            className="hidden"
          />
        </div>
      </div>

      {/* Info-Box */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-center space-x-2">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Bildbearbeitung verfügbar
          </h3>
        </div>
        <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
          Nach dem Hochladen können Sie das Hauptbild direkt bearbeiten.
          Verfügbare Funktionen: Helligkeit, Kontrast, Sättigung, Größenänderung
          und mehr.
        </p>
      </div>

      {/* Bildbearbeitung */}
      <ImageEditor
        imageUrl={editingImageUrl}
        onSave={handleImageEditSave}
        onCancel={handleImageEditCancel}
        isOpen={isImageEditorOpen}
      />

      {/* Cloudinary Media Library */}
      <CloudinaryMediaLibrary
        isOpen={isMediaLibraryOpen}
        onClose={() => setIsMediaLibraryOpen(false)}
        onSelectImage={handleMediaLibrarySelect}
        onSelectMultipleImages={handleMediaLibrarySelectMultiple}
        cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dpfpr3yxc"}
        multiple={mediaLibraryMode === "additional"}
      />
    </div>
  );
};

export default Step3Component;
