const { createClient } = require("@supabase/supabase-js");

// Supabase Cloud Configuration
const supabaseUrl = "https://rhuhrqlucgfiqwjtqsoa.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWhycWx1Y2dmaXF3anRxc29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkzOTMwMywiZXhwIjoyMDcwNTE1MzAzfQ.pDe_8QW8O0VHRIYy1fZyJreLhfKH86cISZ7A70_OCzw";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupRemoteSupabase() {
  try {
    console.log("🚀 Verbinde mit Remote-Supabase...");
    console.log("URL:", supabaseUrl);

    // Teste Verbindung
    const { data, error } = await supabase
      .from("user_profiles")
      .select("count")
      .limit(1);
    if (error) {
      console.log("⚠️ Verbindungstest:", error.message);
    } else {
      console.log("✅ Verbindung erfolgreich!");
    }

    console.log("\n📝 Erstelle Test-Benutzer...");

    // Erstelle Test-Benutzer über Auth API
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email: "test@test.com",
        password: "test123",
        email_confirm: true,
        user_metadata: { name: "Test User" },
      });

    if (userError) {
      console.log("⚠️ Benutzer-Erstellung fehlgeschlagen:", userError.message);

      // Versuche es mit einem anderen Benutzer
      const { data: userData2, error: userError2 } =
        await supabase.auth.admin.createUser({
          email: "admin@fahndung.local",
          password: "admin123",
          email_confirm: true,
          user_metadata: { name: "Admin User" },
        });

      if (userError2) {
        console.log("⚠️ Zweiter Benutzer fehlgeschlagen:", userError2.message);
      } else {
        console.log("✅ Admin-Benutzer erstellt:", userData2.user.email);
      }
    } else {
      console.log("✅ Test-Benutzer erstellt:", userData.user.email);
    }

    console.log("\n👤 Erstelle Benutzerprofile...");

    // Erstelle Benutzerprofile
    const profiles = [
      { email: "test@test.com", name: "Test User", role: "admin" },
      { email: "admin@fahndung.local", name: "Admin", role: "admin" },
      { email: "ptlsweb@gmail.com", name: "PTLS Web", role: "admin" },
    ];

    for (const profile of profiles) {
      try {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        const user = usersData.users.find((u) => u.email === profile.email);

        if (user) {
          const { error: profileError } = await supabase
            .from("user_profiles")
            .upsert({
              id: user.id,
              name: profile.name,
              email: profile.email,
              role: profile.role,
            });

          if (profileError) {
            console.log(
              `⚠️ Profil für ${profile.email}:`,
              profileError.message,
            );
          } else {
            console.log(`✅ Profil erstellt: ${profile.email}`);
          }
        }
      } catch (error) {
        console.log(`⚠️ Fehler bei ${profile.email}:`, error.message);
      }
    }

    console.log("\n📊 Erstelle Test-Fahndungen...");

    // Erstelle Test-Fahndungen
    const investigations = [
      {
        title: "Vermisste Person: Max Mustermann",
        case_number: "F-2025-001",
        description:
          "Max Mustermann wurde am 15. Januar 2025 zuletzt in der Innenstadt gesehen.",
        short_description: "Vermisste Person in der Innenstadt",
        status: "published",
        priority: "urgent",
        category: "MISSING_PERSON",
        location: "Innenstadt, Berlin",
        station: "Polizei Berlin",
        features: "Blaue Jacke, rote Mütze, 1.80m groß",
        date: "2025-01-15",
        tags: ["vermisst", "innenstadt", "berlin"],
      },
      {
        title: "Gesuchte Person: Anna Schmidt",
        case_number: "F-2025-002",
        description: "Anna Schmidt wird wegen Betrugs gesucht.",
        short_description: "Gesuchte Person wegen Betrugs",
        status: "published",
        priority: "normal",
        category: "WANTED_PERSON",
        location: "Hamburg",
        station: "Polizei Hamburg",
        features: "Braune Haare, grüne Augen, 1.65m",
        date: "2025-01-10",
        tags: ["betrug", "hamburg", "gesucht"],
      },
    ];

    for (const investigation of investigations) {
      try {
        const { error } = await supabase
          .from("investigations")
          .upsert(investigation, { onConflict: "case_number" });

        if (error) {
          console.log(
            `⚠️ Fahndung ${investigation.case_number}:`,
            error.message,
          );
        } else {
          console.log(`✅ Fahndung erstellt: ${investigation.title}`);
        }
      } catch (error) {
        console.log(
          `⚠️ Fehler bei Fahndung ${investigation.case_number}:`,
          error.message,
        );
      }
    }

    console.log("\n🔧 Konfiguriere Auth-Einstellungen...");

    // Prüfe Auth-Einstellungen
    console.log("ℹ️ Bitte prüfe manuell die Auth-Einstellungen:");
    console.log("🌐 Site URL: https://fahndung.vercel.app");
    console.log("🔄 Redirect URLs: https://fahndung.vercel.app/auth/callback");
    console.log("📧 Email Confirmations: Deaktiviert (für Test)");

    console.log("\n🎉 Remote-Supabase Setup abgeschlossen!");
    console.log("\n📋 Verfügbare Login-Daten:");
    console.log("- test@test.com / test123");
    console.log("- admin@fahndung.local / admin123");
    console.log("\n🌐 Teste die Anwendung: https://fahndung.vercel.app");
  } catch (error) {
    console.error("❌ Fehler beim Remote-Setup:", error);
  }
}

// Führe Setup aus
setupRemoteSupabase();
