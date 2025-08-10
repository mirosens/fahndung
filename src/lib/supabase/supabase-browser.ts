'use client';

import { createClient } from '@supabase/supabase-js';

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

// Singleton
let _client: ReturnType<typeof createClient> | null = null;

export function getBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error("Supabase Browser Client kann nur im Browser verwendet werden");
  }

  if (_client) return _client;
  
  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    realtime: { params: { eventsPerSecond: 2 } }, // Browser ok
  });
  
  return _client;
}

// Export für TypeScript
export type { User } from "@supabase/supabase-js";
