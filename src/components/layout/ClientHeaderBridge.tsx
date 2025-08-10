"use client";

import type { ReactNode } from "react";
import Header from "./Header";

interface ClientHeaderBridgeProps {
  children: ReactNode;
  className?: string;
}

export default function ClientHeaderBridge({
  children,
  className = "",
}: ClientHeaderBridgeProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <Header variant="home" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
