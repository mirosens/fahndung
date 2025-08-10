const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Supabase Client erstellen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase Umgebungsvariablen nicht gefunden");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: {
      getItem: (key) => {
        console.log(`🔍 Storage getItem: ${key}`);
        return null;
      },
      setItem: (key, value) => {
        console.log(`💾 Storage setItem: ${key} = ${value ? "***" : "null"}`);
      },
      removeItem: (key) => {
        console.log(`🗑️ Storage removeItem: ${key}`);
      },
    },
  },
});

async function debugBrowserAuth() {
  console.log("🔧 Debug Browser-Authentifizierung...");
  console.log("=====================================");
  console.log(`🌐 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Anon Key: ${supabaseAnonKey ? "✅ Gesetzt" : "❌ Fehlt"}`);
  console.log(`🔧 Persist Session: true`);
  console.log(`🔄 Auto Refresh Token: true`);
  console.log("");

  try {
    // 1. Prüfe aktuelle Session
    console.log("📋 1. Prüfe aktuelle Session...");
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("❌ Session-Fehler:", sessionError.message);
    } else if (session) {
      console.log("✅ Session gefunden:", {
        userId: session.user.id,
        email: session.user.email,
        tokenLength: session.access_token?.length ?? 0,
        expiresAt: session.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : "N/A",
      });
    } else {
      console.log("ℹ️ Keine aktive Session gefunden");
    }

    // 2. Teste Login mit PTLS Web
    console.log("\n📋 2. Teste Login mit PTLS Web...");
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: "ptlsweb@gmail.com",
        password: "Heute-2025!sp",
      });

    if (authError) {
      console.error("❌ Login-Fehler:", authError.message);
      console.error("❌ Error Details:", {
        status: authError.status,
        name: authError.name,
        message: authError.message,
      });
      return;
    }

    if (!authData.user) {
      console.error("❌ Kein Benutzer nach Login zurückgegeben");
      return;
    }

    console.log("✅ Login erfolgreich:", {
      userId: authData.user.id,
      email: authData.user.email,
      confirmedAt: authData.user.email_confirmed_at,
      lastSignIn: authData.user.last_sign_in_at,
    });

    // 3. Prüfe Session nach Login
    console.log("\n📋 3. Prüfe Session nach Login...");
    const {
      data: { session: newSession },
      error: newSessionError,
    } = await supabase.auth.getSession();

    if (newSessionError) {
      console.error("❌ Neue Session-Fehler:", newSessionError.message);
    } else if (newSession) {
      console.log("✅ Neue Session erstellt:", {
        userId: newSession.user.id,
        email: newSession.user.email,
        tokenLength: newSession.access_token?.length ?? 0,
        refreshTokenLength: newSession.refresh_token?.length ?? 0,
        expiresAt: newSession.expires_at
          ? new Date(newSession.expires_at * 1000).toISOString()
          : "N/A",
      });
    } else {
      console.error("❌ Keine Session nach Login erstellt");
    }

    // 4. Teste Token-Validierung
    console.log("\n📋 4. Teste Token-Validierung...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("❌ Token-Validierung fehlgeschlagen:", userError.message);
    } else if (user) {
      console.log("✅ Token ist gültig für Benutzer:", user.email);
    } else {
      console.error("❌ Kein Benutzer aus Token extrahiert");
    }

    // 5. Teste Benutzer-Profil
    console.log("\n📋 5. Teste Benutzer-Profil...");
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", authData.user.id)
      .single();

    if (profileError) {
      console.error("❌ Profil-Fehler:", profileError.message);
      console.log(
        "ℹ️ Verwende Benutzer-Metadaten:",
        authData.user.user_metadata,
      );
    } else {
      console.log("✅ Benutzer-Profil gefunden:", {
        name: profileData.name,
        role: profileData.role,
        department: profileData.department,
      });
    }

    // 6. Teste Logout
    console.log("\n📋 6. Teste Logout...");
    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      console.error("❌ Logout-Fehler:", logoutError.message);
    } else {
      console.log("✅ Logout erfolgreich");
    }

    // 7. Prüfe Session nach Logout
    console.log("\n📋 7. Prüfe Session nach Logout...");
    const {
      data: { session: finalSession },
      error: finalSessionError,
    } = await supabase.auth.getSession();

    if (finalSessionError) {
      console.error("❌ Finale Session-Fehler:", finalSessionError.message);
    } else if (finalSession) {
      console.log("⚠️ Session noch vorhanden nach Logout");
    } else {
      console.log("✅ Session erfolgreich bereinigt");
    }
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error.message);
    console.error("❌ Error Stack:", error.stack);
  }

  console.log("\n🎉 Browser-Auth Debug abgeschlossen!");
  console.log("\n📝 Mögliche Probleme:");
  console.log("1. Browser Storage-Probleme (Cookies/LocalStorage)");
  console.log("2. CORS-Probleme");
  console.log("3. Network-Probleme");
  console.log("4. Supabase-Konfiguration");
  console.log("5. Environment-Variablen");
}

// Führe den Debug aus
debugBrowserAuth().catch(console.error);
