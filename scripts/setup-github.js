const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function setupGitHub() {
  try {
    console.log("🚀 Automatisches GitHub Setup...");

    // Erstelle README.md
    const readmeContent = `# Fahndung - PTLS System

Ein modernes Fahndungssystem mit Cloudinary-Integration und Supabase.

## Features

- 🌟 **Cloudinary Integration**: Bild-Upload und -Bearbeitung
- 🔐 **Supabase Auth**: Sichere Authentifizierung
- ⚡ **Next.js 15**: Moderne React-Framework
- 🎨 **Tailwind CSS**: Schönes UI/UX
- 📱 **Responsive Design**: Funktioniert auf allen Geräten

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: tRPC, Supabase
- **Database**: PostgreSQL (Supabase)
- **File Storage**: Cloudinary
- **Authentication**: Supabase Auth

## Getting Started

1. Clone das Repository
2. Installiere Dependencies: \`pnpm install\`
3. Setze Umgebungsvariablen in \`.env.local\`
4. Starte Entwicklungsserver: \`pnpm dev\`

## Environment Variables

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
\`\`\`

## Development

\`\`\`bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
\`\`\`

## License

MIT License
`;

    fs.writeFileSync(path.join(__dirname, "../README.md"), readmeContent);
    console.log("✅ README.md erstellt");

    // Git Commits und Push
    console.log("📦 Git Setup...");
    execSync("git add README.md", { stdio: "inherit" });
    execSync('git commit -m "docs: Add comprehensive README"', {
      stdio: "inherit",
    });

    console.log("🚀 Versuche Push zu GitHub...");
    try {
      execSync("git push -u origin main", { stdio: "inherit" });
      console.log("✅ Code erfolgreich zu GitHub gepusht!");
    } catch (error) {
      console.log(
        "⚠️ Push fehlgeschlagen - Repository muss manuell initialisiert werden",
      );
      console.log("📝 Gehe zu: https://github.com/mirosens/fahndung");
      console.log("📝 Erstelle eine README.md Datei manuell");
    }
  } catch (error) {
    console.error("❌ Fehler beim GitHub Setup:", error);
  }
}

setupGitHub();
