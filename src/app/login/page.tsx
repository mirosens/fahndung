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
} from "lucide-react";
import { getBrowserClient } from "~/lib/supabase/supabase-browser";
import AuthPageLayout from "~/components/layout/AuthPageLayout";
import AutoSetup from "~/components/AutoSetup";

// Verhindere Pre-rendering für diese Seite
export const dynamic = "force-dynamic";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [sessionCheckComplete, setSessionCheckComplete] = useState(false);
  const router = useRouter();

  // 🔥 ROBUSTE SESSION-PRÜFUNG BEIM LADEN
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("🔍 Prüfe bestehende Session...");
        const supabase = getBrowserClient();

        // Prüfe Session mit Timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>(
          (resolve) =>
            setTimeout(() => resolve({ data: { session: null } }), 3000),
        );

        const result = await Promise.race([sessionPromise, timeoutPromise]);
        const {
          data: { session },
          error,
        } = result as any;

        if (session && !error) {
          console.log("✅ Bestehende Session gefunden:", session.user.email);
          setIsAuthenticated(true);
          setUserEmail(session.user.email ?? "");

          // 🔥 INTELLIGENTE WEITERLEITUNG
          const urlParams = new URLSearchParams(window.location.search);
          const redirectUrl = urlParams.get("redirect");
          const savedRedirect = sessionStorage.getItem("redirectAfterLogin");

          let targetUrl = "/";

          if (
            redirectUrl &&
            redirectUrl !== "/login" &&
            !redirectUrl.includes("/login")
          ) {
            targetUrl = redirectUrl;
            // Cleanup URL Parameter
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
          } else if (savedRedirect && savedRedirect !== "/login") {
            targetUrl = savedRedirect;
            sessionStorage.removeItem("redirectAfterLogin");
          }

          console.log("🔄 SOFORTIGE Weiterleitung zu:", targetUrl);

          // SOFORTIGE Weiterleitung ohne Verzögerung
          router.push(targetUrl);
        } else {
          console.log("ℹ️ Keine bestehende Session gefunden");
          setIsAuthenticated(false);
          setUserEmail("");
        }
      } catch (err) {
        console.error("❌ Session-Check Fehler:", err);
        setIsAuthenticated(false);
      } finally {
        setSessionCheckComplete(true);
      }
    };

    void checkSession();
  }, [router]);

  // 🔥 VERBESSERTE LOGIN-FUNKTION
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("🔐 Starte Login-Prozess...");
      const supabase = getBrowserClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Login-Fehler:", error.message);

        // Benutzerfreundliche Fehlermeldungen
        if (error.message.includes("Invalid login credentials")) {
          setError(
            "E-Mail oder Passwort ist falsch. Bitte versuchen Sie es erneut.",
          );
        } else if (error.message.includes("Email not confirmed")) {
          setError(
            "Bitte bestätigen Sie Ihre E-Mail-Adresse bevor Sie sich anmelden.",
          );
        } else if (error.message.includes("Too many requests")) {
          setError("Zu viele Anmeldeversuche. Bitte warten Sie einen Moment.");
        } else {
          setError(`Anmeldung fehlgeschlagen: ${error.message}`);
        }
      } else if (data.user) {
        console.log("✅ Login erfolgreich:", data.user.email);
        setSuccess(`Willkommen zurück, ${data.user.email}!`);
        setIsAuthenticated(true);
        setUserEmail(data.user.email ?? "");

        // 🔥 SOFORTIGE WEITERLEITUNG NACH LOGIN
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get("redirect");
        const savedRedirect = sessionStorage.getItem("redirectAfterLogin");

        let targetUrl = "/";

        if (
          redirectUrl &&
          redirectUrl !== "/login" &&
          !redirectUrl.includes("/login")
        ) {
          targetUrl = redirectUrl;
          // Cleanup URL Parameter
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );
        } else if (savedRedirect && savedRedirect !== "/login") {
          targetUrl = savedRedirect;
          sessionStorage.removeItem("redirectAfterLogin");
        }

        console.log("🔄 SOFORTIGE Weiterleitung nach Login zu:", targetUrl);

        // SOFORTIGE Weiterleitung ohne Verzögerung
        router.push(targetUrl);
      }
    } catch (err) {
      console.error("❌ Unerwarteter Login-Fehler:", err);
      setError(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔥 VERBESSERTE LOGOUT-FUNKTION
  const handleLogout = async () => {
    try {
      console.log("🚪 Starte Logout-Prozess...");
      const supabase = getBrowserClient();

      // Session bereinigen
      await supabase.auth.signOut();

      // Lokale Session-Daten bereinigen
      sessionStorage.removeItem("redirectAfterLogin");
      sessionStorage.removeItem("sessionActive");
      sessionStorage.removeItem("sessionTimestamp");

      setIsAuthenticated(false);
      setUserEmail("");
      setSuccess("Sie wurden erfolgreich abgemeldet.");

      console.log("✅ Logout erfolgreich");

      // Verzögerte Weiterleitung
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      console.error("❌ Logout-Fehler:", err);
      setError("Fehler beim Abmelden. Bitte versuchen Sie es erneut.");
    }
  };

  // Zeige Loading während Session-Check
  if (!sessionCheckComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl">🔍</div>
          <p className="text-muted-foreground">Prüfe Anmeldestatus...</p>
        </div>
      </div>
    );
  }

  // Zeige Dashboard wenn bereits angemeldet
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-white p-8 shadow-sm dark:border-border dark:bg-muted">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-muted-foreground dark:text-white">
                Bereits angemeldet
              </h1>
              <p className="text-muted-foreground dark:text-muted-foreground">
                Sie sind als {userEmail} angemeldet
              </p>
            </div>

            {success && (
              <div className="mb-6 flex items-center space-x-2 rounded-lg border border-green-500/30 bg-green-500/20 p-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm text-green-400">{success}</span>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => router.push("/")}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Zum Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="w-full rounded-lg border border-border bg-transparent px-4 py-3 font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normales Login-Formular
  return (
    <AuthPageLayout variant="login">
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-white p-8 shadow-sm dark:border-border dark:bg-muted">
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-3xl font-bold text-muted-foreground dark:text-white">
                Anmeldung
              </h1>
              <p className="text-muted-foreground dark:text-muted-foreground">
                Melden Sie sich in Ihrem Konto an
              </p>
            </div>

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

              {/* E-Mail */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground"
                >
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-dark-mode py-3 pl-10 pr-4"
                    placeholder="ihre@email.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Passwort */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-muted-foreground dark:text-muted-foreground"
                >
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-dark-mode py-3 pl-10 pr-10"
                    placeholder="Ihr Passwort"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
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

              {/* Anmelden Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-600/50"
              >
                {loading ? "Anmeldung läuft..." : "Anmelden"}
              </button>
            </form>

            {/* Registrierung Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Noch kein Konto?{" "}
                <button
                  onClick={() => router.push("/register")}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Jetzt registrieren
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthPageLayout>
  );
}
