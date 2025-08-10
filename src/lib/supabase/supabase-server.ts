import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Environment-Variablen-Prüfung
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Fehlende Supabase Environment-Variablen:");
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL:",
    supabaseUrl ? "✅ Gesetzt" : "❌ Fehlt",
  );
  console.error(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
    supabaseAnonKey ? "✅ Gesetzt" : "❌ Fehlt",
  );

  throw new Error(
    "Missing Supabase environment variables for REMOTE environment",
  );
}

// Validiere URL-Format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error(`Invalid Supabase URL: ${supabaseUrl}`);
}

export function getServerClient() {
  if (typeof window !== "undefined") {
    throw new Error("getServerClient kann nur auf dem Server verwendet werden");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: { fetch: fetch },
  });
}

// Export für TypeScript
export type { User } from "@supabase/supabase-js";
