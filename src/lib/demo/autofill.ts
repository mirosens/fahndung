import type { PresetsShape } from "@/lib/demo/presets.types";
import type {
  WizardData,
  Step5Data,
} from "@/components/fahndungen/types/WizardTypes";
import { DEMO_DEFAULTS, resolvePlaceholders } from "@/lib/demo/helpers";

// Dynamischer Import für JSON-Datei (SSR-sicher)
let presets: PresetsShape | null = null;
const getPresets = async (): Promise<PresetsShape> => {
  if (!presets) {
    presets = (await import("@/lib/demo/presets.json")).default as PresetsShape;
  }
  return presets;
};

type PresetCategoryKey =
  | "Straftaeter"
  | "Vermisst"
  | "UnbekannteTote"
  | "Sachen";

function wizardToPresetCategory(
  cat: WizardData["step1"]["category"],
): PresetCategoryKey | null {
  switch (cat) {
    case "WANTED_PERSON":
      return "Straftaeter";
    case "MISSING_PERSON":
      return "Vermisst";
    case "UNKNOWN_DEAD":
      return "UnbekannteTote";
    case "STOLEN_GOODS":
      return "Sachen";
    default:
      return null;
  }
}

function extractCity(address?: string | null): string {
  if (!address) return "";
  const firstComma = address.split(",")[0]?.trim();
  return firstComma ?? address.trim();
}

export interface DemoOverrides {
  offenseType?: string; // e.g., Diebstahl, Raub, ...
  regionCity?: string; // preferred city name when no map location yet
  department?: string; // override department/dienststelle
}

function buildContext(
  data: Partial<WizardData>,
  overrides?: DemoOverrides,
): Record<string, string> {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mmNum = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");

  let city =
    overrides?.regionCity ??
    data.step1?.regionCity ??
    extractCity(data.step4?.mainLocation?.address ?? "");

  // Fallback: wenn keine Karte/Region vorhanden ist, nutze die Dienststelle
  // als Stadt, sofern sie einer bekannten Stadt entspricht (alles außer LKA)
  if (!city || city.length === 0) {
    const dept = data.step1?.department ?? data.step5?.department ?? "";
    const knownCities = [
      "Aalen",
      "Freiburg",
      "Heilbronn",
      "Karlsruhe",
      "Konstanz",
      "Ludwigsburg",
      "Mannheim",
      "Offenburg",
      "Pforzheim",
      "Ravensburg",
      "Reutlingen",
      "Stuttgart",
      "Ulm",
    ];
    if (knownCities.includes(dept)) {
      city = dept;
    }
  }
  return {
    city,
    dienststelle:
      overrides?.department ??
      data.step1?.department ??
      data.step5?.department ??
      DEMO_DEFAULTS.department,
    date: `${yyyy}-${mmNum}-${dd}`,
    time: `${hh}:${mm}`,
    caseNumber: data.step1?.caseNumber ?? "",
    amount: "1000",
    age: "35",
    height: "180",
    build: "schlanke",
    clothing: "dunkle Jacke, Jeans",
    itemBrand: "",
    model: "",
    serial: "",
    color: "",
    features: data.step2?.features ?? "",
    hintUrl: DEMO_DEFAULTS.hintUrl,
    phone: DEMO_DEFAULTS.phone,
    email: DEMO_DEFAULTS.email,
    locationDetail: "Innenstadt",
    tattoo: "Herz",
    personName: "Unbekannte Person",
    pronoun: "die Person",
  };
}

function pickFirst(arr?: string[]): string | null {
  if (!arr || arr.length === 0) return null;
  return arr[0] ?? null;
}

