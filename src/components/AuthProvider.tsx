"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "~/hooks/useAuth";
import { getBrowserClient } from "~/lib/supabase/supabase-browser";
import type { Session } from "~/lib/auth";

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { session, loading, error, initialized } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🔥 AUTOMATISCHER TOKEN-REFRESH
  useEffect(() => {
    if (!session || !initialized) return;

    const supabase = getBrowserClient();
    
    // Token-Refresh Timer (alle 30 Minuten)
    const refreshInterval = setInterval(async () => {
      try {
        console.log("🔄 Automatischer Token-Refresh...");
        const { data, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError) {
          console.error("❌ Token-Refresh fehlgeschlagen:", refreshError);
        } else if (data.session) {
          console.log("✅ Token erfolgreich erneuert");
        }
      } catch (err) {
        console.error("❌ Token-Refresh Exception:", err);
      }
    }, 30 * 60 * 1000); // 30 Minuten

    // Session-Validierung Timer (alle 5 Minuten)
    const validationInterval = setInterval(async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error || !currentSession) {
          console.log("⚠️ Session ungültig, bereinige...");
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.error("❌ Session-Validierung fehlgeschlagen:", err);
      }
    }, 5 * 60 * 1000); // 5 Minuten

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      clearInterval(validationInterval);
    };
  }, [session, initialized]);

  // 🔥 PERSISTENTE SESSION-WIEDERHERSTELLUNG
  useEffect(() => {
    const supabase = getBrowserClient();
    
    // Auth State Change Listener für robuste Session-Verwaltung
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🔐 Auth State Change:", event, session?.user?.email);
        
        switch (event) {
          case "SIGNED_IN":
            console.log("✅ Benutzer angemeldet:", session?.user?.email);
            break;
          case "SIGNED_OUT":
            console.log("🚪 Benutzer abgemeldet");
            break;
          case "TOKEN_REFRESHED":
            console.log("🔄 Token erneuert");
            break;
          case "USER_UPDATED":
            console.log("👤 Benutzer aktualisiert");
            break;
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Manueller Session-Refresh
  const refreshSession = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("❌ Manueller Session-Refresh fehlgeschlagen:", error);
      } else if (data.session) {
        console.log("✅ Manueller Session-Refresh erfolgreich");
      }
    } catch (err) {
      console.error("❌ Session-Refresh Exception:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const value: AuthContextType = {
    session,
    loading,
    error,
    initialized,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
