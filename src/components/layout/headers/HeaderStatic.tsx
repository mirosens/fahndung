// src/components/layout/headers/HeaderStatic.tsx
import Link from "next/link";

type StaticHeaderProps = {
  logoHref?: string;
  items?: Array<{ href: string; label: string }>;
};

export default function HeaderStatic({
  logoHref = "/",
  items = [
    { href: "/fahndungen", label: "Fahndungen" },
    { href: "/service", label: "Service" },
    { href: "/sicherheit", label: "Sicherheit" },
  ],
}: StaticHeaderProps) {
  return (
    <header role="banner" className="w-full border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href={logoHref} className="inline-flex items-center font-semibold">
          Polizei BW
        </Link>
        <nav aria-label="Hauptmenü" className="flex gap-4">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="px-2 py-1 focus:outline-none focus-visible:ring">
              {it.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
