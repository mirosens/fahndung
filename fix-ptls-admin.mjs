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

async function fixPTLSAdmin() {
  console.log("🔧 Repariere PTLS Admin-Account...");

  try {
    // Prüfe ob der Benutzer bereits existiert
    const { data: existingUser, error: userError } =
      await supabase.auth.admin.listUsers();

    if (userError) {
      console.error("❌ Fehler beim Abrufen der Benutzer:", userError);
      return;
    }

    const ptlsUser = existingUser.users.find(
      (user) => user.email === "ptlsweb@gmail.com",
    );

    if (ptlsUser) {
      console.log("✅ PTLS Admin existiert bereits:", ptlsUser.email);
      console.log("🔄 Setze Passwort zurück...");

      // Setze Passwort zurück
      const { data: updateData, error: updateError } =
        await supabase.auth.admin.updateUserById(ptlsUser.id, {
          password: "Heute-2025!sp",
          email_confirm: true,
        });

      if (updateError) {
        console.error(
          "❌ Fehler beim Zurücksetzen des Passworts:",
          updateError,
        );
      } else {
        console.log("✅ Passwort erfolgreich zurückgesetzt");
        console.log("📝 Login-Daten: ptlsweb@gmail.com / Heute-2025!sp");
      }
    } else {
      console.log("🆕 PTLS Admin existiert nicht - erstelle neuen Account...");

      // Erstelle neuen PTLS Admin
      const { data: userData, error: createError } =
        await supabase.auth.admin.createUser({
          email: "ptlsweb@gmail.com",
          password: "Heute-2025!sp",
          email_confirm: true,
          user_metadata: {
            name: "PTLS Web Admin",
            role: "admin",
          },
        });

      if (createError) {
        console.error("❌ Fehler beim Erstellen des PTLS Admins:", createError);
        return;
      }

      console.log("✅ PTLS Admin erfolgreich erstellt:", userData.user.email);
      console.log("📝 Login-Daten: ptlsweb@gmail.com / Heute-2025!sp");

      // Erstelle Benutzer-Profil
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: userData.user.id,
          email: userData.user.email,
          name: "PTLS Web Admin",
          role: "admin",
          department: "PTLS",
          phone: "0711 899-0000",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) {
        console.error("❌ Fehler beim Erstellen des Profils:", profileError);
      } else {
        console.log("✅ PTLS Admin-Profil erfolgreich erstellt");
      }
    }

    // Zeige alle verfügbaren Benutzer
    console.log("\n📋 Verfügbare Benutzer:");
    existingUser.users.forEach((user) => {
      console.log(`- ${user.email} (${user.user_metadata?.role || "user"})`);
    });
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
  }
}

fixPTLSAdmin();
