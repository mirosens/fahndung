/**
 * SEO-Utilities für Fahndungs-URLs
 * Generiert SEO-freundliche URLs basierend auf Titel und Fallnummer
 */

// src/lib/seo.ts
const umlautMap: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };

export function generateSeoSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[äöüß]/g, (m) => umlautMap[m] ?? m)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .trim();
}

export function generateShortSeoSlug(title: string, maxLength = 42): string {
  const full = generateSeoSlug(title);
  return full.length > maxLength ? full.slice(0, maxLength).replace(/-+$/,"") : full;
}

export function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

// optional: passe Pattern an euer Format an
export function isCaseNumber(v: string): boolean {
  return /^(?:[A-Z]{2,4}-)?\d{4}-[A-Z]-\d{3,8}(?:-[A-Z])?$/.test(v);
}

export function validateSeoSlug(slug: string): boolean {
  // Validiere, ob der Slug dem erwarteten Format entspricht
  // Erlaubt: Kleinbuchstaben, Zahlen, Bindestriche
  // Mindestlänge: 3 Zeichen, Maximallänge: 100 Zeichen
  const slugPattern = /^[a-z0-9-]{3,100}$/;
  return slugPattern.test(slug) && !slug.startsWith('-') && !slug.endsWith('-');
}

export function getCanonicalFahndungPath(title: string): string {
  // kurze, stabile, SEO-freundliche Variante
  return `/fahndungen/${generateShortSeoSlug(title)}`;
}

export type BreadcrumbItem = { label: string; href?: string; current?: boolean };

export function getBreadcrumbsForInvestigation(title: string): BreadcrumbItem[] {
  const path = getCanonicalFahndungPath(title);
  const shortTitle = title.length > 60 ? `${title.slice(0, 60)}…` : title;
  return [
    { label: "Start", href: "/" },
    { label: "Fahndungen", href: "/fahndungen" },
    { label: shortTitle, href: path, current: true },
  ];
}

// Kompatibilitätsfunktionen für bestehende Komponenten
export function getFahndungUrl(title: string, caseNumber: string): string {
  try {
    return getCanonicalFahndungPath(title);
  } catch {
    // Fallback auf Standard-URL
    return `/fahndungen/${caseNumber}`;
  }
}

export function getFahndungEditUrl(title: string, caseNumber: string): string {
  try {
    const path = getCanonicalFahndungPath(title);
    return `${path}?edit=true`;
  } catch {
    // Fallback auf Standard-URL
    return `/fahndungen/${caseNumber}?edit=true`;
  }
}
