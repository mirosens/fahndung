"use client";

import type { ReactNode } from "react";
import HeaderSwitch from "./HeaderSwitch";
import Footer from "./Footer";

interface ClientPageLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function ClientPageLayout({
  children,
  className = "",
}: ClientPageLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <HeaderSwitch interactive={true} />
      <main className="flex-1">{children}</main>
      <Footer variant="home" />
    </div>
  );
}