export async function generateDemoTitle(
  data: Partial<WizardData>,
  overrides?: DemoOverrides,
): Promise<string> {
  const catKey = wizardToPresetCategory(data.step1?.category ?? "");
  const ctx = buildContext(data, overrides);
  if (!catKey) return resolvePlaceholders("Fahndung – {city}", ctx);

  let template: string | null = null;
  const P = await getPresets();
  if (catKey === "Vermisst") {
    // Wähle nach Variante, fallback auf Standard
    const variant = data.step1?.variant ?? "Standard";
    template =
      pickFirst(P.Vermisst?.[variant]?.Titel) ??
      pickFirst(P.Vermisst?.["Standard"]?.Titel);
  } else if (catKey === "Straftaeter") {
    const offense = overrides?.offenseType ?? "Diebstahl";
    template = pickFirst(P.Straftaeter?.[offense]?.Titel);
    if (!template && offense) {
      // Generischer Fallback, falls Variante noch nicht in presets vorhanden ist
      template = `${offense} in {city} – Zeugen gesucht`;
    }
  } else if (catKey === "UnbekannteTote") {
    const variant = data.step1?.variant ?? "Standard";
    template =
      pickFirst(P.UnbekannteTote?.[variant]?.Titel) ??
      pickFirst(P.UnbekannteTote?.["Standard"]?.Titel);
  } else if (catKey === "Sachen") {
    template = pickFirst(P.Sachen?.Fahrrad?.Titel);
  }
  return resolvePlaceholders(template ?? "Fahndung – {city}", ctx);
}

export async function generateDemoShortDescription(
  data: Partial<WizardData>,
  overrides?: DemoOverrides,
): Promise<string> {
  const catKey = wizardToPresetCategory(data.step1?.category ?? "");
  const ctx = buildContext(data, overrides);
  if (!catKey) return resolvePlaceholders("Kurzbeschreibung – {city}", ctx);
  let template: string | null = null;
  const P = await getPresets();
  if (catKey === "Vermisst") {
    // Für Kurzbeschreibung nutzen wir die erste Zeile der Beschreibung
    const variant = data.step1?.variant ?? "Standard";
    template =
      pickFirst(P.Vermisst?.[variant]?.Beschreibung) ??
      pickFirst(P.Vermisst?.["Standard"]?.Beschreibung);
  } else if (catKey === "Straftaeter") {
    const offense = overrides?.offenseType ?? "Diebstahl";
    template = pickFirst(P.Straftaeter?.[offense]?.Beschreibung);
    if (!template && offense) {
      template = `Am {date} entwendete der unbekannte Täter in {city} Gegenstände. Kategorie: ${offense}.`;
    }
  } else if (catKey === "UnbekannteTote") {
    const variant = data.step1?.variant ?? "Standard";
    template =
      pickFirst(P.UnbekannteTote?.[variant]?.Beschreibung) ??
      pickFirst(P.UnbekannteTote?.["Standard"]?.Beschreibung);
  } else if (catKey === "Sachen") {
    template = pickFirst(P.Sachen?.Fahrrad?.Beschreibung);
  }
  return resolvePlaceholders(template ?? "Kurzbeschreibung – {city}", ctx);
}

export async function generateDemoDescription(
  data: Partial<WizardData>,
  overrides?: DemoOverrides,
): Promise<string> {
  // Für jetzt identisch zur ShortDescription; später können wir längere Textbausteine unterscheiden
  return generateDemoShortDescription(data, overrides);
}

export function fillContactDefaults(
  data: Partial<WizardData>,
): Partial<WizardData> {
  return {
    ...data,
    step5: {
      ...data.step5!,
      contactPerson: data.step5?.contactPerson ?? "KHK Müller",
      contactPhone: data.step5?.contactPhone ?? DEMO_DEFAULTS.phone,
      contactEmail: data.step5?.contactEmail ?? DEMO_DEFAULTS.email,
      department: data.step5?.department ?? DEMO_DEFAULTS.department,
      availableHours:
        data.step5?.availableHours ?? DEMO_DEFAULTS.availableHours,
    },
  } as Partial<WizardData>;
}

