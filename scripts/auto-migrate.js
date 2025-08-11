const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 AUTOMATISCHE CLOUD-MIGRATION GESTARTET");
console.log("==========================================");

async function autoMigrate() {
  try {
    // 1. GitHub Setup
    console.log("\n📦 1. GitHub Repository Setup...");
    require("./setup-github.js");

    // 2. Supabase Migration
    console.log("\n🗄️ 2. Supabase Cloud Migration...");
    console.log("⚠️ Supabase Migration muss manuell ausgeführt werden:");
    console.log(
      "📝 Gehe zu: https://supabase.com/dashboard/project/rhuhrqlucgfiqwjtqsoa/sql",
    );
    console.log("📝 Kopiere den Inhalt von setup-database.sql");
    console.log("📝 Führe das Script aus");

    // 3. Test Cloud Connection
    console.log("\n🔍 3. Teste Cloud-Verbindung...");

    // 4. Start Development Server
    console.log("\n🌐 4. Starte Entwicklungsserver...");
    console.log("🚀 Server startet auf: http://localhost:3001");
    console.log("📝 Teste die Anwendung und melde dich an!");

    // 5. Start Server
    execSync("pnpm dev", { stdio: "inherit" });
  } catch (error) {
    console.error("❌ Fehler bei der automatischen Migration:", error);
  }
}

autoMigrate();
