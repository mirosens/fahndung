"use client";

import React, { useState, useEffect } from "react";
import { useDebounce } from "~/hooks/useDebounce";
import { X, Wand2, WandSparkles, Info } from "lucide-react";
import {
  generateDemoShortDescription,
  generateDemoDescription,
  generateDemoFeatures,
  generateAllStep2Data,
} from "@/lib/demo/autofill";
import type { Step2Data, WizardData } from "../types/WizardTypes";
import { useResponsive } from "~/hooks/useResponsive";

interface Step2ComponentProps {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  wizard?: Partial<WizardData>;
  showValidation?: boolean;
}

const Step2Component: React.FC<Step2ComponentProps> = ({
  data,
  onChange,
  wizard,
  showValidation = false,
}) => {
  const { isMobile, isSmallMobile, isLargeMobile } = useResponsive();
  const [tagInput, setTagInput] = useState("");

  // Lokale States für alle Textfelder
  const [localShortDescription, setLocalShortDescription] = useState(
    data.shortDescription,
  );
  const [localDescription, setLocalDescription] = useState(data.description);
  const [localFeatures, setLocalFeatures] = useState(data.features);

  // Debounced values to reduce frequent state updates while typing. When the
  // user stops typing for the specified delay, these values change and
  // propagate to the parent wizard via onChange.
  const debouncedShortDescription = useDebounce(localShortDescription, 300);
  const debouncedDescription = useDebounce(localDescription, 300);
  const debouncedFeatures = useDebounce(localFeatures, 300);

  // Synchronisiere mit externen Änderungen
  useEffect(() => {
    setLocalShortDescription(data.shortDescription);
  }, [data.shortDescription]);

  useEffect(() => {
    setLocalDescription(data.description);
  }, [data.description]);

  useEffect(() => {
    setLocalFeatures(data.features);
  }, [data.features]);

  // Propagate debounced field values to the wizard state. Only update when
  // there is a change to avoid unnecessary renders.
  useEffect(() => {
    if (
      debouncedShortDescription !== data.shortDescription ||
      debouncedDescription !== data.description ||
      debouncedFeatures !== data.features
    ) {
      onChange({
        ...data,
        shortDescription: debouncedShortDescription,
        description: debouncedDescription,
        features: debouncedFeatures,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedShortDescription, debouncedDescription, debouncedFeatures]);

  // Commit-Funktionen (veraltet): Der Wizard erhält seine Daten jetzt
  // automatisch über die debounced States. Diese Funktion bleibt als
  // Fallback bestehen, falls andere Komponenten sie aufrufen.
  const commitChanges = () => {
    onChange({
      ...data,
      shortDescription: localShortDescription,
      description: localDescription,
      features: localFeatures,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      onChange({
        ...data,
        tags: [...data.tags, tagInput.trim()],
      });
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    onChange({
      ...data,
      tags: data.tags.filter((_, i) => i !== index),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const isShortDescriptionInvalid =
    showValidation && localShortDescription.length < 10;
  const isDescriptionInvalid = showValidation && localDescription.length < 50;

  return (
    <div className={`space-y-${isMobile ? '4' : '6'}`}>
      <div>
        <h2 className={`mb-2 ${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-muted-foreground dark:text-white`}>
          Schritt 2: Beschreibung
        </h2>
        <p className={`${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground dark:text-muted-foreground`}>
          Beschreiben Sie die Fahndung detailliert
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-${isMobile ? '4' : '6'}`}>
        {/* 1. Kurze Beschreibung */}
        <div>
          <label
            className={`mb-1 block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-muted-foreground dark:text-muted-foreground ${
              isShortDescriptionInvalid ? "underline decoration-red-500" : ""
            }`}
            style={
              isShortDescriptionInvalid ? { textDecorationStyle: "wavy" } : undefined
            }
          >
            1. Kurze Beschreibung *
          </label>
          <p className={`mb-2 ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground dark:text-muted-foreground`}>
            Kurze Zusammenfassung für die Kartenansicht (mindestens 10 Zeichen).
          </p>
          <div className="relative">
            <textarea
              value={localShortDescription}
              onChange={(e) => setLocalShortDescription(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
                isShortDescriptionInvalid
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-border focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="Kurze Zusammenfassung für die Kartenansicht..."
              rows={3}
              required
            />
            <button
              type="button"
              aria-label="Demo füllen"
              className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-muted"
              onClick={async () => {
                const demo = await generateDemoShortDescription(
                  {
                    ...(wizard ?? {}),
                    step2: {
                      ...data,
                      shortDescription: localShortDescription,
                      description: localDescription,
                    },
                  },
                  {
                    shortDescription: localShortDescription,
                    description: localDescription,
                  },
                );
                setLocalShortDescription(demo);
              }}
            >
              <Wand2 className="h-4 w-4" />
            </button>
          </div>
          {isShortDescriptionInvalid && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Kurze Beschreibung muss mindestens 10 Zeichen lang sein
            </p>
          )}
        </div>

        {/* 2. Detaillierte Beschreibung */}
        <div>
          <label
            className={`mb-1 block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-muted-foreground dark:text-muted-foreground ${
              isDescriptionInvalid ? "underline decoration-red-500" : ""
            }`}
            style={
              isDescriptionInvalid ? { textDecorationStyle: "wavy" } : undefined
            }
          >
            2. Detaillierte Beschreibung *
          </label>
          <p className={`mb-2 ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground dark:text-muted-foreground`}>
            Vollständige Beschreibung der Fahndung (mindestens 50 Zeichen).
          </p>
          <div className="relative">
            <textarea
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white ${
                isDescriptionInvalid
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                  : "border-border focus:border-blue-500 focus:ring-blue-500"
              }`}
              placeholder="Detaillierte Beschreibung der Fahndung..."
              rows={6}
              required
            />
            <button
              type="button"
              aria-label="Demo füllen"
              className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-muted"
              onClick={async () => {
                const demo = await generateDemoDescription(
                  {
                    ...(wizard ?? {}),
                    step2: {
                      ...data,
                      shortDescription: localShortDescription,
                      description: localDescription,
                    },
                  },
                  {
                    shortDescription: localShortDescription,
                    description: localDescription,
                  },
                );
                setLocalDescription(demo);
              }}
            >
              <Wand2 className="h-4 w-4" />
            </button>
          </div>
          {isDescriptionInvalid && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              Detaillierte Beschreibung muss mindestens 50 Zeichen lang sein
            </p>
          )}
        </div>

        {/* 3. Besondere Merkmale */}
        <div>
          <label className={`mb-1 block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-muted-foreground dark:text-muted-foreground`}>
            3. Besondere Merkmale
          </label>
          <p className={`mb-2 ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground dark:text-muted-foreground`}>
            Besondere Merkmale oder Kennzeichen (optional).
          </p>
          <div className="relative">
            <textarea
              value={localFeatures}
              onChange={(e) => setLocalFeatures(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white border-border focus:border-blue-500 focus:ring-blue-500"
              placeholder="Besondere Merkmale oder Kennzeichen..."
              rows={4}
            />
            <button
              type="button"
              aria-label="Demo füllen"
              className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-muted"
              onClick={async () => {
                const demo = await generateDemoFeatures(
                  {
                    ...(wizard ?? {}),
                    step2: {
                      ...data,
                      features: localFeatures,
                    },
                  },
                  {
                    features: localFeatures,
                  },
                );
                setLocalFeatures(demo);
              }}
            >
              <Wand2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 4. Tags */}
        <div>
          <label className={`mb-1 block ${isMobile ? 'text-sm' : 'text-sm'} font-medium text-muted-foreground dark:text-muted-foreground`}>
            4. Tags
          </label>
          <p className={`mb-2 ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground dark:text-muted-foreground`}>
            Fügen Sie relevante Tags hinzu (Enter drücken zum Hinzufügen).
          </p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 dark:border-border dark:bg-muted dark:text-white border-border focus:border-blue-500 focus:ring-blue-500"
                placeholder="Tag eingeben..."
              />
              <button
                onClick={addTag}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Hinzufügen
              </button>
            </div>
            {data.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(index)}
                      className="ml-1 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Magic Wand Button für alle Felder */}
        <div className={`rounded-lg border border-border bg-muted p-${isMobile ? '3' : '4'} dark:border-border dark:bg-muted`}>
          <div className="mb-2 flex items-center space-x-2">
            <WandSparkles className="h-4 w-4 text-muted-foreground" />
            <span className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium text-muted-foreground dark:text-muted-foreground`}>
              Automatische Vervollständigung:
            </span>
          </div>
          <p className={`mb-3 ${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground dark:text-muted-foreground`}>
            Füllen Sie alle Felder automatisch mit Demo-Daten aus.
          </p>
          <button
            onClick={async () => {
              const demoData = await generateAllStep2Data(
                {
                  ...(wizard ?? {}),
                  step2: data,
                },
                {
                  shortDescription: localShortDescription,
                  description: localDescription,
                  features: localFeatures,
                },
              );
              setLocalShortDescription(demoData.shortDescription);
              setLocalDescription(demoData.description);
              setLocalFeatures(demoData.features);
              onChange({
                ...data,
                ...demoData,
              });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <WandSparkles className="h-4 w-4" />
            Alle Felder automatisch ausfüllen
          </button>
        </div>

        {/* Info Box */}
        <div className={`rounded-lg border border-border bg-blue-50 p-${isMobile ? '3' : '4'} dark:border-border dark:bg-blue-900`}>
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h3 className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium text-blue-800 dark:text-blue-200`}>
                Tipps für gute Beschreibungen:
              </h3>
              <ul className={`mt-1 ${isMobile ? 'text-xs' : 'text-xs'} text-blue-700 dark:text-blue-300 space-y-1`}>
                <li>• Seien Sie präzise und sachlich</li>
                <li>• Verwenden Sie klare, verständliche Sprache</li>
                <li>• Fügen Sie relevante Details hinzu</li>
                <li>• Vermeiden Sie Spekulationen</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2Component;