// Neue Hilfsfunktion: Fülle besondere Merkmale aus Presets/Dummywerten
export function generateDemoFeatures(data: Partial<WizardData>): string {
  const ctx = {
    ...buildContext(data),
  } as Record<string, string>;
  // Einfache, allgemeine Vorlage; kann später je Kategorie/Variante aus presets.json gezogen werden
  const templates = [
    "Auffällige {tattoo}-Tätowierung am Unterarm, {clothing}, {build} Statur.",
    "Narbe an der rechten Augenbraue, {clothing}, trägt häufig Kappe.",
    "Trägt Brille, {clothing}, {height} cm groß, {build} Figur.",
  ];
  const text = templates[Math.floor(Math.random() * templates.length)]!;
  return resolvePlaceholders(text, ctx);
}

// Neue Master-Funktion: Fülle alle Step2-Felder auf einmal
export async function generateAllStep2Data(
  data: Partial<WizardData>,
  overrides?: DemoOverrides,
): Promise<{
  shortDescription: string;
  description: string;
  features: string;
  tags: string[];
}> {
  const catKey = wizardToPresetCategory(data.step1?.category ?? "");
  const ctx = buildContext(data, overrides);

  // Generiere alle Texte
  const shortDescription = await generateDemoShortDescription(data, overrides);
  const description = await generateDemoDescription(data, overrides);
  const features = generateDemoFeatures(data);

  // Generiere passende Tags basierend auf Kategorie und Variante
  const tags: string[] = [];

  // Basis-Tags aus Kategorie
  if (catKey === "Vermisst") {
    tags.push("Vermisst", "Personensuche");
    const variant = data.step1?.variant;
    if (variant === "Kind") tags.push("Kind", "Jugendlich");
    else if (variant === "Senior") tags.push("Senior", "Ältere Person");
    else if (variant === "Psychisch") tags.push("Psychisch", "Betreuung");
  } else if (catKey === "Straftaeter") {
    tags.push("Straftäter", "Zeugenaufruf");
    const variant = data.step1?.variant;
    if (variant === "Gewalt") tags.push("Gewalt", "Gefährlich");
    else if (variant === "Diebstahl") tags.push("Diebstahl", "Eigentum");
    else if (variant === "Betrug") tags.push("Betrug", "Finanzen");
  } else if (catKey === "UnbekannteTote") {
    tags.push("Unbekannter Toter", "Identifikation");
  } else if (catKey === "Sachen") {
    tags.push("Sachfahndung", "Diebstahl");
    const variant = data.step1?.variant;
    if (variant === "Fahrrad") tags.push("Fahrrad", "Zweirad");
    else if (variant === "Auto") tags.push("Auto", "Fahrzeug");
    else if (variant === "Elektronik") tags.push("Elektronik", "Technik");
  }

  // Stadt-Tag hinzufügen
  if (ctx.city) {
    tags.push(ctx.city);
  }

  // Prioritäts-Tag
  const priority = data.step1?.priority;
  if (priority === "high") tags.push("Hochpriorität");
  else if (priority === "urgent") tags.push("Dringend");

  // Entferne Duplikate
  const uniqueTags = [...new Set(tags)];

  return {
    shortDescription,
    description,
    features,
    tags: uniqueTags,
  };
}

// Neue Funktionen für Step5: Kontaktdaten
export function generateDemoContactPerson(data: Partial<WizardData>): string {
  const department = data.step1?.department ?? data.step5?.department ?? "";
  const priority = data.step1?.priority;

  // Verschiedene Kontaktpersonen basierend auf Priorität und Abteilung
  const contacts = [
    "KHK Müller",
    "KK Weber",
    "PHK Schmidt",
    "KOK Fischer",
    "Kriminalhauptkommissar Meyer",
    "Kriminalkommissar Wagner",
    "Polizeihauptkommissar Schulz",
    "Kriminaloberkommissar Hoffmann",
  ];

  // Bei dringenden Fällen verwende höhere Ränge
  if (priority === "urgent") {
    return contacts[0] || "KHK Müller"; // Kriminalhauptkommissar
  } else if (priority === "high") {
    return contacts[1] || "KK Weber"; // Kriminalkommissar
  } else {
    return (
      contacts[Math.floor(Math.random() * contacts.length)] || "KHK Müller"
    );
  }
}

