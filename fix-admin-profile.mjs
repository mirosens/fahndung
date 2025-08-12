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

async function fixAdminProfile() {
  console.log("🔧 Repariere Admin-Profil...");

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

    // Prüfe die user_profiles Tabelle
    const { data: tableInfo, error: tableError } = await supabase
      .from("information_schema.columns")
      .select("column_name, data_type")
      .eq("table_schema", "public")
      .eq("table_name", "user_profiles");

    if (tableError) {
      console.error("❌ Fehler beim Prüfen der Tabelle:", tableError);
      return;
    }

    console.log("📋 Verfügbare Spalten in user_profiles:");
    tableInfo.forEach((col) => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });

    // Erstelle Profil nur mit verfügbaren Spalten
    const profileData = {
      id: adminUser.id,
      email: adminUser.email,
      name: "PTLS Admin",
      role: "admin",
      phone: "+49 123 456789",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Entferne department falls es nicht existiert
    if (!tableInfo.find((col) => col.column_name === "department")) {
      delete profileData.department;
    }

    const { data: profileResult, error: profileError } = await supabase
      .from("user_profiles")
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      console.error("❌ Fehler beim Erstellen des Profils:", profileError);
    } else {
      console.log("✅ Admin-Profil erfolgreich erstellt");
      console.log("📝 Profil-Daten:", profileResult);
    }
  } catch (error) {
    console.error("❌ Unerwarteter Fehler:", error);
  }
}

fixAdminProfile();
