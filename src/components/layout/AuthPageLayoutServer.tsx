import type { ReactNode } from "react";
import HeaderStatic from "./headers/HeaderStatic";
import FooterServer from "./FooterServer";

interface AuthPageLayoutServerProps {
  children: ReactNode;
  variant: "login" | "register";
  className?: string;
}

export default function AuthPageLayoutServer({
  children,
  variant,
  className = "",
}: AuthPageLayoutServerProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <HeaderStatic />
      <main className="flex-1">{children}</main>
      <FooterServer variant={variant} />
    </div>
  );
}
