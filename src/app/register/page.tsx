"use client";

import AuthPageLayout from "~/components/layout/AuthPageLayout";
import RegisterForm from "~/components/auth/RegisterForm";

// Verhindere Pre-rendering für diese Seite
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <AuthPageLayout variant="register">
      <RegisterForm />
    </AuthPageLayout>
  );
}
