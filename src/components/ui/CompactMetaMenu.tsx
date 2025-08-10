"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreHorizontal,
  Settings,
  User,
  Search,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Globe,
  Shield,
  Accessibility,
  X,
} from "lucide-react";
import Link from "next/link";

interface CompactMetaMenuProps {
  className?: string;
}

export function CompactMetaMenu({ className = "" }: CompactMetaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Schließe Menü beim Klick außerhalb
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Schließe Menü mit Escape-Taste
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
    
    return undefined;
  }, [isOpen]);

  const menuItems = [
    {
      icon: <Search className="h-3.5 w-3.5" />,
      label: "Erweiterte Suche",
      href: "/suche",
      description: "Detaillierte Fahndungssuche",
    },
    {
      icon: <User className="h-3.5 w-3.5" />,
      label: "Benutzerkonto",
      href: "/konto",
      description: "Profil & Einstellungen",
    },
    {
      icon: <HelpCircle className="h-3.5 w-3.5" />,
      label: "Hilfe & Support",
      href: "/hilfe",
      description: "FAQ & Kontakt",
    },
    {
      icon: <Mail className="h-3.5 w-3.5" />,
      label: "Kontakt",
      href: "/kontakt",
      description: "Direkter Kontakt",
    },
    {
      icon: <Phone className="h-3.5 w-3.5" />,
      label: "Notruf",
      href: "tel:110",
      description: "Polizei-Notruf 110",
    },
    {
      icon: <MapPin className="h-3.5 w-3.5" />,
      label: "Standorte",
      href: "/standorte",
      description: "Polizeidienststellen",
    },
    {
      icon: <Globe className="h-3.5 w-3.5" />,
      label: "Sprachen",
      href: "/sprachen",
      description: "Mehrsprachige Versionen",
    },
    {
      icon: <Shield className="h-3.5 w-3.5" />,
      label: "Datenschutz",
      href: "/datenschutz",
      description: "Datenschutzerklärung",
    },
    {
      icon: <Accessibility className="h-3.5 w-3.5" />,
      label: "Barrierefreiheit",
      href: "/barrierefreiheit",
      description: "A11y-Einstellungen",
    },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 rounded px-2 py-1 text-slate-600 transition-all duration-200 hover:bg-slate-200 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 focus:ring-offset-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-blue-500 dark:focus:ring-offset-slate-900"
        aria-label="Zusätzliche Menüoptionen"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        <span className="hidden sm:inline">Mehr</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-slate-200 bg-white p-2 shadow-lg backdrop-blur-sm transition-all duration-200 dark:border-slate-700 dark:bg-slate-800 sm:w-80"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="compact-menu-button"
        >
          {/* Header */}
          <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Schnellzugriff
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label="Menü schließen"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 gap-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:hover:bg-slate-700 dark:hover:text-slate-100 sm:gap-3 sm:px-3"
                role="menuitem"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600 dark:bg-slate-700 dark:text-slate-400 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400 sm:h-6 sm:w-6">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-900 dark:text-slate-100 sm:text-sm">
                    {item.label}
                  </div>
                  <div className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-2 border-t border-slate-100 pt-2 dark:border-slate-700">
            <Link
              href="/einstellungen"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100 sm:px-3 sm:text-sm"
            >
              <Settings className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>Alle Einstellungen</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
