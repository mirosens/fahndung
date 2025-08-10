"use client";

import React from "react";
import CategoryNavigation from "./CategoryNavigation";

interface CategoryLayoutProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  children: React.ReactNode;
}

export default function CategoryLayout({
  activeCategory,
  onCategoryChange,
  children,
}: CategoryLayoutProps) {
  return (
    <div className="w-full space-y-6">
      {/* Navigation */}
      <CategoryNavigation
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
      />

      {/* Kategorie-spezifischer Inhalt */}
      {children}
    </div>
  );
}
