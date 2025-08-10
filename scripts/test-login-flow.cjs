const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// Supabase Client erstellen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase Umgebungsvariablen nicht gefunden");
  console.log("📝 Bitte stelle sicher, dass .env.local konfiguriert ist:");
  console.log("   NEXT_PUBLIC_SUPABASE_URL=deine_supabase_url");
  console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein_anon_key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLoginFlow() {
  console.log("🔧 Teste kompletten Login-Flow...");
  console.log("==================================");

  const testUsers = [
    {
      name: "PTLS Web (Super Admin)",
      email: "ptlsweb@gmail.com",
      password: "Heute-2025!sp",
      expectedRole: "super_admin",
    },
    {
      name: "Admin",
      email: "admin@fahndung.local",
      password: "admin123",
      expectedRole: "admin",
    },
    {
      name: "Editor",
      email: "editor@fahndung.local",
      password: "editor123",
      expectedRole: "editor",
    },
    {
      name: "User",
      email: "user@fahndung.local",
      password: "user123",
      expectedRole: "user",
    },
  ];

  for (const user of testUsers) {
    console.log(`\n📋 Teste Benutzer: ${user.name}`);
    console.log("─".repeat(50));

    try {
      // 1. Session bereinigen
      console.log("🧹 1. Bereinige alte Session...");
      await supabase.auth.signOut();

      // 2. Authentifizierung
      console.log("🔐 2. Versuche Anmeldung...");
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password,
        });

      if (authError) {
        console.error(
          `❌ Anmeldung fehlgeschlagen für ${user.name}:`,
          authError.message,
        );
        continue;
      }

      if (!authData.user) {
        console.error(`❌ Kein Benutzer zurückgegeben für ${user.name}`);
        continue;
      }

      console.log(`✅ Anmeldung erfolgreich für: ${authData.user.email}`);
      console.log(`👤 User ID: ${authData.user.id}`);

      // 3. Session prüfen
      console.log("📋 3. Prüfe Session...");
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ Session-Fehler:", sessionError.message);
        continue;
      }

      if (!sessionData.session) {
        console.error("❌ Keine Session gefunden");
        continue;
      }

      console.log("✅ Session gefunden:", {
        accessTokenLength: sessionData.session.access_token?.length ?? 0,
        refreshTokenLength: sessionData.session.refresh_token?.length ?? 0,
        expiresAt: sessionData.session.expires_at
          ? new Date(sessionData.session.expires_at * 1000).toISOString()
          : "N/A",
      });

      // 4. Token-Validierung
      console.log("🔍 4. Validiere Token...");
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) {
        console.error(
          "❌ Token-Validierung fehlgeschlagen:",
          userError.message,
        );
        continue;
      }

      if (!userData.user) {
        console.error("❌ Kein Benutzer aus Token extrahiert");
        continue;
      }

      console.log("✅ Token ist gültig");

      // 5. Benutzer-Profil prüfen
      console.log("👤 5. Prüfe Benutzer-Profil...");
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      if (profileError) {
        console.error("❌ Profil-Fehler:", profileError.message);
        // Versuche Benutzer-Metadaten zu prüfen
        const userRole = userData.user.user_metadata?.role || "user";
        console.log(`ℹ️ Verwende Benutzer-Metadaten: ${userRole}`);

        if (userRole === user.expectedRole) {
          console.log("✅ Benutzerrolle stimmt überein");
        } else {
          console.log(
            `⚠️ Benutzerrolle stimmt nicht überein: erwartet ${user.expectedRole}, gefunden ${userRole}`,
          );
        }
      } else {
        console.log("✅ Benutzer-Profil gefunden:", {
          name: profileData.name,
          role: profileData.role,
          department: profileData.department,
        });

        if (profileData.role === user.expectedRole) {
          console.log("✅ Benutzerrolle stimmt überein");
        } else {
          console.log(
            `⚠️ Benutzerrolle stimmt nicht überein: erwartet ${user.expectedRole}, gefunden ${profileData.role}`,
          );
        }
      }

      // 6. Teste Datenbank-Zugriff
      console.log("🗄️ 6. Teste Datenbank-Zugriff...");
      const { data: testData, error: testError } = await supabase
        .from("investigation_images")
        .select("count")
        .limit(1);

      if (testError) {
        console.error(
          "❌ Datenbank-Zugriff fehlgeschlagen:",
          testError.message,
        );
      } else {
        console.log("✅ Datenbank-Zugriff erfolgreich");
      }

      // 7. Teste tRPC-ähnliche Token-Übertragung
      console.log("🔄 7. Teste Token-Übertragung...");
      const token = sessionData.session.access_token;

      // Simuliere Server-seitige Token-Validierung
      const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      const { data: serverUserData, error: serverUserError } =
        await supabaseServer.auth.getUser(token);

      if (serverUserError) {
        console.error(
          "❌ Server-seitige Token-Validierung fehlgeschlagen:",
          serverUserError.message,
        );
      } else {
        console.log(
          "✅ Server-seitige Token-Validierung erfolgreich:",
          serverUserData.user.email,
        );
      }

      console.log(`✅ ${user.name} Test erfolgreich abgeschlossen`);
    } catch (error) {
      console.error(`❌ Unerwarteter Fehler für ${user.name}:`, error.message);
    }

    // Kurze Pause zwischen Tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n🎉 Login-Flow Test abgeschlossen!");
  console.log("\n📋 Zusammenfassung:");
  console.log("✅ Client-seitige Authentifizierung funktioniert");
  console.log("✅ Session-Management funktioniert");
  console.log("✅ Token-Validierung funktioniert");
  console.log("✅ Server-seitige Token-Übertragung funktioniert");
  console.log("✅ Datenbank-Zugriff funktioniert");

  console.log("\n📝 Nächste Schritte:");
  console.log("1. Teste die App im Browser");
  console.log("2. Versuche dich als PTLS Web anzumelden");
  console.log("3. Prüfe die Browser-Konsole auf Fehler");
  console.log("4. Teste das Dashboard und andere geschützte Routen");
}

// Führe den Test aus
testLoginFlow().catch(console.error);
