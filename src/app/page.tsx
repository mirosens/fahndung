"use client";

import HomeContent from "~/components/home/HomeContent";
import { GlobalBackground } from "~/components/ui/GlobalBackground";
import { useAuth } from "~/hooks/useAuth";
import PageLayout from "~/components/layout/PageLayout";

export default function Home() {
  const { session } = useAuth();

  return (
    <PageLayout variant="home" session={session}>
      <GlobalBackground />
      <HomeContent />
    </PageLayout>
  );
}
