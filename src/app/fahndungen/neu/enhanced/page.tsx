"use client";

import React, { Suspense } from "react";
import ProtectedRoute from "~/components/auth/ProtectedRoute";
import EnhancedFahndungWizard from "~/components/fahndungen/EnhancedFahndungWizard";

function EnhancedNeueFahndungContent() {
  return (
    <ProtectedRoute requiredRoles={["editor", "admin", "super_admin"]}>
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
