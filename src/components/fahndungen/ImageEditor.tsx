"use client";

import React, { useState, useCallback } from "react";
import {
  Crop,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Sun,
  Contrast,
  Palette,
  Download,
  Undo,
  Redo,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  editImageUrl,
  getPublicIdFromUrl,
} from "~/lib/cloudinary-client";

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedUrl: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

interface EditHistory {
  options: any;
  url: string;
}

export default function ImageEditor({
  imageUrl,
  onSave,
  onCancel,
  isOpen,
}: ImageEditorProps) {
  const [currentOptions, setCurrentOptions] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(imageUrl);
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Bildbearbeitung anwenden
  const applyEdit = useCallback(
    async (options: any) => {
      if (!imageUrl) return;

      setIsProcessing(true);
      try {
        const publicId = getPublicIdFromUrl(imageUrl);
        const editedUrl = editImageUrl(publicId, options);

        setPreviewUrl(editedUrl);
        setCurrentOptions(options);

        // Zur Historie hinzufügen
        const newHistory = editHistory.slice(0, historyIndex + 1);
        newHistory.push({ options, url: editedUrl });
        setEditHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      } catch (error) {
        console.error("Bildbearbeitung fehlgeschlagen:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [imageUrl, editHistory, historyIndex],
  );

  // Rückgängig machen
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousEdit = editHistory[newIndex];
      setPreviewUrl(previousEdit.url);
      setCurrentOptions(previousEdit.options);
      setHistoryIndex(newIndex);
    } else {
      // Zurück zum Original
      setPreviewUrl(imageUrl);
      setCurrentOptions({});
      setHistoryIndex(-1);
    }
  }, [editHistory, historyIndex, imageUrl]);

  // Wiederholen
  const redo = useCallback(() => {
    if (historyIndex < editHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const nextEdit = editHistory[newIndex];
      setPreviewUrl(nextEdit.url);
      setCurrentOptions(nextEdit.options);
      setHistoryIndex(newIndex);
    }
  }, [editHistory, historyIndex]);

  // Schnell-Bearbeitungen
  const quickEdits = [
    {
      name: "Helligkeit +20%",
      icon: Sun,
      action: () =>
        applyEdit({ ...currentOptions, effect: "brightness", effectValue: 20 }),
    },
    {
      name: "Helligkeit -20%",
      icon: Sun,
      action: () =>
        applyEdit({
          ...currentOptions,
          effect: "brightness",
          effectValue: -20,
        }),
    },
    {
      name: "Kontrast +30%",
      icon: Contrast,
      action: () =>
        applyEdit({ ...currentOptions, effect: "contrast", effectValue: 30 }),
    },
    {
      name: "Sättigung +50%",
      icon: Palette,
      action: () =>
        applyEdit({ ...currentOptions, effect: "saturation", effectValue: 50 }),
    },
    {
      name: "Schärfen",
      icon: ZoomIn,
      action: () =>
        applyEdit({ ...currentOptions, effect: "sharpen", effectValue: 100 }),
    },
    {
      name: "Weichzeichnen",
      icon: ZoomOut,
      action: () =>
        applyEdit({ ...currentOptions, effect: "blur", effectValue: 100 }),
    },
  ];

  // Größen-Bearbeitungen
  const sizeEdits = [
    {
      name: "Standard (1200x800)",
      action: () => applyEdit({ width: 1200, height: 800, crop: "limit" }),
    },
    {
      name: "Quadrat (800x800)",
      action: () =>
        applyEdit({ width: 800, height: 800, crop: "fill", gravity: "center" }),
    },
    {
      name: "Portrait (600x800)",
      action: () =>
        applyEdit({ width: 600, height: 800, crop: "fill", gravity: "center" }),
    },
    {
      name: "Landscape (1200x600)",
      action: () =>
        applyEdit({
          width: 1200,
          height: 600,
          crop: "fill",
          gravity: "center",
        }),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg bg-white p-6 dark:bg-gray-900">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bildbearbeitung</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={historyIndex <= -1}
              className="rounded p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= editHistory.length - 1}
              className="rounded p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
            >
              <Redo className="h-4 w-4" />
            </button>
            <button
              onClick={onCancel}
              className="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bildvorschau */}
        <div className="mb-4 flex justify-center">
          <div className="relative max-h-[400px] max-w-[600px] overflow-hidden rounded-lg border">
            {isProcessing ? (
              <div className="flex h-64 w-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <img
                src={previewUrl}
                alt="Bildvorschau"
                className="h-auto w-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Schnell-Bearbeitungen */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium">Schnell-Bearbeitungen</h4>
          <div className="grid grid-cols-3 gap-2">
            {quickEdits.map((edit, index) => (
              <button
                key={index}
                onClick={edit.action}
                disabled={isProcessing}
                className="flex items-center space-x-2 rounded border p-2 text-xs hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-800"
              >
                <edit.icon className="h-3 w-3" />
                <span>{edit.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Größen-Bearbeitungen */}
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium">Größe & Zuschnitt</h4>
          <div className="grid grid-cols-2 gap-2">
            {sizeEdits.map((edit, index) => (
              <button
                key={index}
                onClick={edit.action}
                disabled={isProcessing}
                className="rounded border p-2 text-xs hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-800"
              >
                {edit.name}
              </button>
            ))}
          </div>
        </div>

        {/* Aktuelle Einstellungen */}
        {Object.keys(currentOptions).length > 0 && (
          <div className="mb-4 rounded border bg-gray-50 p-3 dark:bg-gray-800">
            <h4 className="mb-2 text-sm font-medium">Aktuelle Einstellungen</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {Object.entries(currentOptions).map(([key, value]) => (
                <div key={key}>
                  {key}: {String(value)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aktionen */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="rounded border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Abbrechen
          </button>
          <button
            onClick={() => onSave(previewUrl)}
            disabled={isProcessing}
            className="flex items-center space-x-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            <span>Speichern</span>
          </button>
        </div>
      </div>
    </div>
  );
}
