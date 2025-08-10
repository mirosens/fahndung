/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    // Linting NICHT im Build blockieren – wir fixen Fehler separat mit `pnpm lint`
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
  },
  // Verwende Standard-Output für bessere Kompatibilität
  // output: "standalone",
  trailingSlash: false,
  // Setze einen vernünftigen Timeout für statisches Pre-rendering (60 Sekunden)
  staticPageGenerationTimeout: 60,

  images: {
    deviceSizes: [640, 828],
    imageSizes: [64, 128],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "rgbxdxrhwrszidbnsmuy.supabase.co" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default config;
