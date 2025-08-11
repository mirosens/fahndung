import type { ComponentType, SVGProps } from "react";
import {
  Shield,
  Users,
  UserCheck,
  Package,
  Eye,
  Plus,
  LayoutDashboard,
  Phone,
  Accessibility,
  Building,
  LogIn,
  UserPlus,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  description?: string;
  urgent?: boolean;
  badge?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  requiresAuth?: boolean;
  authOnly?: boolean;
  isAuthSection?: boolean;
}

export type NavSection = "SICHERHEIT" | "SERVICE" | "POLIZEI";

export const navigationData: Record<NavSection, NavItem[]> = {
  SICHERHEIT: [
    {
      label: "Straftäter",
      href: "/fahndungen/straftaeter",
      description: "Gesuchte Straftäter",
      icon: Shield,
      urgent: false,
    },
    {
      label: "Vermisste",
      href: "/fahndungen/vermisste",
      description: "Vermisste Personen",
      icon: Users,
      urgent: false,
    },
    {
      label: "Unbekannte Tote",
      href: "/fahndungen/unbekannte-tote",
      description: "Identifizierung unbekannter Verstorbener",
      icon: UserCheck,
      urgent: false,
    },
    {
      label: "Sachen",
      href: "/fahndungen/sachen",
      description: "Vermisste oder gestohlene Gegenstände",
      icon: Package,
      urgent: false,
    },
  ],

  SERVICE: [
    {
      label: "Kontakt zur Polizei",
      href: "/kontakt",
      description: "Notrufnummern und Dienststellen",
      icon: Phone,
      urgent: true,
    },
    {
      label: "Dienststellen",
      href: "/dienststellen",
      description: "Standorte und Öffnungszeiten",
      icon: Building,
      urgent: false,
    },
    {
      label: "Polizeipräsidium Stuttgart",
      href: "/polizei/stuttgart",
      description: "Hahnemannstraße 1, 70174 Stuttgart",
      icon: Building,
      urgent: false,
    },
    {
      label: "Polizeipräsidium Karlsruhe",
      href: "/polizei/karlsruhe",
      description: "Erbprinzenstraße 96, 76133 Karlsruhe",
      icon: Building,
      urgent: false,
    },
    {
      label: "Polizeipräsidium Mannheim",
      href: "/polizei/mannheim",
      description: "Collinistraße 1, 68161 Mannheim",
      icon: Building,
      urgent: false,
    },
    {
      label: "Polizeipräsidium Freiburg",
      href: "/polizei/freiburg",
      description: "Basler Landstraße 113, 79111 Freiburg",
      icon: Building,
      urgent: false,
    },
    {
      label: "Barrierefreiheit",
      href: "/barrierefreiheit",
      description: "Leichte Sprache und Gebärdensprache",
      icon: Accessibility,
      urgent: false,
    },
  ],

  POLIZEI: [
    // Dashboard und Fahndungen (nur für angemeldete Benutzer)
    {
      label: "Dashboard",
      href: "/dashboard",
      description: "Fahndungs-Dashboard und Statistiken",
      icon: LayoutDashboard,
      urgent: false,
      requiresAuth: true,
    },
    {
      label: "Alle Fahndungen",
      href: "/fahndungen",
      description: "Übersicht aller aktiven Fahndungen",
      icon: Eye,
      urgent: false,
      requiresAuth: true,
    },
    {
      label: "Neue Fahndung",
      href: "/fahndungen/neu/enhanced",
      description: "Neue Fahndung erstellen",
      icon: Plus,
      urgent: true,
      badge: "NEU",
      requiresAuth: true,
      // 🔥 Erlaube Zugriff für alle angemeldeten Benutzer
      allowAllAuthenticated: true,
    },
    // Authentifizierung - Separater Bereich unten
    {
      label: "Anmelden",
      href: "/login",
      description: "Als Polizeibeamter anmelden",
      icon: LogIn,
      urgent: false,
      authOnly: true,
      isAuthSection: true,
    },
    {
      label: "Registrieren",
      href: "/register",
      description: "Neues Polizei-Konto erstellen",
      icon: UserPlus,
      urgent: false,
      authOnly: true,
      isAuthSection: true,
    },
  ],
};
