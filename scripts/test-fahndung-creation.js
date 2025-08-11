const { createClient } = require("@supabase/supabase-js");

// Lokale Supabase-Konfiguration
const supabaseUrl = "http://127.0.0.1:54321";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFahndungCreation() {
  console.log("🧪 Teste Fahndungserstellung...");

  try {
    // 1. Teste Datenbankverbindung
    console.log("📋 1. Teste Datenbankverbindung...");

    const { data: testData, error: testError } = await supabase
      .from("investigations")
      .select("count")
      .limit(1);

    if (testError) {
      console.error("❌ Datenbankverbindung fehlgeschlagen:", testError);
      return false;
    }

    console.log("✅ Datenbankverbindung erfolgreich");

    // 2. Teste Fahndungserstellung
    console.log("📋 2. Teste Fahndungserstellung...");

    const testInvestigation = {
      title: "Test Fahndung - " + new Date().toISOString(),
      description: "Test-Fahndung für Debug-Zwecke",
      short_description: "Test-Fahndung",
      status: "draft",
      priority: "normal",
      category: "MISSING_PERSON",
      location: "Test Location",
      station: "Test Station",
      tags: ["test", "debug"],
      contact_info: {
        person: "Test Person",
        phone: "123456789",
        email: "test@example.com",
      },
      created_by: "305f1ebf-01ed-4007-8cd7-951f6105b8c1",
      images: [
        {
          id: "test-main",
          url: "https://via.placeholder.com/400x300?text=Test+Image",
          alt_text: "Test Hauptbild",
          caption: "Hauptbild der Test-Fahndung",
        },
      ],
    };

    const { data: newInvestigation, error: createError } = await supabase
      .from("investigations")
      .insert(testInvestigation)
      .select("id, title, case_number, images")
      .single();

    if (createError) {
      console.error("❌ Fehler beim Erstellen der Test-Fahndung:", createError);
      return false;
    }

    console.log("✅ Test-Fahndung erstellt:", newInvestigation.title);
    console.log("   Aktennummer:", newInvestigation.case_number);
    console.log("   Bilder:", newInvestigation.images?.length ?? 0);

    // 3. Teste Laden der erstellten Fahndung
    console.log("📋 3. Teste Laden der erstellten Fahndung...");

    const { data: loadedInvestigation, error: loadError } = await supabase
      .from("investigations")
      .select("*")
      .eq("id", newInvestigation.id)
      .single();

    if (loadError) {
      console.error("❌ Fehler beim Laden der Fahndung:", loadError);
      return false;
    }

    console.log("✅ Fahndung erfolgreich geladen:", loadedInvestigation.title);

    // 4. Teste Storage-Bucket
    console.log("📋 4. Teste Storage-Bucket...");

    const { data: buckets, error: bucketError } =
      await supabase.storage.listBuckets();

    if (bucketError) {
      console.error("❌ Fehler beim Abrufen der Storage-Buckets:", bucketError);
      return false;
    }

    const mediaGalleryBucket = buckets.find(
      (bucket) => bucket.name === "media-gallery",
    );
    if (mediaGalleryBucket) {
      console.log("✅ media-gallery Bucket gefunden");
    } else {
      console.log("⚠️ media-gallery Bucket nicht gefunden");
    }

    console.log("🎉 Alle Tests erfolgreich!");
    return true;
  } catch (error) {
    console.error("❌ Test fehlgeschlagen:", error);
    return false;
  }
}

// Führe Test aus
testFahndungCreation()
  .then((success) => {
    if (success) {
      console.log("✅ Fahndungserstellung funktioniert!");
      process.exit(0);
    } else {
      console.log("❌ Fahndungserstellung hat Probleme!");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Test-Ausführung fehlgeschlagen:", error);
    process.exit(1);
  });
