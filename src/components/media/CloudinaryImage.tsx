"use client";

import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Crop,
  Palette,
  Download,
  Copy,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  showControls?: boolean;
}

interface ImageTransformations {
  width: number;
  height: number;
  quality: number;
  format: "auto" | "webp" | "jpg" | "png";
  crop: "fill" | "fit" | "scale" | "thumb";
  rotation: number;
  brightness: number;
  contrast: number;
  saturation: number;
}

export default function CloudinaryImage({
  publicId,
  alt,
  width = 800,
  height = 600,
  className = "",
  showControls = false,
}: CloudinaryImageProps) {
  const [transformations, setTransformations] = useState<ImageTransformations>({
    width,
    height,
    quality: 80,
    format: "auto",
    crop: "fill",
    rotation: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });

  const [showSettings, setShowSettings] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(
        `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`,
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${publicId.split("/").pop() || "image"}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Bild wird heruntergeladen...");
    } catch (error) {
      toast.error("Download fehlgeschlagen");
    }
  };

  const handleCopyUrl = async () => {
    try {
      const url = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
      await navigator.clipboard.writeText(url);
      toast.success("URL in Zwischenablage kopiert");
    } catch (error) {
      toast.error("Kopieren fehlgeschlagen");
    }
  };

  const resetTransformations = () => {
    setTransformations({
      width,
      height,
      quality: 80,
      format: "auto",
      crop: "fill",
      rotation: 0,
      brightness: 100,
      contrast: 100,
      saturation: 100,
    });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bildbearbeitung</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyUrl}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bildanzeige */}
        <div className="relative">
          <CldImage
            src={publicId}
            alt={alt}
            width={transformations.width}
            height={transformations.height}
            quality={transformations.quality}
            format={transformations.format}
            crop={transformations.crop}
            className="h-auto w-full rounded-lg"
            transformations={[
              {
                rotation: transformations.rotation,
                brightness: transformations.brightness,
                contrast: transformations.contrast,
                saturation: transformations.saturation,
              },
            ]}
          />
        </div>

        {/* Einstellungen */}
        {showSettings && (
          <div className="space-y-6 rounded-lg bg-gray-50 p-4">
            {/* Grundlegende Einstellungen */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="width">Breite</Label>
                <Input
                  id="width"
                  type="number"
                  value={transformations.width}
                  onChange={(e) =>
                    setTransformations((prev) => ({
                      ...prev,
                      width: parseInt(e.target.value) || 800,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="height">Höhe</Label>
                <Input
                  id="height"
                  type="number"
                  value={transformations.height}
                  onChange={(e) =>
                    setTransformations((prev) => ({
                      ...prev,
                      height: parseInt(e.target.value) || 600,
                    }))
                  }
                />
              </div>
            </div>

            {/* Qualität */}
            <div>
              <Label>Qualität: {transformations.quality}%</Label>
              <Slider
                value={[transformations.quality]}
                onValueChange={([value]) =>
                  setTransformations((prev) => ({
                    ...prev,
                    quality: value,
                  }))
                }
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
            </div>

            {/* Format */}
            <div>
              <Label>Format</Label>
              <Select
                value={transformations.format}
                onValueChange={(value: "auto" | "webp" | "jpg" | "png") =>
                  setTransformations((prev) => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                  <SelectItem value="jpg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Crop */}
            <div>
              <Label>Crop-Modus</Label>
              <Select
                value={transformations.crop}
                onValueChange={(value: "fill" | "fit" | "scale" | "thumb") =>
                  setTransformations((prev) => ({ ...prev, crop: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fill">Fill</SelectItem>
                  <SelectItem value="fit">Fit</SelectItem>
                  <SelectItem value="scale">Scale</SelectItem>
                  <SelectItem value="thumb">Thumb</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rotation */}
            <div>
              <Label>Rotation: {transformations.rotation}°</Label>
              <Slider
                value={[transformations.rotation]}
                onValueChange={([value]) =>
                  setTransformations((prev) => ({
                    ...prev,
                    rotation: value,
                  }))
                }
                max={360}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Bildbearbeitung */}
            <div className="space-y-4">
              <div>
                <Label>Helligkeit: {transformations.brightness}%</Label>
                <Slider
                  value={[transformations.brightness]}
                  onValueChange={([value]) =>
                    setTransformations((prev) => ({
                      ...prev,
                      brightness: value,
                    }))
                  }
                  max={200}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <Label>Kontrast: {transformations.contrast}%</Label>
                <Slider
                  value={[transformations.contrast]}
                  onValueChange={([value]) =>
                    setTransformations((prev) => ({
                      ...prev,
                      contrast: value,
                    }))
                  }
                  max={200}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <Label>Sättigung: {transformations.saturation}%</Label>
                <Slider
                  value={[transformations.saturation]}
                  onValueChange={([value]) =>
                    setTransformations((prev) => ({
                      ...prev,
                      saturation: value,
                    }))
                  }
                  max={200}
                  min={0}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={resetTransformations}
              className="w-full"
            >
              Einstellungen zurücksetzen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
