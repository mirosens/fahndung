"use client";

import { useState, useTransition } from "react";
import { getBrowserClient } from "~/lib/supabase/supabase-browser";
import { clearAuthSession } from "~/lib/auth";
import type { Session as SupabaseSession } from "@supabase/supabase-js";

// Verbesserte Logging-Funktionen
const log = (message: string, ...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Auth] ${message}`, ...args);
  }
};

const logError = (message: string, ...args: unknown[]) => {
  console.error(`[Auth] ${message}`, ...args);
};

// Timeout-Wrapper für bessere Fehlerbehandlung
const raceWithTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), timeoutMs),
  );
  return Promise.race([promise, timeoutPromise]);
};

/**
 * Encapsulated supabase authentication actions.  This hook uses
 * `useTransition` to ensure that the UI remains responsive while
 * asynchronous authentication operations (sign in, sign up, sign out)
 * are running.  It centralises success/error handling and logging.
 */
export function useSupabaseAuthActions() {
  // React 18 transition state; `pending` is true while a transition is running
  const [pending, startTransition] = useTransition();
  // Expose error and success messages for UI rendering
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  /**
   * Sign in a user using Supabase.  Resets messages before starting and
   * logs results.  Errors are captured and stored in `errorMsg`.
   */
  const signIn = (email: string, password: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setDebugInfo("🔄 Starte Anmeldung...");

    startTransition(async () => {
      try {
        log("🔐 Login: Versuche Anmeldung für:", email);

        const supabase = getBrowserClient();

        // Zuerst Session bereinigen
        setDebugInfo("🧹 Bereinige alte Session...");
        await clearAuthSession(supabase);
        setDebugInfo("🔍 Prüfe Anmeldedaten...");

        const { data, error } = await raceWithTimeout(
          supabase.auth.signInWithPassword({
            email,
            password,
          }),
          15000, // Erhöht auf 15 Sekunden
        );

        if (error) {
          logError("❌ Login: Anmeldung fehlgeschlagen:", error.message);
          setDebugInfo("❌ Anmeldung fehlgeschlagen");

          // Verbesserte Fehlerbehandlung
          if (error.message.includes("Invalid login credentials")) {
            setErrorMsg(
              "Ungültige Anmeldedaten. Bitte überprüfen Sie E-Mail und Passwort.",
            );
          } else if (error.message.includes("Email not confirmed")) {
            setErrorMsg(
              "E-Mail-Adresse noch nicht bestätigt. Bitte prüfen Sie Ihr Postfach.",
            );
          } else if (error.message.includes("Too many requests")) {
            setErrorMsg(
              "Zu viele Anmeldeversuche. Bitte warten Sie einen Moment.",
            );
          } else if (error.message.includes("Auth session missing")) {
            setErrorMsg("Session-Fehler. Bitte versuchen Sie es erneut.");
          } else if (error.message.includes("Network")) {
            setErrorMsg(
              "Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.",
            );
          } else {
            setErrorMsg(`Anmeldung fehlgeschlagen: ${error.message}`);
          }
        } else if (data.user) {
          log("✅ Login: Anmeldung erfolgreich für:", data.user.email);
          setDebugInfo("✅ Anmeldung erfolgreich!");
          setSuccessMsg(`Willkommen zurück, ${data.user.email}!`);

          // Prüfe Session nach erfolgreicher Anmeldung
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData.session) {
              setDebugInfo("✅ Session erstellt und Token verfügbar");
              log("✅ Session erstellt:", {
                userId: (sessionData.session as SupabaseSession).user.id,
                tokenLength:
                  (sessionData.session as SupabaseSession).access_token
                    ?.length ?? 0,
              });
            } else {
              setDebugInfo("⚠️ Session erstellt, aber kein Token verfügbar");
            }
          } catch (sessionError) {
            logError("⚠️ Fehler beim Prüfen der Session:", sessionError);
            setDebugInfo("⚠️ Session erstellt, aber Prüfung fehlgeschlagen");
          }
        } else {
          setErrorMsg("Anmeldung fehlgeschlagen: Kein Benutzer zurückgegeben");
          setDebugInfo("❌ Kein Benutzer zurückgegeben");
        }
      } catch (err) {
        logError("❌ Login: Unerwarteter Fehler:", err);
        setErrorMsg(err instanceof Error ? err.message : "Unbekannter Fehler");
        setDebugInfo("❌ Unerwarteter Fehler");
      }
    });
  };

  /**
   * Register a new user using Supabase.  Handles success and error messages.
   */
  const signUp = (email: string, password: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setDebugInfo("🔄 Starte Registrierung...");

    startTransition(async () => {
      try {
        log("📝 SignUp: Versuche Registrierung für:", email);
        const supabase = getBrowserClient();

        setDebugInfo("🔍 Prüfe E-Mail-Verfügbarkeit...");

        const { data, error } = await raceWithTimeout(
          supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          }),
          15000,
        );

        if (error) {
          logError("❌ SignUp: Registrierung fehlgeschlagen:", error.message);
          setDebugInfo("❌ Registrierung fehlgeschlagen");

          if (error.message.includes("User already registered")) {
            setErrorMsg(
              "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.",
            );
          } else if (error.message.includes("Invalid email")) {
            setErrorMsg("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
          } else if (error.message.includes("Password")) {
            setErrorMsg("Das Passwort muss mindestens 6 Zeichen lang sein.");
          } else if (error.message.includes("Too many requests")) {
            setErrorMsg(
              "Zu viele Registrierungsversuche. Bitte warten Sie einen Moment.",
            );
          } else {
            setErrorMsg(`Registrierung fehlgeschlagen: ${error.message}`);
          }
        } else {
          log("✅ SignUp: Registrierung erfolgreich für:", data.user?.email);
          setDebugInfo("✅ Registrierung erfolgreich!");
          setSuccessMsg(
            "Registrierung erfolgreich! Bitte bestätigen Sie Ihre E‑Mail-Adresse.",
          );
        }
      } catch (err) {
        logError("❌ SignUp: Unerwarteter Fehler:", err);
        setErrorMsg(err instanceof Error ? err.message : "Unbekannter Fehler");
        setDebugInfo("❌ Unerwarteter Fehler");
      }
    });
  };

  /**
   * Sign the current user out.  On success a success message is set.
   */
  const signOut = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setDebugInfo("🔄 Starte Abmeldung...");

    startTransition(async () => {
      try {
        log("🚪 Logout: Starte Abmeldung...");
        const supabase = getBrowserClient();

        setDebugInfo("🧹 Bereinige Session...");
        const { error } = await raceWithTimeout(supabase.auth.signOut(), 10000);

        if (error) {
          logError("❌ Logout: Abmeldung fehlgeschlagen:", error.message);
          setErrorMsg(error.message);
          setDebugInfo("❌ Abmeldung fehlgeschlagen");
        } else {
          log("✅ Logout: Abmeldung erfolgreich");
          setSuccessMsg("Abmeldung erfolgreich!");
          setDebugInfo("✅ Abmeldung erfolgreich");
        }
      } catch (err) {
        logError("❌ Logout: Unerwarteter Fehler:", err);
        setErrorMsg(err instanceof Error ? err.message : "Unbekannter Fehler");
        setDebugInfo("❌ Unerwarteter Fehler");
      }
    });
  };

  /**
   * Check current authentication status
   */
  const checkAuthStatus = async () => {
    try {
      const supabase = getBrowserClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        logError("❌ Auth Status Check fehlgeschlagen:", error);
        return { isAuthenticated: false, user: null, error: error.message };
      }

      if (session?.user) {
        log("✅ Auth Status: Benutzer angemeldet:", session.user.email);
        return {
          isAuthenticated: true,
          user: session.user,
          error: null,
        };
      } else {
        log("ℹ️ Auth Status: Kein Benutzer angemeldet");
        return { isAuthenticated: false, user: null, error: null };
      }
    } catch (err) {
      logError("❌ Auth Status Check Exception:", err);
      return {
        isAuthenticated: false,
        user: null,
        error: err instanceof Error ? err.message : "Unbekannter Fehler",
      };
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    checkAuthStatus,
    pending,
    errorMsg,
    successMsg,
    debugInfo,
  };
}
