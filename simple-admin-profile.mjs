import { createClient } from "@supabase/supabase-js";

// Remote Supabase-Konfiguration
const supabaseUrl = "https://rhuhrqlucgfiqwjtqsoa.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWhycWx1Y2dmaXF3anRxc29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkzOTMwMywiZXhwIjoyMDcwNTE1MzAzfQ.pDe_8QW8O0VHRIYy1fZyJreLhfKH86cISZ7A70_OCzw";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function createSimpleAdminProfile() {
  console.log("🔧 Erstelle einfaches Admin-Profil...");

  try {
    // Finde den Admin-Benutzer
    const { data: existingUser, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) {
      console.error("❌ Fehler beim Abrufen der Benutzer:", userError);
      return;
    }

    const adminUser = existingUser.users.find(
      (user) => user.email === "admin@ptls.de",
    );

    if (!adminUser) {
      console.error("❌ Admin-Benutzer nicht gefunden");
      return;
    }

    console.log("✅ Admin-Benutzer gefunden:", adminUser.email);

    // Erstelle einfaches Profil ohne problematische Spalten
    const { data: profileResult, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: adminUser.id,
        email: adminUser.email,
        name: "PTLS Admin",
        role: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error("❌ Fehler beim Erstellen des Profils:", profileError);

      // Versuche es ohne created_at und updated_at
      const { data: profileResult2, error: profileError2 } = await supabase
        .from("user_profiles")
        .insert({
          id: adminUser.id,
          email: adminUser.email,
          name: "PTLS Admin",
          role: "admin",
        })
        .select()
        .single();

      if (profileError2) {
        console.error(
          "❌ Fehler beim Erstellen des Profils (2. Versuch):",
          profileError2,
        );
      } else {
        console.log("✅ Admin-Profil erfolgreich erstellt (2. Versuch)");
        console.log("📝 Profil-Daten:", profileResult2);
      }
    } else {
      console.log("✅ Admin-Profil erfolgreich erstellt");
      console.log("📝 Profil-Daten:", profileResult);
    }
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
  }
}

createSimpleAdminProfile();
