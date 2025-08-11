"use client";

import React, { Suspense } from "react";
import ProtectedRoute from "~/components/auth/ProtectedRoute";
import EnhancedFahndungWizard from "~/components/fahndungen/EnhancedFahndungWizard";

function EnhancedNeueFahndungContent() {
  return (
    <ProtectedRoute 
      requiredRoles={["editor", "admin", "super_admin", "user"]}
      fallback={
        <div className="min-h-screen bg-background">
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-2xl">🔍</div>
              <p className="text-muted-foreground">Prüfe Berechtigung...</p>
            </div>
          </div>
        </div>
      }
    >
      <EnhancedFahndungWizard mode="create" />
    </ProtectedRoute>
  );
}

export default function EnhancedNeueFahndungPage() {
  return (
    <Suspense fallback={<div>Lade...</div>}>
      <EnhancedNeueFahndungContent />
    </Suspense>
  );
}
