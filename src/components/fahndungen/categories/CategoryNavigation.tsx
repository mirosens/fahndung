"use client";

import React from "react";
import { Search, Info, FileText, Images, MapPin } from "lucide-react";

interface CategoryNavigationProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export default function CategoryNavigation({
  activeCategory = "fahndung",
  onCategoryChange,
}: CategoryNavigationProps) {
  const categories = [
    { id: "fahndung", label: "Fahndung", icon: Search },
    { id: "contact", label: "Übersicht", icon: Info },
    { id: "description", label: "Beschreibung", icon: FileText },
    { id: "media", label: "Medien", icon: Images },
    { id: "locations", label: "Orte", icon: MapPin },
  ];

  return (
    <div className="mb-6">
      <nav className="flex space-x-1 rounded-lg bg-muted p-1 dark:bg-muted">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange?.(category.id)}
              className={`flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-2 text-sm font-medium transition-colors md:gap-2 md:px-3 ${
                activeCategory === category.id
                  ? "bg-white text-blue-600 shadow-sm dark:bg-muted dark:text-blue-400"
                  : "text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-white"
              }`}
              title={category.label}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{category.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
