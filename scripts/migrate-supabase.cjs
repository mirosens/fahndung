const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Supabase Cloud Configuration
const supabaseUrl = "https://rhuhrqlucgfiqwjtqsoa.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWhycWx1Y2dmaXF3anRxc29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkzOTMwMywiZXhwIjoyMDcwNTE1MzAzfQ.pDe_8QW8O0VHRIYy1fZyJreLhfKH86cISZ7A70_OCzw";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateDatabase() {
  try {
    console.log("🚀 Starte Supabase Cloud Migration...");

    // Lese das SQL-Script
    const sqlScript = fs.readFileSync(
      path.join(__dirname, "../setup-database.sql"),
      "utf8",
    );

    console.log("📝 Führe Datenbank-Schema aus...");

    // Führe das SQL-Script aus
    const { data, error } = await supabase.rpc("exec_sql", { sql: sqlScript });

    if (error) {
      console.error("❌ Migration fehlgeschlagen:", error);
      return;
    }

    console.log("✅ Datenbank-Migration erfolgreich!");
    console.log("📊 Erstelle Test-Daten...");

    // Erstelle Test-Benutzer
    const { data: userData, error: userError } =
      await supabase.auth.admin.createUser({
        email: "test@example.com",
        password: "test123456",
        email_confirm: true,
      });

    if (userError) {
      console.log(
        "⚠️ Test-Benutzer konnte nicht erstellt werden:",
        userError.message,
      );
    } else {
      console.log("✅ Test-Benutzer erstellt:", userData.user.email);
    }

    console.log("🎉 Migration abgeschlossen!");
    console.log("🌐 Teste die Anwendung unter: http://localhost:3001");
  } catch (error) {
    console.error("❌ Fehler bei der Migration:", error);
  }
}

// Führe Migration aus
migrateDatabase();
