import "./_polyfills";
import type { Metadata } from "next";
import "~/styles/globals.css";
import "~/styles/fonts.css";
import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionManager } from "~/components/SessionManager";
import { RealtimeSyncWrapper } from "~/components/RealtimeSyncWrapper";
import { OptimizedLayout } from "~/components/layout/OptimizedLayout";
import { PerformanceMonitor } from "~/components/PerformanceMonitor";
import { DevToolsSuppressor } from "~/components/debug/DevToolsSuppressor";
// Der Import von GlobalErrorHandler wurde entfernt, da das Modul nicht gefunden werden kann.

export const metadata: Metadata = {
  title: "Fahndung - PTLS",
  description: "Polizei-Technisches Logistik-System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* Dark Mode Flackern beheben - Vor allem anderen! */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
            const t=localStorage.getItem('theme')||'system';
            document.documentElement.classList.add(t==='system'?
              (matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):t);
          })()`,
          }}
        />
        {/* Preconnect & Prefetch Optimierungen */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        {/* Font Loading Fix - Korrigierter Pfad */}
        <link
          rel="preload"
          href="/font/inter-4/Web fonts/InterVariable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SessionManager />
            <RealtimeSyncWrapper />
            <OptimizedLayout>
              <PerformanceMonitor />
              <DevToolsSuppressor />
              {children}
            </OptimizedLayout>
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