export function generateDemoContactPhone(data: Partial<WizardData>): string {
  const department = data.step1?.department ?? data.step5?.department ?? "";
  const city = extractCity(department);

  // Verschiedene Telefonnummern basierend auf Stadt/Abteilung
  const phoneNumbers = [
    "0711 899-0000", // Stuttgart
    "0721 666-0000", // Karlsruhe
    "0621 174-0000", // Mannheim
    "0761 882-0000", // Freiburg
    "0731 188-0000", // Ulm
    "0751 366-0000", // Ravensburg
    "07121 301-0000", // Reutlingen
    "07141 910-0000", // Ludwigsburg
    "07131 56-0000", // Heilbronn
    "0781 82-0000", // Offenburg
    "07231 39-0000", // Pforzheim
    "07361 52-0000", // Aalen
    "07531 98-0000", // Konstanz
  ];

  // Versuche passende Nummer zur Stadt zu finden
  if (city) {
    const cityMap: Record<string, string> = {
      Stuttgart: "0711 899-0000",
      Karlsruhe: "0721 666-0000",
      Mannheim: "0621 174-0000",
      Freiburg: "0761 882-0000",
      Ulm: "0731 188-0000",
      Ravensburg: "0751 366-0000",
      Reutlingen: "07121 301-0000",
      Ludwigsburg: "07141 910-0000",
      Heilbronn: "07131 56-0000",
      Offenburg: "0781 82-0000",
      Pforzheim: "07231 39-0000",
      Aalen: "07361 52-0000",
      Konstanz: "07531 98-0000",
    };

    if (cityMap[city]) {
      return cityMap[city];
    }
  }

  // Fallback: zufällige Nummer
  return (
    phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)] ||
    DEMO_DEFAULTS.phone
  );
}

export function generateDemoContactEmail(data: Partial<WizardData>): string {
  const department = data.step1?.department ?? data.step5?.department ?? "";
  const city = extractCity(department);

  // Verschiedene E-Mail-Adressen basierend auf Stadt/Abteilung
  const emailTemplates = [
    "hinweise@polizei-bw.de",
    "kriminalpolizei@polizei-bw.de",
    "fahndung@polizei-bw.de",
    "kontakt@polizei-bw.de",
  ];

  // Spezielle E-Mails für bestimmte Städte
  if (city) {
    const cityEmails: Record<string, string> = {
      Stuttgart: "hinweise@polizei-stuttgart.de",
      Karlsruhe: "hinweise@polizei-karlsruhe.de",
      Mannheim: "hinweise@polizei-mannheim.de",
      Freiburg: "hinweise@polizei-freiburg.de",
      Ulm: "hinweise@polizei-ulm.de",
    };

    if (cityEmails[city]) {
      return cityEmails[city];
    }
  }

  // Fallback: zufällige E-Mail
  return (
    emailTemplates[Math.floor(Math.random() * emailTemplates.length)] ||
    DEMO_DEFAULTS.email
  );
}

