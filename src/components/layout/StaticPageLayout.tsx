import type { ReactNode } from "react";
import HeaderSwitch from "./HeaderSwitch";
import FooterServer from "./FooterServer";

interface StaticPageLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function StaticPageLayout({
  children,
  className = "",
}: StaticPageLayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <HeaderSwitch interactive={false} />
      <main className="flex-1">{children}</main>
      <FooterServer variant="home" />
    </div>
  );
}
