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

// Verhindere Pre-rendering für diese Seite
export const dynamic = "force-dynamic";

// Typen für bessere Type Safety
interface SessionResult {
  data: {
    session: {
      user: {
        email: string | null;
      };
    } | null;
  };
  error: Error | null;
}

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

  // 🔥 VERBESSERTE SESSION-PRÜFUNG MIT TOKEN-VALIDIERUNG
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("🔍 Prüfe bestehende Session...");
        const supabase = getBrowserClient();

        // 🔥 ZUSÄTZLICHE SICHERHEIT: Prüfe URL-Parameter für Session-Reset
        const urlParams = new URLSearchParams(window.location.search);
        const forceLogout = urlParams.get("logout");
        
        if (forceLogout === "true") {
          console.log("🔄 Erzwungener Logout über URL-Parameter...");
          await supabase.auth.signOut();
          // Cleanup URL Parameter
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsAuthenticated(false);
          setUserEmail("");
          setSessionCheckComplete(true);
          return;
        }

        // 🔥 VERBESSERTE SESSION-PRÜFUNG FÜR FIREFOX
        // Verwende einen längeren Timeout für Firefox-Kompatibilität
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<SessionResult>(
          (resolve) =>
            setTimeout(
              () => resolve({ data: { session: null }, error: null }),
              3000, // Reduziert auf 3 Sekunden
            ),
        );

        const result = await Promise.race([sessionPromise, timeoutPromise]);

        // Sichere Typisierung für das Ergebnis
        if ("data" in result && result.data && "session" in result.data) {
          const session = result.data.session;
          const error = "error" in result ? result.error : null;

          if (session && !error) {
            // 🔥 ZUSÄTZLICHE TOKEN-VALIDIERUNG
            const now = Math.floor(Date.now() / 1000);
            const expiresAt = session.expires_at;
            
            // Prüfe ob Token abgelaufen ist
            if (expiresAt && now >= expiresAt) {
              console.log("❌ Session abgelaufen - bereinige...");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserEmail("");
              setSessionCheckComplete(true);
              return;
            }

            // Prüfe ob Token in den nächsten 5 Minuten abläuft
            if (expiresAt && (expiresAt - now) < 300) {
              console.log("⚠️ Session läuft bald ab - versuche Refresh...");
              try {
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                if (refreshError || !refreshData.session) {
                  console.log("❌ Session-Refresh fehlgeschlagen - bereinige...");
                  await supabase.auth.signOut();
                  setIsAuthenticated(false);
                  setUserEmail("");
                  setSessionCheckComplete(true);
                  return;
                }
              } catch (refreshErr) {
                console.log("❌ Session-Refresh Exception - bereinige...");
                await supabase.auth.signOut();
                setIsAuthenticated(false);
                setUserEmail("");
                setSessionCheckComplete(true);
                return;
              }
            }

            // 🔥 ZUSÄTZLICHE VALIDIERUNG: Teste Session mit API-Call
            try {
              const { data: testData, error: testError } = await supabase.auth.getUser();
              if (testError || !testData.user) {
                console.log("❌ Session-Validierung fehlgeschlagen - bereinige...");
                await supabase.auth.signOut();
                setIsAuthenticated(false);
                setUserEmail("");
                setSessionCheckComplete(true);
                return;
              }
            } catch (testErr) {
              console.log("❌ Session-Validierung Exception - bereinige...");
              await supabase.auth.signOut();
              setIsAuthenticated(false);
              setUserEmail("");
              setSessionCheckComplete(true);
              return;
            }

            console.log("✅ Gültige Session gefunden:", session.user?.email);
            setIsAuthenticated(true);
            setUserEmail(session.user?.email ?? "");

            // 🔥 INTELLIGENTE WEITERLEITUNG
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get("redirect");
            const savedRedirect = sessionStorage.getItem("redirectAfterLogin");

            let targetUrl = "/dashboard"; // Standardmäßig zum Dashboard

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

            // 🔥 VERBESSERTE WEITERLEITUNG FÜR FIREFOX
            // Verwende setTimeout um sicherzustellen, dass der State aktualisiert wird
            setTimeout(() => {
              router.push(targetUrl);
            }, 100);
          } else {
            console.log("ℹ️ Keine bestehende Session gefunden");
            setIsAuthenticated(false);
            setUserEmail("");
          }
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

        // 🔥 HARD REDIRECT - GARANTIERT FUNKTIONIERT
        window.location.href = "/dashboard"; // Nach Dashboard!
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
                onClick={() => router.push("/dashboard")}
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground dark:bg-muted">
                    Oder
                  </span>
                </div>
              </div>

              <button
                onClick={async () => {
                  try {
                    console.log("🔄 Bereinige bestehende Session...");
                    const supabase = getBrowserClient();
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                    setUserEmail("");
                    setSessionCheckComplete(false);
                    setSuccess("Bestehende Session wurde bereinigt. Sie können sich jetzt neu anmelden.");
                  } catch (err) {
                    console.error("❌ Fehler beim Bereinigen der Session:", err);
                    setError("Fehler beim Bereinigen der Session. Bitte versuchen Sie es erneut.");
                  }
                }}
                className="w-full rounded-lg border border-orange-500 bg-orange-50 px-4 py-3 font-medium text-orange-700 transition-colors hover:bg-orange-100 dark:border-orange-400 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
              >
                Mit anderem Konto anmelden
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
