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

async function createAdmin() {
  console.log("🔧 Erstelle Admin-Account...");

  try {
    // Erstelle Admin-Account mit einfacherem Passwort
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email: "admin@ptls.de",
        password: "admin123",
        email_confirm: true,
        user_metadata: {
          name: "PTLS Admin",
          role: "admin",
        },
      });

    if (userError) {
      console.error("❌ Fehler beim Erstellen des Admins:", userError);
      return;
    }

    console.log("✅ Admin erfolgreich erstellt:", userData.user.email);
    console.log("📝 Login-Daten: admin@ptls.de / admin123");

    // Erstelle Benutzer-Profil
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: userData.user.id,
        email: userData.user.email,
        name: "PTLS Admin",
        role: "admin",
        department: "PTLS",
        phone: "+49 123 456789",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error("❌ Fehler beim Erstellen des Profils:", profileError);
    } else {
      console.log("✅ Admin-Profil erfolgreich erstellt");
    }

    // Zeige alle verfügbaren Benutzer
    const { data: existingUser, error: listError } =
      await supabase.auth.admin.listUsers();

    if (!listError) {
      console.log("\n📋 Verfügbare Benutzer:");
      existingUser.users.forEach((user) => {
        console.log(`- ${user.email} (${user.user_metadata?.role || "user"})`);
      });
    }
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
  }
}

createAdmin();
