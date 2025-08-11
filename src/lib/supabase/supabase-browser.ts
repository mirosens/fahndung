"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

// Singleton mit robuster Session-Konfiguration
let _client: ReturnType<typeof createClient> | null = null;

export function getBrowserClient() {
  // Prüfe ob bereits eine Instanz existiert
  if (typeof window !== 'undefined' && (window as any).__supabaseClient) {
    return (window as any).__supabaseClient;
  }

  if (_client) {
    return _client;
  }

  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // 🔥 ROBUSTE SESSION-PERSISTIERUNG
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "supabase-auth-token",
      // Erhöhte Timeouts für bessere Stabilität
      debug: process.env.NODE_ENV === "development",
    },
    // Globale Konfiguration für bessere Performance
    global: {
      headers: {
        "X-Client-Info": "fahndung-web",
      },
    },
  });
  
  // Speichere Client global für Browser
  if (typeof window !== 'undefined') {
    (window as any).__supabaseClient = _client;
  }
  
  return _client;
}

// Export für TypeScript
export type { User } from "@supabase/supabase-js";
