const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase Cloud Configuration
const supabaseUrl = 'https://rhuhrqlucgfiqwjtqsoa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJodWhycWx1Y2dmaXF3anRxc29hIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDkzOTMwMywiZXhwIjoyMDcwNTE1MzAzfQ.pDe_8QW8O0VHRIYy1fZyJreLhfKH86cISZ7A70_OCzw';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateSupabase() {
  try {
    console.log('🚀 Starte Supabase Cloud Migration...');
    
    // Lese das SQL-Script
    const sqlScript = fs.readFileSync(path.join(__dirname, 'setup-database.sql'), 'utf8');
    
    console.log('📝 Führe Datenbank-Schema aus...');
    
    // Teile das SQL-Script in einzelne Statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (error) {
            console.log(`⚠️ Statement übersprungen: ${error.message}`);
          }
        } catch (error) {
          console.log(`⚠️ Statement übersprungen: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Datenbank-Schema erstellt!');
    console.log('👤 Erstelle Test-Benutzer...');
    
    // Erstelle Test-Benutzer
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'test123456',
      email_confirm: true
    });
    
    if (userError) {
      console.log('⚠️ Test-Benutzer konnte nicht erstellt werden:', userError.message);
    } else {
      console.log('✅ Test-Benutzer erstellt:', userData.user.email);
      
      // Erstelle Benutzerprofil
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: userData.user.id,
          name: 'Test User',
          email: 'test@example.com',
          role: 'admin'
        });
      
      if (profileError) {
        console.log('⚠️ Benutzerprofil konnte nicht erstellt werden:', profileError.message);
      } else {
        console.log('✅ Benutzerprofil erstellt');
      }
    }
    
    console.log('📊 Erstelle Test-Fahndungen...');
    
    // Erstelle Test-Fahndungen
    const testInvestigations = [
      {
        title: 'Vermisste Person: Max Mustermann',
        case_number: 'F-2025-001',
        description: 'Max Mustermann wurde am 15. Januar 2025 zuletzt in der Innenstadt gesehen. Er trägt eine blaue Jacke und eine rote Mütze.',
        short_description: 'Vermisste Person in der Innenstadt',
        status: 'published',
        priority: 'urgent',
        category: 'MISSING_PERSON',
        location: 'Innenstadt, Berlin',
        station: 'Polizei Berlin',
        features: 'Blaue Jacke, rote Mütze, 1.80m groß',
        date: '2025-01-15',
        created_by: userData?.user?.id,
        tags: ['vermisst', 'innenstadt', 'berlin']
      },
      {
        title: 'Gesuchte Person: Anna Schmidt',
        case_number: 'F-2025-002',
        description: 'Anna Schmidt wird wegen Betrugs gesucht. Sie soll mehrere Menschen um Geld betrogen haben.',
        short_description: 'Gesuchte Person wegen Betrugs',
        status: 'published',
        priority: 'normal',
        category: 'WANTED_PERSON',
        location: 'Hamburg',
        station: 'Polizei Hamburg',
        features: 'Braune Haare, grüne Augen, 1.65m',
        date: '2025-01-10',
        created_by: userData?.user?.id,
        tags: ['betrug', 'hamburg', 'gesucht']
      },
      {
        title: 'Gestohlene Fahrzeuge',
        case_number: 'F-2025-003',
        description: 'Mehrere Fahrzeuge wurden in der Nacht gestohlen. Es handelt sich um weiße Lieferwagen.',
        short_description: 'Gestohlene weiße Lieferwagen',
        status: 'published',
        priority: 'new',
        category: 'STOLEN_GOODS',
        location: 'München',
        station: 'Polizei München',
        features: 'Weiße Lieferwagen, Kennzeichen unbekannt',
        date: '2025-01-20',
        created_by: userData?.user?.id,
        tags: ['fahrzeuge', 'gestohlen', 'münchen']
      }
    ];
    
    for (const investigation of testInvestigations) {
      const { error } = await supabase
        .from('investigations')
        .insert(investigation);
      
      if (error) {
        console.log(`⚠️ Fahndung konnte nicht erstellt werden: ${error.message}`);
      } else {
        console.log(`✅ Fahndung erstellt: ${investigation.title}`);
      }
    }
    
    console.log('🎉 Migration abgeschlossen!');
    console.log('🌐 Teste die Anwendung unter: https://fahndung.vercel.app');
    console.log('👤 Login: test@example.com / test123456');
    
  } catch (error) {
    console.error('❌ Fehler bei der Migration:', error);
  }
}

// Führe Migration aus
migrateSupabase();
