# Fahndung - PTLS System

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
2. Installiere Dependencies: `pnpm install`
3. Setze Umgebungsvariablen in `.env.local`
4. Starte Entwicklungsserver: `pnpm dev`

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## Development

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## License

MIT License
