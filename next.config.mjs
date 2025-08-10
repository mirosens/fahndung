/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  // TEMP: nur für die Bundle-Analyse – danach wieder entfernen!
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react", "@radix-ui/*", "framer-motion"],
  },
  compiler: {
    removeConsole: true,
  },
  images: {
    deviceSizes: [640, 828],
    imageSizes: [64, 128],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // ❌ no fallbacks/polyfills here
};

export default withBundleAnalyzer(nextConfig);
