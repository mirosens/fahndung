import { createClient } from "@supabase/supabase-js";

// Erweitere das Window-Interface um die globale Supabase-Client-Eigenschaft
declare global {
  interface Window {
    __globalSupabaseClient?: ReturnType<typeof createClient>;
  }
}

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

// Globaler Supabase-Client - wird nur einmal erstellt
let globalSupabaseClient: ReturnType<typeof createClient> | null = null;

export function getGlobalSupabaseClient() {
  if (globalSupabaseClient) {
    return globalSupabaseClient;
  }

  // Erstelle neue Instanz nur wenn keine existiert
  globalSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "fahndung-global-auth-token", // Eindeutiger globaler Key
      debug: process.env.NODE_ENV === "development",
    },
    global: {
      headers: {
        "X-Client-Info": "fahndung-global",
      },
    },
  });

  // Speichere global für Browser
  if (typeof window !== "undefined") {
    window.__globalSupabaseClient = globalSupabaseClient;
  }

  return globalSupabaseClient;
}

// Cleanup-Funktion für Tests
export function resetGlobalSupabaseClient() {
  globalSupabaseClient = null;
  if (typeof window !== "undefined") {
    delete window.__globalSupabaseClient;
  }
}
