// src/components/layout/headers/HeaderClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type ClientHeaderProps = {
  logoHref?: string;
  items?: Array<{ href: string; label: string }>;
};

export default function HeaderClient({
  logoHref = "/",
  items = [
    { href: "/fahndungen", label: "Fahndungen" },
    { href: "/service", label: "Service" },
    { href: "/sicherheit", label: "Sicherheit" },
  ],
}: ClientHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header role="banner" className="w-full border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href={logoHref} className="inline-flex items-center font-semibold">
          Polizei BW
        </Link>

        {/* Desktop */}
        <nav aria-label="Hauptmenü" className="hidden gap-4 md:flex">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="px-2 py-1 focus:outline-none focus-visible:ring">
              {it.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle (client-only onClick, keine Übergabe von Handlern via Props) */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="md:hidden px-2 py-1 focus:outline-none focus-visible:ring"
          onClick={() => setOpen((s) => !s)}
        >
          Menü
        </button>
      </div>

      {/* Mobile Panel */}
      {open && (
        <nav id="mobile-nav" aria-label="Mobiles Hauptmenü" className="md:hidden border-t px-4 py-3">
          <ul className="flex flex-col gap-2">
            {items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="block px-2 py-1">
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
