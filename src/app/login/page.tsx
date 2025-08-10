"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { getBrowserClient } from "~/lib/supabase/supabase-browser";
import AuthPageLayout from "~/components/layout/AuthPageLayout";
import AutoSetup from "~/components/AutoSetup";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // Prüfe aktuelle Session beim Laden
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = getBrowserClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (session && !error) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email ?? "");
          setDebugInfo(`✅ Bereits angemeldet als: ${session.user.email}`);

          // Sofortige Weiterleitung ohne Verzögerung
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get("redirect");

          if (redirectUrl && redirectUrl !== "/login") {
            router.push(redirectUrl);
          } else {
            router.push("/dashboard");
          }
        } else {
          setIsAuthenticated(false);
          setUserEmail("");
          setDebugInfo("ℹ️ Keine aktive Session gefunden");
        }
      } catch {
        setDebugInfo("⚠️ Fehler beim Prüfen der Session");
      }
    };

    void checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login-Fehler:", error);
        setError(error.message ?? "Login fehlgeschlagen");
      } else if (data.user) {
        setSuccess(`Willkommen zurück, ${data.user.email}!`);

        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          console.log("✅ Session erstellt:", sessionData.session);
          setIsAuthenticated(true);
          setUserEmail(data.user.email ?? "");

          // Sofortige Weiterleitung ohne Verzögerung
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get("redirect");

          if (redirectUrl && redirectUrl !== "/login") {
            router.push(redirectUrl);
          } else {
            router.push("/dashboard");
          }
        } else {
          setError("Session konnte nicht erstellt werden");
        }
      }
    } catch (err) {
      console.error("Unerwarteter Login-Fehler:", err);
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  // Schnell-Login für Test-Zwecke (nur in Development)
  const handleQuickLogin = async (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setDebugInfo("🚀 Schnell-Login für Test-Benutzer...");

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const supabase = getBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        setError(`Login-Fehler: ${error.message}`);
        setDebugInfo("❌ Schnell-Login fehlgeschlagen");
      } else if (data.user) {
        setSuccess(`Willkommen zurück, ${data.user.email}!`);
        setDebugInfo("✅ Schnell-Login erfolgreich!");

        // Sofortige Weiterleitung ohne Verzögerung
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get("redirect");

        if (redirectUrl && redirectUrl !== "/login") {
          router.push(redirectUrl);
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      setError("Ein unerwarteter Fehler ist aufgetreten");
      setDebugInfo("❌ Unerwarteter Fehler beim Schnell-Login");
    } finally {
      setLoading(false);
    }
  };

  // Logout-Funktion
  const handleLogout = async () => {
    try {
      const supabase = getBrowserClient();
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserEmail("");
      setDebugInfo("✅ Erfolgreich abgemeldet");
      router.push("/");
    } catch {
      setDebugInfo("❌ Fehler beim Abmelden");
    }
  };

  // Debug-Funktion für Session-Status
  const debugSession = async () => {
    try {
      const supabase = getBrowserClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        setDebugInfo(`❌ Session-Debug-Fehler: ${error.message}`);
      } else if (session) {
        setDebugInfo(
          `✅ Session gefunden: ${session.user.email} (Token: ${session.access_token ? "Ja" : "Nein"})`,
        );
      } else {
        setDebugInfo("ℹ️ Keine Session gefunden");
      }
    } catch (err) {
      setDebugInfo(
        `❌ Debug-Fehler: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
      );
    }
  };

  return (
    <AuthPageLayout variant="login">
      <AutoSetup />
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-white p-8 shadow-sm dark:border-border dark:bg-muted">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-muted-foreground dark:text-white">
                Fahndung
              </h1>
              {isAuthenticated ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                    <p className="font-medium text-green-600 dark:text-green-400">
                      ✅ Angemeldet als: {userEmail}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Sie werden automatisch weitergeleitet...
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={handleLogout}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
                    >
                      Abmelden
                    </button>
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                    >
                      Zum Dashboard
                    </button>
                    <button
                      onClick={() => router.push("/fahndungen")}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700"
                    >
                      Zu Fahndungen
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground dark:text-muted-foreground">
                  Anmelden oder Registrieren
                </p>
              )}
            </div>

            {/* Debug-Informationen */}
            {debugInfo && (
              <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/20 p-3">
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-blue-400">{debugInfo}</div>
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="flex items-center space-x-2 rounded-lg border border-red-500/30 bg-red-500/20 p-3">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span className="text-sm text-red-400">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center space-x-2 rounded-lg border border-green-500/30 bg-green-500/20 p-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-green-400">{success}</span>
                  </div>
                )}

                <div>
                  <div className="mb-2 flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground"
                    >
                      E-Mail
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input-dark-mode px-4 py-3"
                      placeholder="ihre@email.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center space-x-2">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground"
                    >
                      Passwort
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input-dark-mode px-4 py-3 pr-12"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-muted-foreground dark:hover:text-muted-foreground"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-600/50"
                  >
                    {loading ? "Anmelden..." : "Anmelden"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/register")}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:bg-green-600/50"
                  >
                    Registrieren
                  </button>
                </div>
              </form>
            )}

            {/* Debug-Buttons für Development */}
            {!isAuthenticated && process.env.NODE_ENV === "development" && (
              <div className="mt-6 space-y-2">
                <div className="text-xs text-muted-foreground">
                  Debug-Tools (Development):
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={debugSession}
                    disabled={loading}
                    className="rounded bg-gray-600 px-3 py-2 text-xs text-white hover:bg-gray-700 disabled:bg-gray-600/50"
                  >
                    <RefreshCw className="mr-1 inline h-3 w-3" />
                    Session-Status prüfen
                  </button>
                </div>
              </div>
            )}

            {/* Schnell-Login Buttons für Development */}
            {!isAuthenticated && process.env.NODE_ENV === "development" && (
              <div className="mt-6 space-y-2">
                <div className="text-xs text-muted-foreground">
                  Schnell-Login (Development):
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin("ptlsweb@gmail.com", "Heute-2025!sp")
                    }
                    disabled={loading}
                    className="rounded bg-purple-600 px-3 py-2 text-xs text-white hover:bg-purple-700 disabled:bg-purple-600/50"
                  >
                    PTLS Web (Super Admin)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin("admin@fahndung.local", "admin123")
                    }
                    disabled={loading}
                    className="rounded bg-blue-600 px-3 py-2 text-xs text-white hover:bg-blue-700 disabled:bg-blue-600/50"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin("editor@fahndung.local", "editor123")
                    }
                    disabled={loading}
                    className="rounded bg-green-600 px-3 py-2 text-xs text-white hover:bg-green-700 disabled:bg-green-600/50"
                  >
                    Editor
                  </button>
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Durch die Anmeldung stimmen Sie unseren{" "}
                  <a
                    href="#"
                    className="text-blue-400 transition-colors hover:text-blue-300"
                  >
                    Nutzungsbedingungen
                  </a>{" "}
                  zu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthPageLayout>
  );
}
