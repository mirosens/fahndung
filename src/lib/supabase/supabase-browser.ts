"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseAnonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

// Singleton - KEINE custom storage config!
let _client: ReturnType<typeof createClient> | null = null;

export function getBrowserClient() {
  _client ??= createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}

// Export für TypeScript
export type { User } from "@supabase/supabase-js";
