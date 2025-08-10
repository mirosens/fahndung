/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// src/app/fahndungen/[slug]/page.tsx
import { redirect, notFound } from "next/navigation";
import { isUuid, isCaseNumber, getCanonicalFahndungPath } from "~/lib/seo";
import { api } from "~/trpc/server";
import FahndungCategoriesContainer from "~/components/fahndungen/categories/FahndungCategoriesContainer";

type Props = { params: Promise<{ slug: string }> };

export default async function FahndungSlugPage({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // 1) Ermitteln, wie wir laden
  let investigation: Awaited<
    ReturnType<typeof api.post.getInvestigation>
  > | null = null;

  try {
    if (isUuid(decodedSlug)) {
      const result = await api.post.getInvestigation({ id: decodedSlug });
      investigation = result;
    } else if (isCaseNumber(decodedSlug)) {
      const result = await api.post.getInvestigation({ id: decodedSlug });
      investigation = result;
    } else {
      // SEO-Slug -> lookup by slug/title in deiner API (falls vorhanden),
      // oder Fallback: suche via "getInvestigationBySlug"
      const getInvestigationBySlug = api.post.getInvestigationBySlug;
      if (getInvestigationBySlug) {
        const result = await getInvestigationBySlug({ slug: decodedSlug });
        investigation = result;
      }
    }
  } catch (error) {
    // Fehler beim Laden der Untersuchung - setze auf null
    console.error("Fehler beim Laden der Fahndung:", error);
    investigation = null;
  }

  if (!investigation) {
    return notFound();
  }

  // 2) Kanonische URL bestimmen & ggf. redirecten
  const canonicalPath = getCanonicalFahndungPath(investigation.title);
  if (`/fahndungen/${decodedSlug}` !== canonicalPath) {
    // 308 = dauerhaft, behält Methode/Body
    redirect(canonicalPath);
  }

  // 3) Render
  return <FahndungCategoriesContainer investigationId={investigation.id} />;
}

// Metadata für SEO
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  // 1) Ermitteln, wie wir laden
  let investigation: Awaited<
    ReturnType<typeof api.post.getInvestigation>
  > | null = null;

  try {
    if (isUuid(decodedSlug)) {
      const result = await api.post.getInvestigation({ id: decodedSlug });
      investigation = result;
    } else if (isCaseNumber(decodedSlug)) {
      const result = await api.post.getInvestigation({ id: decodedSlug });
      investigation = result;
    } else {
      const getInvestigationBySlug = api.post.getInvestigationBySlug;
      if (getInvestigationBySlug) {
        const result = await getInvestigationBySlug({ slug: decodedSlug });
        investigation = result;
      }
    }
  } catch (error) {
    // Fehler beim Laden der Untersuchung - setze auf null
    console.error("Fehler beim Laden der Fahndung für Metadata:", error);
    investigation = null;
  }

  if (!investigation) {
    return {
      title: "Fahndung nicht gefunden",
      description: "Die angeforderte Fahndung konnte nicht gefunden werden.",
    };
  }

  const canonicalPath = getCanonicalFahndungPath(investigation.title);

  return {
    title: `${investigation.title} - Fahndung ${investigation.case_number}`,
    description: investigation.short_description ?? investigation.description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${investigation.title} - Fahndung ${investigation.case_number}`,
      description: investigation.short_description ?? investigation.description,
      url: canonicalPath,
      type: "article",
    },
  };
}
