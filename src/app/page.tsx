"use client";

import HomeContent from "~/components/home/HomeContent";
import { GlobalBackground } from "~/components/ui/GlobalBackground";
import { useAuth } from "./providers";
import PageLayout from "~/components/layout/PageLayout";

// Verhindere Pre-rendering für diese Seite
export const dynamic = "force-dynamic";

export default function Home() {
  const { session } = useAuth();

  return (
    <PageLayout variant="home" session={session}>
      <GlobalBackground />
      <HomeContent />
    </PageLayout>
  );
}
