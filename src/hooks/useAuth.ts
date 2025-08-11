"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "~/lib/supabase/supabase-browser";
import { clearAuthSession, handle403Error } from "~/lib/auth";
import type { Session } from "~/lib/auth";
import type { Session as SupabaseSession, User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const router = useRouter();

  // Ref für Session-Check Status um Endlosschleifen zu verhindern
  const isCheckingSession = useRef(false);
  const hasInitialized = useRef(false);
  const retryCount = useRef(0);
  const maxRetries = 1; // RADIKALE OPTIMIERUNG: Nur 1 Retry

  // Verbesserte Session-Prüfung mit Retry-Logic
  const checkSession = useCallback(async (force = false) => {
    // Verhindere gleichzeitige Session-Checks
    if (isCheckingSession.current && !force) {
      return;
    }

    // Verhindere zu viele Retries
    if (retryCount.current >= maxRetries && !force) {
      setSession(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    isCheckingSession.current = true;
    setLoading(true);
    setError(null);
    setTimeoutReached(false);

    // RADIKALE OPTIMIERUNG: Noch kürzerer Timeout
    const supabase = getBrowserClient();

    try {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise<{ data: { session: null } }>(
        (resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 500), // Reduziert auf 500ms
      );

      const result = await Promise.race([sessionPromise, timeoutPromise]);
      const { data: sessionData } = result as {
        data: { session: SupabaseSession | null };
        error?: { message: string };
      };

      // Prüfe ob es einen error gibt (nur wenn error Property existiert)
      if ("error" in result && result.error) {
        console.error("❌ Session-Fehler:", result.error);
        setSession(null);
        return;
      }

      if (!sessionData.session) {
        setSession(null);
        return;
      }

      // Prüfe Token-Ablauf
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = sessionData.session.expires_at;

      if (expiresAt && now >= expiresAt) {
        await clearAuthSession(supabase);
        setSession(null);
        return;
      }

      const user: User = sessionData.session.user;

      // Benutzer-Profil abrufen mit einfacher Fehlerbehandlung
      try {
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("❌ Profil-Fehler:", profileError);
          
          // Bei 406 Fehler (RLS Problem) - versuche ohne Profil weiterzumachen
          if (profileError.code === '406' || profileError.message?.includes('406') || profileError.status === 406) {
            console.log("⚠️ RLS Problem erkannt - fahre ohne Profil fort");
            setSession({
              user: {
                id: user.id,
                email: user.email ?? "",
              },
              profile: null,
            });
            retryCount.current = 0;
            return;
          }
          
          // Bei allen anderen Fehlern - Session trotzdem setzen
          console.log("⚠️ Profil-Fehler, aber Session wird trotzdem gesetzt");
          setSession({
            user: {
              id: user.id,
              email: user.email ?? "",
            },
            profile: null,
          });
          retryCount.current = 0; // Reset retry count on success
          return;
        }
        
        // Erfolgreich - Session mit Profil setzen
        console.log("✅ Profil erfolgreich geladen");

        setSession({
          user: {
            id: user.id,
            email: user.email ?? "",
          },
          profile: profile as unknown as Session["profile"],
        });
        retryCount.current = 0; // Reset retry count on success
      } catch (profileError) {
        console.error("❌ Profil-Exception:", profileError);
        setSession({
          user: {
            id: user.id,
            email: user.email ?? "",
          },
          profile: null,
        });
        retryCount.current = 0; // Reset retry count on success
      }
    } catch (err) {
      console.error("❌ Fehler beim Prüfen der Session:", err);

      // 403-Fehler spezifisch behandeln
      await handle403Error(supabase, err);

      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setSession(null);

      // Bei Timeout-Fehlern Session bereinigen
      if (err instanceof Error && err.message.includes("Timeout")) {
        setTimeoutReached(true);
        await clearAuthSession(supabase);
      }

      // Increment retry count
      retryCount.current++;
    } finally {
      setLoading(false);
      setInitialized(true);
      isCheckingSession.current = false;
      hasInitialized.current = true;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const supabase = getBrowserClient();
      // Session bereinigen
      await clearAuthSession(supabase);

      // Session-State zurücksetzen
      setSession(null);
      setLoading(false);
      setInitialized(true);
      setError(null);
      retryCount.current = 0; // Reset retry count

      router.push("/login");
    } catch (err) {
      console.error("❌ Unerwarteter Fehler beim Logout:", err);
      setError("Fehler beim Abmelden");

      // Auch bei Fehlern zur Login-Seite weiterleiten
      router.push("/login");
    }
  }, [router]);

  // Initialisierung nur einmal
  useEffect(() => {
    if (!hasInitialized.current) {
      void checkSession();
    }
  }, [checkSession]);

  // Auth State Change Listener mit reduzierten Logs
  useEffect(() => {
    const supabase = getBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Reduzierte Logs - nur bei wichtigen Events
      if (event === "SIGNED_OUT") {
        setSession(null);
        setLoading(false);
        setInitialized(true);
        setError(null);
        retryCount.current = 0;
      } else if (event === "SIGNED_IN" && session) {
        const customSession = {
          user: {
            id: session.user.id,
            email: session.user.email ?? "",
          },
          profile: null, // Wird später geladen
        };
        setSession(customSession);
        setLoading(false);
        setInitialized(true);
        setError(null);
        retryCount.current = 0;
      }
      // TOKEN_REFRESHED und andere Events komplett ignorieren
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Zusätzlicher Effect für Message Port Error Handling
  useEffect(() => {
    const handleMessagePortError = (event: ErrorEvent) => {
      if (event.message.includes("message port closed")) {
        // Ignoriere Message Port Fehler - sie sind normal bei Tab-Wechsel
        return true;
      }
      return false;
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as unknown;
      if (reason && typeof reason === "object" && "message" in reason) {
        const message = String((reason as { message: unknown }).message);
        if (message.includes("403") ?? message.includes("Forbidden")) {
          // Behandle 403-Fehler automatisch
          const supabase = getBrowserClient();
          void handle403Error(supabase, reason);
          return true;
        }
      }
      return false;
    };

    // Event Listener hinzufügen
    window.addEventListener("error", handleMessagePortError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleMessagePortError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return {
    session,
    loading: loading ?? !initialized,
    error,
    logout,
    checkSession,
    isAuthenticated: !!session,
    initialized,
    timeoutReached,
    user: session?.user ?? null,
  };
};
