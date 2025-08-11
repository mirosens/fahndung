/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  experimental: {
    // Deaktiviere optimizeCss da es critters verwendet
    // optimizeCss: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Vereinfachte Webpack-Konfiguration
  webpack: (config, { isServer }) => {
    // Behebe Server-seitige Probleme
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

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

  serverRuntimeConfig: {
    // Server-seitige Konfiguration
  },

  publicRuntimeConfig: {
    // Client-seitige Konfiguration
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    port: process.env.PORT || "3000",
  },
};

export default withBundleAnalyzer(nextConfig);
