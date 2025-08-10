"use client";

import { getBrowserClient } from "./supabase/supabase-browser";
import { getServerClient } from "./supabase/supabase-server";

// Export der Browser-Client-Instanz für Client-Komponenten
export const supabase = getBrowserClient();

// Export der Server-Client-Funktion für Server-Komponenten
export { getServerClient };

// Export der Browser-Client-Funktion für spezielle Fälle
export { getBrowserClient };

// Export der TypeScript-Typen
export type { User } from "@supabase/supabase-js";