export function generateDemoDepartment(data: Partial<WizardData>): string {
  const department = data.step1?.department ?? "";
  const category = data.step1?.category;

  // Verschiedene Abteilungen basierend auf Kategorie
  const departments = [
    "Kriminalpolizei",
    "Kriminalhauptkommissariat",
    "Ermittlungsgruppe",
    "Fahndungsgruppe",
    "Sachbearbeitung",
    "Kriminalinspektion",
  ];

  // Spezielle Abteilungen für bestimmte Kategorien
  if (category === "MISSING_PERSON") {
    return "Vermisstensachbearbeitung";
  } else if (category === "WANTED_PERSON") {
    return "Fahndungsgruppe";
  } else if (category === "UNKNOWN_DEAD") {
    return "Kriminalinspektion";
  } else if (category === "STOLEN_GOODS") {
    return "Sachbearbeitung";
  }

  // Fallback: zufällige Abteilung
  return (
    departments[Math.floor(Math.random() * departments.length)] ||
    DEMO_DEFAULTS.department
  );
}

export function generateDemoAvailableHours(data: Partial<WizardData>): string {
  const priority = data.step1?.priority;

  // Verschiedene Verfügbarkeiten basierend auf Priorität
  const hours = [
    "Mo–Fr 08:00–18:00",
    "Mo–Fr 08:00–16:00",
    "Mo–Do 08:00–17:00, Fr 08:00–15:00",
    "Mo–Fr 07:00–19:00",
    "24/7 erreichbar",
    "Mo–So 08:00–20:00",
  ];

  // Bei dringenden Fällen 24/7 oder erweiterte Zeiten
  if (priority === "urgent") {
    return "24/7 erreichbar";
  } else if (priority === "high") {
    return "Mo–So 08:00–20:00";
  } else {
    return (
      hours[Math.floor(Math.random() * hours.length)] ||
      DEMO_DEFAULTS.availableHours
    );
  }
}

// Neue Master-Funktion: Fülle alle Step5-Felder auf einmal
export function generateAllStep5Data(data: Partial<WizardData>): {
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  department: string;
  availableHours: string;
  publishStatus: Step5Data["publishStatus"];
  urgencyLevel: Step5Data["urgencyLevel"];
  visibility: Step5Data["visibility"];
  notifications: Step5Data["notifications"];
  articlePublishing: Step5Data["articlePublishing"];
} {
  const priority = data.step1?.priority;
  const category = data.step1?.category;

  // Bestimme Veröffentlichungsstatus basierend auf Priorität
  let publishStatus: Step5Data["publishStatus"] = "draft";
  if (priority === "urgent") {
    publishStatus = "immediate";
  } else if (priority === "high") {
    publishStatus = "review";
  } else {
    publishStatus = "draft";
  }

  // Bestimme Dringlichkeitsstufe basierend auf Priorität
  let urgencyLevel: Step5Data["urgencyLevel"] = "medium";
  if (priority === "urgent") {
    urgencyLevel = "critical";
  } else if (priority === "high") {
    urgencyLevel = "high";
  } else {
    urgencyLevel = "medium";
  }

  // Sichtbarkeit basierend auf Kategorie und Priorität
  const visibility: Step5Data["visibility"] = {
    internal: true,
    regional: priority === "urgent" || priority === "high",
    national: priority === "urgent" || category === "MISSING_PERSON",
    international: priority === "urgent" && category === "WANTED_PERSON",
  };

  // Benachrichtigungen basierend auf Priorität
  const notifications: Step5Data["notifications"] = {
    emailAlerts: true,
    smsAlerts: priority === "urgent",
    appNotifications: true,
    pressRelease: priority === "urgent" || priority === "high",
  };

  // Artikel-Veröffentlichung basierend auf Priorität
  const articlePublishing: Step5Data["articlePublishing"] = {
    publishAsArticle: priority === "urgent" || priority === "high",
    generateSeoUrl: priority === "urgent" || priority === "high",
    seoTitle: "",
    seoDescription: "",
    keywords: [],
  };

  return {
    contactPerson: generateDemoContactPerson(data),
    contactPhone: generateDemoContactPhone(data),
    contactEmail: generateDemoContactEmail(data),
    department: generateDemoDepartment(data),
    availableHours: generateDemoAvailableHours(data),
    publishStatus,
    urgencyLevel,
    visibility,
    notifications,
    articlePublishing,
  };
}
