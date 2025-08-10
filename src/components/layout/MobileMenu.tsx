"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type TouchEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ChevronRight,
  Shield,
  Phone,
  Download,
  Building,
  Briefcase,
  FileText,
  MapPin,
  ExternalLink,
  LogIn,
  UserPlus,
  Star,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface MenuItem {
  id: string;
  title: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  category: string;
  isExternal?: boolean;
  priority?: "high" | "medium" | "low";
  keywords?: string[];
}

interface MenuCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  items: MenuItem[];
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  session?: {
    user?: { email?: string; name?: string };
    profile?: { role?: string };
  } | null;
  onLogin?: () => void;
  onRegister?: () => void;
}

// Menu Data with enhanced structure
const menuCategories: MenuCategory[] = [
  {
    id: "security",
    title: "Sicherheit",
    icon: Shield,
    color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900",
    items: [
      {
        id: "fahndungen",
        title: "Fahndungen",
        href: "/fahndungen",
        description: "Aktuelle Fahndungsfälle",
        icon: Shield,
        category: "security",
        priority: "high",
        keywords: ["fahndung", "suche", "person", "vermisst", "straftäter"],
      },
      {
        id: "statistiken",
        title: "Statistiken",
        href: "/statistiken",
        description: "Kriminalitätsstatistiken",
        icon: FileText,
        category: "security",
        priority: "medium",
        keywords: ["statistik", "kriminalität", "zahlen", "daten"],
      },
      {
        id: "hinweise",
        title: "Sicherheitshinweise",
        href: "/hinweise",
        description: "Wichtige Sicherheitstipps",
        icon: Zap,
        category: "security",
        priority: "medium",
        keywords: ["sicherheit", "tipps", "prävention", "schutz"],
      },
      {
        id: "praevention",
        title: "Prävention",
        href: "/praevention",
        description: "Vorbeugende Maßnahmen",
        icon: Star,
        category: "security",
        priority: "medium",
        keywords: ["prävention", "vorbeugung", "schutz", "sicherheit"],
      },
    ],
  },
  {
    id: "service",
    title: "Service",
    icon: Phone,
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900",
    items: [
      {
        id: "online-wache",
        title: "Online-Wache",
        href: "/online-wache",
        description: "Anzeige online erstatten",
        icon: Building,
        category: "service",
        priority: "high",
        keywords: ["anzeige", "online", "wache", "strafanzeige", "meldung"],
      },
      {
        id: "kontakt",
        title: "Kontakt",
        href: "/kontakt",
        description: "Kontaktinformationen",
        icon: Phone,
        category: "service",
        priority: "high",
        keywords: ["kontakt", "telefon", "adresse", "erreichbarkeit"],
      },
      {
        id: "faq",
        title: "Häufige Fragen",
        href: "/faq",
        description: "Antworten auf häufige Fragen",
        icon: FileText,
        category: "service",
        priority: "medium",
        keywords: ["faq", "fragen", "antworten", "hilfe", "support"],
      },
      {
        id: "downloads",
        title: "Downloads",
        href: "/downloads",
        description: "Formulare und Dokumente",
        icon: Download,
        category: "service",
        priority: "medium",
        keywords: ["download", "formular", "dokument", "pdf", "antrag"],
      },
    ],
  },
  {
    id: "police",
    title: "Polizei",
    icon: Building,
    color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900",
    items: [
      {
        id: "ueber-uns",
        title: "Über uns",
        href: "/ueber-uns",
        description: "Informationen zur Polizei BW",
        icon: Building,
        category: "police",
        priority: "medium",
        keywords: ["polizei", "baden-württemberg", "information", "über"],
      },
      {
        id: "karriere",
        title: "Karriere",
        href: "/karriere",
        description: "Stellenangebote und Bewerbung",
        icon: Briefcase,
        category: "police",
        priority: "high",
        keywords: ["karriere", "job", "stelle", "bewerbung", "ausbildung"],
      },
      {
        id: "presse",
        title: "Presse",
        href: "/presse",
        description: "Pressemitteilungen",
        icon: FileText,
        category: "police",
        priority: "low",
        keywords: ["presse", "medien", "mitteilung", "news", "nachrichten"],
      },
      {
        id: "standorte",
        title: "Standorte",
        href: "/standorte",
        description: "Polizeidienststellen",
        icon: MapPin,
        category: "police",
        priority: "medium",
        keywords: ["standort", "dienststelle", "adresse", "polizeirevier"],
      },
    ],
  },
];

// Quick Access Items
const quickAccessItems: MenuItem[] = [
  {
    id: "emergency-fahndungen",
    title: "Aktuelle Fahndungen",
    href: "/fahndungen",
    description: "🚨 Sofortiger Zugriff",
    icon: Shield,
    category: "quick",
    priority: "high",
    keywords: ["eilfahndung", "aktuell", "sofort", "dringend"],
  },
  {
    id: "emergency-online-wache",
    title: "Online-Wache",
    href: "/online-wache",
    description: "🏢 Anzeige erstatten",
    icon: Building,
    category: "quick",
    priority: "high",
    keywords: ["anzeige", "online", "schnell", "direkt"],
  },
];

// Search functionality with fuzzy matching
const useSearch = (items: MenuItem[], query: string): MenuItem[] => {
  return useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const allItems = items.flatMap((item) => [item]);

    return allItems
      .map((item) => {
        let score = 0;
        const titleMatch = item.title.toLowerCase().includes(searchTerm);
        const descMatch = item.description?.toLowerCase().includes(searchTerm);
        const keywordMatch = item.keywords?.some((keyword) =>
          keyword.toLowerCase().includes(searchTerm),
        );

        if (titleMatch) score += 10;
        if (descMatch) score += 5;
        if (keywordMatch) score += 3;
        if (item.priority === "high") score += 2;

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item)
      .slice(0, 8); // Limit results
  }, [items, query]);
};

