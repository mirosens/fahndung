import type { ReactNode } from "react";
import HeaderStatic from "./headers/HeaderStatic";
import FooterServer from "./FooterServer";

interface PageLayoutServerProps {
  children: ReactNode;
  variant?: "home" | "dashboard" | "login" | "register" | "admin";
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export default function PageLayoutServer({
  children,
  variant = "home",
  showHeader = true,
  showFooter = true,
  className = "",
}: PageLayoutServerProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Server-sicherer Header */}
      {showHeader && <HeaderStatic />}

      {/* Main Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {showFooter && <FooterServer variant={variant} />}
    </div>
  );
}
