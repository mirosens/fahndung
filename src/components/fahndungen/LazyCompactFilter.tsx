import dynamic from "next/dynamic";

// Lazy Loading für schwere Komponenten
const CompactFilter = dynamic(() => import("./CompactFilter"), {
  loading: () => (
    <div
      style={{ height: 200 }}
      className="animate-pulse rounded-lg bg-muted"
    />
  ),
  ssr: false,
});

export default CompactFilter;