// Custom hook for touch gestures
const useSwipeToClose = (onClose: () => void, _isOpen: boolean) => {
  const [startX, setStartX] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    setStartX(e.touches[0]?.clientX ?? null);
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (startX === null) return;

      const endX = e.changedTouches[0]?.clientX ?? 0;
      const diff = endX - startX;

      // Swipe right to close (threshold: 100px)
      if (diff > 100) {
        onClose();
      }

      setStartX(null);
    },
    [startX, onClose],
  );

  return { handleTouchStart, handleTouchEnd };
};

export function ModernMobileMenu({
  isOpen,
  onClose,
  session,
  onLogin,
  onRegister,
}: MobileMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Flatten all menu items for search
  const allMenuItems = useMemo(
    () => [...quickAccessItems, ...menuCategories.flatMap((cat) => cat.items)],
    [],
  );

  const searchResults = useSearch(allMenuItems, searchQuery);
  const { handleTouchStart, handleTouchEnd } = useSwipeToClose(onClose, isOpen);

  // Focus management
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Delay focus to ensure animation completes
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent): void => {
      if (!isOpen) return;

      const items = searchQuery ? searchResults : allMenuItems;
      const maxIndex = items.length - 1;

      switch (e.key) {
        case "Escape":
          onClose();
          return;
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, maxIndex));
          return;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, -1));
          return;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex <= maxIndex) {
            const item = items[focusedIndex];
            if (item) {
              router.push(item.href);
              onClose();
            }
          }
          return;
        default:
          return;
      }
    },
    [
      isOpen,
      searchQuery,
      searchResults,
      allMenuItems,
      focusedIndex,
      onClose,
      router,
    ],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px"; // Compensate for scrollbar
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  const handleItemClick = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose],
  );

  // Reset states when menu closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setActiveCategory(null);
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-black"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Mobile Menu Panel */}
          <motion.div
            ref={menuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              duration: 0.3,
            }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl dark:bg-gray-900"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <h2
                  id="mobile-menu-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  Navigation
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  aria-label="Menü schließen"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Suchen Sie nach Inhalten..."
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400"
                    autoComplete="off"
                    role="searchbox"
                    aria-label="Navigation durchsuchen"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Suche löschen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain bg-white dark:bg-gray-900">
              <div className="px-6 py-4">
                {/* Search Results */}
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Suchergebnisse ({searchResults.length})
                    </h3>
                    <div className="space-y-2">
                      {searchResults.length > 0 ? (
                        searchResults.map((item, index) => (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleItemClick(item.href)}
                            className={`w-full rounded-lg p-3 text-left transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${
                              focusedIndex === index
                                ? "bg-blue-50 ring-2 ring-blue-500 dark:bg-blue-900/20"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon && (
                                <item.icon className="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {item.title}
                                </div>
                                {item.description && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.description}
                                  </div>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </motion.button>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <div className="text-gray-500 dark:text-gray-400">
                            Keine Ergebnisse gefunden
                          </div>
                          <div className="mt-1 text-sm text-gray-400">
                            Versuchen Sie andere Suchbegriffe
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Default Content */}
                {!searchQuery && (
                  <>
                    {/* Quick Access */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6"
                    >
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                        Schnellzugriff
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {quickAccessItems.map((item, index) => (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleItemClick(item.href)}
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-left text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <div className="relative z-10 flex items-center gap-3">
                              {item.icon && (
                                <item.icon className="h-6 w-6 flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold">
                                  {item.title}
                                </div>
                                <div className="text-sm">
                                  {item.description}
                                </div>
                              </div>
                              <ExternalLink className="h-4 w-4" />
                            </div>
                            <div className="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-100" />
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Menu Categories */}
                    {menuCategories.map((category, categoryIndex) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (categoryIndex + 1) * 0.1 }}
                        className="mb-6"
                      >
                        <button
                          onClick={() =>
                            setActiveCategory(
                              activeCategory === category.id
                                ? null
                                : category.id,
                            )
                          }
                          className="mb-3 flex w-full items-center gap-2 text-left"
                        >
                          <div className={`rounded-lg p-2 ${category.color}`}>
                            <category.icon className="h-4 w-4" />
                          </div>
                          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                            {category.title}
                          </h3>
                          <ChevronRight
                            className={`ml-auto h-4 w-4 text-gray-400 transition-transform ${
                              activeCategory === category.id ? "rotate-90" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence>
                          {activeCategory === category.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-2">
                                {category.items.map((item, itemIndex) => (
                                  <motion.button
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: itemIndex * 0.05 }}
                                    onClick={() => handleItemClick(item.href)}
                                    className="w-full rounded-lg bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                                  >
                                    <div className="flex items-center gap-3">
                                      {item.icon && (
                                        <item.icon className="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">
                                          {item.title}
                                        </div>
                                        {item.description && (
                                          <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {item.description}
                                          </div>
                                        )}
                                      </div>
                                      <ChevronRight className="h-4 w-4 text-gray-400" />
                                    </div>
                                  </motion.button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                {session ? (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Angemeldet als {session.user?.email}
                    </div>
                    <button
                      onClick={() => {
                        router.push("/dashboard");
                        onClose();
                      }}
                      className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        onLogin?.();
                        onClose();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      <LogIn className="h-4 w-4" />
                      Anmelden
                    </button>
                    <button
                      onClick={() => {
                        onRegister?.();
                        onClose();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 py-3 font-medium transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                    >
                      <UserPlus className="h-4 w-4" />
                      Registrieren
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
