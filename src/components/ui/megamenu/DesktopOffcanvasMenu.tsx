"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronDown,
  LogOut,
  LogIn,
  UserPlus,
  Search,
  Shield,
  Users,
  AlertTriangle,
  Package,
  Phone,
  HelpCircle,
  User,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "~/hooks/useAuth";

interface MenuItem {
  label: string;
  href?: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: string;
  subItems?: MenuItem[];
}

interface DesktopOffcanvasMenuProps {
  menuItems?: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function DesktopOffcanvasMenu({
  menuItems,
  isOpen,
  onClose,
}: DesktopOffcanvasMenuProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAuthenticated, logout, session } = useAuth();

  // Default menu items mit Lucide Icons
  const defaultItems: MenuItem[] = [
    {
      label: "Fahndungen",
      href: isAuthenticated ? "/fahndungen" : "/fahndungen",
      description: isAuthenticated
        ? "Fahndungen verwalten"
        : "Aktuelle Fahndungsfälle und Hinweise",
      icon: <Search className="h-5 w-5" />,
      badge: "Neu",
      subItems: isAuthenticated
        ? []
        : [
            {
              label: "Straftäter",
              href: "/fahndungen/straftaeter",
              icon: <Users className="h-4 w-4" />,
            },
            {
              label: "Vermisste Personen",
              href: "/fahndungen/vermisste",
              icon: <AlertTriangle className="h-4 w-4" />,
            },
            {
              label: "Unbekannte Tote",
              href: "/fahndungen/unbekannte-tote",
              icon: <Package className="h-4 w-4" />,
            },
            {
              label: "Gestohlene Sachen",
              href: "/fahndungen/sachen",
              icon: <Package className="h-4 w-4" />,
            },
          ],
    },
    {
      label: "FAQ",
      href: "/faq",
      description: "Häufig gestellte Fragen",
      icon: <HelpCircle className="h-5 w-5" />,
    },
    {
      label: "Kontakt",
      href: "/kontakt",
      description: "So erreichen Sie uns",
      icon: <Phone className="h-5 w-5" />,
    },
  ];

  const items = menuItems ?? defaultItems;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const toggleExpanded = (label: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(label)) {
      newExpanded.delete(label);
    } else {
      newExpanded.add(label);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (href?: string) => {
    if (href) {
      // 🚀 PREFETCH FÜR SCHNELLERE NAVIGATION
      router.prefetch(href);

      // 🚀 SOFORTIGE NAVIGATION
      router.push(href);
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      router.push("/");
    } catch (error) {
      console.error("Fehler beim Logout:", error);
    }
  };

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Hilfsfunktion für Header-Variant-Wechsel
  const switchToModernHeader = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("header-variant", "modern");
      window.dispatchEvent(
        new CustomEvent<"modern" | "classic">("header-variant-change", {
          detail: "modern",
        }),
      );
    }
  };



  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={handleOverlayClick}
            ref={overlayRef}
          />

          {/* Offcanvas */}
          <div
            className="fixed right-0 top-0 z-[9999] h-full w-full max-w-xs bg-white shadow-sm transition-transform duration-300 ease-out dark:bg-background"
            role="dialog"
            aria-modal="true"
            aria-labelledby="desktop-offcanvas-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3 dark:border-border">
              <h3
                id="desktop-offcanvas-title"
                className="font-bold text-muted-foreground dark:text-foreground"
              >
                Menü
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-muted text-muted-foreground hover:bg-muted focus:bg-muted focus:outline-none disabled:pointer-events-none disabled:opacity-50 dark:bg-muted dark:text-muted-foreground dark:hover:bg-accent dark:focus:bg-accent"
                aria-label="Menü schließen"
              >
                <span className="sr-only">Schließen</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex h-full flex-col">
              {/* Search */}
              <div className="border-b border-border p-4 dark:border-border">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Menü durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-border bg-white px-10 py-2 text-sm text-muted-foreground placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-input dark:bg-background dark:text-foreground dark:placeholder-muted-foreground"
                  />
                </div>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <div key={item.label}>
                      <button
                        onClick={() => {
                          if (item.subItems && item.subItems.length > 0) {
                            toggleExpanded(item.label);
                          } else {
                            handleItemClick(item.href);
                          }
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted dark:text-foreground dark:hover:bg-accent"
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.subItems && item.subItems.length > 0 && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedItems.has(item.label) ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>

                      {/* Sub Items */}
                      {item.subItems && expandedItems.has(item.label) && (
                        <div className="ml-6 mt-2 space-y-1">
                          {item.subItems.map((subItem) => (
                            <button
                              key={subItem.label}
                              onClick={() => handleItemClick(subItem.href)}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted dark:text-muted-foreground dark:hover:bg-accent"
                            >
                              {subItem.icon}
                              <span>{subItem.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Auth Section */}
                <div className="mt-6 border-t border-border pt-4 dark:border-border">
                  {/* Modern Header Button */}
                  <button
                    onClick={() => {
                      switchToModernHeader();
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <Zap className="h-4 w-4" />
                    <span>Zum modernen Menü wechseln</span>
                  </button>

                  {isAuthenticated ? (
                    <div className="space-y-2">
                      {/* User Info */}
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground dark:text-muted-foreground">
                        <User className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium text-muted-foreground dark:text-foreground">
                            Angemeldet als:
                          </span>
                          <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                            {session?.user?.email ?? "Unbekannt"}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          router.push("/dashboard");
                          onClose();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted dark:text-foreground dark:hover:bg-accent"
                      >
                        <Shield className="h-4 w-4" />
                        <span>Dashboard</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Abmelden</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          router.push("/login");
                          onClose();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Anmelden</span>
                      </button>
                      <button
                        onClick={() => {
                          router.push("/register");
                          onClose();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-green-600 transition-colors hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Registrieren</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
