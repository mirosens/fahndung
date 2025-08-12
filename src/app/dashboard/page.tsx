"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";
import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import {
  Loader2,
  LayoutDashboard,
  Shield,
  User,
  CheckCircle,
  RefreshCw,
  Search,
  Trash2,
  Archive,
  Edit3,
  Eye,
  EyeOff,
  MoreHorizontal,
  CheckSquare,
  Square,
  AlertTriangle,
  Calendar,
  MapPin,
  Tag,
} from "lucide-react";
import { getBrowserClient } from "~/lib/supabase/supabase-browser";
import { getRolePermissions } from "~/lib/auth";
import { type Fahndungskarte } from "~/types/fahndungskarte";

export default function DashboardPage() {
  const { user, session, loading, initialized } = useAuth();
  const router = useRouter();

  // Dashboard-spezifische States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedInvestigations, setSelectedInvestigations] = useState<
    string[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [investigations, setInvestigations] = useState<Fahndungskarte[]>([]);
  const [investigationsLoading, setInvestigationsLoading] = useState(true);

  // Benutzer und Berechtigungen
  const userProfile = session?.profile ?? null;
  const userPermissions = userProfile
    ? getRolePermissions(userProfile.role)
    : {
        canRead: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canPublish: true,
        canManageUsers: true,
      };

  // Fahndungen direkt von Supabase laden
  const loadInvestigations = useCallback(async () => {
    try {
      setInvestigationsLoading(true);
      const supabase = getBrowserClient();

      let query = supabase
        .from("investigations")
        .select("*")
        .order("created_at", { ascending: false });

      // Filter anwenden
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (priorityFilter !== "all") {
        query = query.eq("priority", priorityFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Fehler beim Laden der Fahndungen:", error);
        setInvestigations([]);
      } else {
        // Sichere Typkonvertierung mit Validierung
        const validatedData =
          (data as unknown as Fahndungskarte[])?.filter(
            (item): item is Fahndungskarte =>
              item &&
              typeof item === "object" &&
              "id" in item &&
              "title" in item &&
              "case_number" in item,
          ) ?? [];
        setInvestigations(validatedData);
      }
    } catch (error) {
      console.error("Fehler beim Laden der Fahndungen:", error);
      setInvestigations([]);
    } finally {
      setInvestigationsLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  // Fahndungen beim Mount und bei Filter-Änderungen laden
  useEffect(() => {
    if (initialized && !loading) {
      void loadInvestigations();
    }
  }, [initialized, loading, loadInvestigations]);

  // Gefilterte Fahndungen
  const filteredInvestigations = investigations.filter(
    (inv: Fahndungskarte) =>
      inv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.location ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Statistiken
  const stats = {
    total: investigations.length,
    active: investigations.filter(
      (inv: Fahndungskarte) => inv.status === "active",
    ).length,
    published: investigations.filter(
      (inv: Fahndungskarte) => inv.status === "published",
    ).length,
    urgent: investigations.filter(
      (inv: Fahndungskarte) => inv.priority === "urgent",
    ).length,
    selected: selectedInvestigations.length,
  };

  // SCHUTZ FÜR GESCHÜTZTE SEITEN
  useEffect(() => {
    if (!user && initialized && !loading) {
      router.push("/login");
    }
  }, [user, initialized, loading, router]);

  // Bulk-Aktionen
  const handleSelectAll = () => {
    if (selectedInvestigations.length === filteredInvestigations.length) {
      setSelectedInvestigations([]);
    } else {
      setSelectedInvestigations(filteredInvestigations.map((inv) => inv.id));
    }
  };

  const handleSelectInvestigation = (id: string) => {
    setSelectedInvestigations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    if (!userPermissions?.canDelete) {
      alert("Sie haben keine Berechtigung zum Löschen von Fahndungen.");
      return;
    }

    if (
      !confirm(
        `Möchten Sie wirklich ${selectedInvestigations.length} Fahndungen löschen?`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const supabase = getBrowserClient();

      // Fahndungen aus der Datenbank löschen
      const { error } = await supabase
        .from("investigations")
        .delete()
        .in("id", selectedInvestigations);

      if (error) {
        console.error("Fehler beim Löschen der Fahndungen:", error);
        alert(
          "Fehler beim Löschen der Fahndungen. Bitte versuchen Sie es erneut.",
        );
        return;
      }

      // Erfolgreich gelöscht - aus der lokalen Liste entfernen
      setInvestigations((prev) =>
        prev.filter((inv) => !selectedInvestigations.includes(inv.id)),
      );
      setSelectedInvestigations([]);

      alert(
        `${selectedInvestigations.length} Fahndungen wurden erfolgreich gelöscht.`,
      );
    } catch (error) {
      console.error("Fehler beim Löschen:", error);
      alert(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkArchive = async () => {
    if (!userPermissions?.canEdit) {
      alert("Sie haben keine Berechtigung zum Bearbeiten von Fahndungen.");
      return;
    }

    if (
      !confirm(
        `Möchten Sie wirklich ${selectedInvestigations.length} Fahndungen archivieren?`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const supabase = getBrowserClient();

      // Fahndungen als archiviert markieren
      const { error } = await supabase
        .from("investigations")
        .update({
          status: "archived",
          updated_at: new Date().toISOString(),
        })
        .in("id", selectedInvestigations);

      if (error) {
        console.error("Fehler beim Archivieren der Fahndungen:", error);
        alert(
          "Fehler beim Archivieren der Fahndungen. Bitte versuchen Sie es erneut.",
        );
        return;
      }

      // Lokale Liste aktualisieren
      setInvestigations((prev) =>
        prev.map((inv) =>
          selectedInvestigations.includes(inv.id)
            ? { ...inv, status: "archived" }
            : inv,
        ),
      );
      setSelectedInvestigations([]);

      alert(
        `${selectedInvestigations.length} Fahndungen wurden erfolgreich archiviert.`,
      );
    } catch (error) {
      console.error("Fehler beim Archivieren:", error);
      alert(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (!userPermissions?.canEdit) {
      alert("Sie haben keine Berechtigung zum Bearbeiten von Fahndungen.");
      return;
    }

    if (
      !confirm(
        `Möchten Sie wirklich ${selectedInvestigations.length} Fahndungen unpublizieren?`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      const supabase = getBrowserClient();

      // Fahndungen als Entwurf markieren (unpublizieren)
      const { error } = await supabase
        .from("investigations")
        .update({
          status: "draft",
          updated_at: new Date().toISOString(),
        })
        .in("id", selectedInvestigations);

      if (error) {
        console.error("Fehler beim Unpublizieren der Fahndungen:", error);
        alert(
          "Fehler beim Unpublizieren der Fahndungen. Bitte versuchen Sie es erneut.",
        );
        return;
      }

      // Lokale Liste aktualisieren
      setInvestigations((prev) =>
        prev.map((inv) =>
          selectedInvestigations.includes(inv.id)
            ? { ...inv, status: "draft" }
            : inv,
        ),
      );
      setSelectedInvestigations([]);

      alert(
        `${selectedInvestigations.length} Fahndungen wurden erfolgreich unpubliziert.`,
      );
    } catch (error) {
      console.error("Fehler beim Unpublizieren:", error);
      alert(
        "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Loading-Zustand
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <LayoutDashboard className="h-8 w-8 text-primary" />
              </div>
            </div>

            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />

            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Fahndungs-Dashboard
            </h1>

            <p className="mb-6 text-muted-foreground">
              Prüfe Authentifizierung...
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Nur für autorisierte Benutzer</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wenn nicht angemeldet, zeige Weiterleitung
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <LayoutDashboard className="h-8 w-8 text-primary" />
              </div>
            </div>

            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />

            <h1 className="mb-2 text-2xl font-bold text-foreground">
              Fahndungs-Dashboard
            </h1>

            <p className="mb-6 text-muted-foreground">
              Weiterleitung zur Anmeldung...
            </p>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Nur für autorisierte Benutzer</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Wenn angemeldet, zeige Dashboard-Inhalt
  return (
    <div className="min-h-screen bg-background">
      <Header variant="dashboard" session={session} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header mit Benutzer-Informationen */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Fahndungs-Dashboard
              </h1>
              <p className="mt-2 text-muted-foreground">
                Übersicht über alle Fahndungen und Verwaltung
              </p>
            </div>

            {/* Benutzer-Info */}
            {session && (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {session.user.email}
                  </p>
                  <p className="text-muted-foreground">
                    {session.profile?.role ?? "Benutzer"}
                  </p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
        </div>

        {/* Statistiken */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Gesamt Fahndungen
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Veröffentlicht
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.published}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dringend
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.urgent}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                <CheckSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ausgewählt
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stats.selected}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Such- und Filter-Bereich */}
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Suchfeld */}
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Fahndungen durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="all">Alle Status</option>
                <option value="active">Aktiv</option>
                <option value="published">Veröffentlicht</option>
                <option value="draft">Entwurf</option>
                <option value="archived">Archiviert</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="all">Alle Prioritäten</option>
                <option value="urgent">Dringend</option>
                <option value="normal">Normal</option>
                <option value="new">Neu</option>
              </select>

              <button
                onClick={() => void loadInvestigations()}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent"
              >
                <RefreshCw className="h-4 w-4" />
                Aktualisieren
              </button>
            </div>
          </div>
        </div>

        {/* Bulk-Aktionen */}
        {selectedInvestigations.length > 0 && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  {selectedInvestigations.length} Fahndungen ausgewählt
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkUnpublish}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
                >
                  <EyeOff className="h-4 w-4" />
                  {isProcessing ? "Unpubliziere..." : "Unpublizieren"}
                </button>
                <button
                  onClick={handleBulkArchive}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  <Archive className="h-4 w-4" />
                  {isProcessing ? "Archiviere..." : "Archivieren"}
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isProcessing}
                  className="flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {isProcessing ? "Lösche..." : "Löschen"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fahndungen-Liste */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Fahndungen ({filteredInvestigations.length})
                {investigationsLoading && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    <Loader2 className="inline h-4 w-4 animate-spin" />
                    Lade...
                  </span>
                )}
              </h2>
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                {selectedInvestigations.length ===
                filteredInvestigations.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Alle auswählen
              </button>
            </div>
          </div>

          <div className="divide-y divide-border">
            {investigationsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Lade Fahndungen...</p>
              </div>
            ) : filteredInvestigations.length === 0 ? (
              <div className="p-8 text-center">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                  Keine Fahndungen gefunden
                </h3>
                <p className="mt-2 text-muted-foreground">
                  {searchTerm
                    ? "Versuchen Sie andere Suchbegriffe."
                    : "Erstellen Sie Ihre erste Fahndung."}
                </p>
                {userPermissions?.canCreate && !searchTerm && (
                  <button
                    onClick={() => router.push("/fahndungen/neu")}
                    className="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                  >
                    Neue Fahndung erstellen
                  </button>
                )}
              </div>
            ) : (
              filteredInvestigations.map((investigation) => (
                <div
                  key={investigation.id}
                  className="flex items-center gap-4 p-4 hover:bg-accent/50"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedInvestigations.includes(investigation.id)}
                    onChange={() => handleSelectInvestigation(investigation.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />

                  {/* Fahndungs-Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground">
                            {investigation.title}
                          </h3>
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {investigation.case_number}
                          </span>
                          {investigation.priority === "urgent" && (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                              Dringend
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {investigation.short_description ??
                            investigation.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          {investigation.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{investigation.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(
                                investigation.created_at,
                              ).toLocaleDateString("de-DE")}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            <span className="capitalize">
                              {investigation.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Aktionen */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/fahndungen/${investigation.id}`)
                          }
                          className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                        >
                          <Eye className="h-3 w-3" />
                          Anzeigen
                        </button>
                        {userPermissions?.canEdit && (
                          <button
                            onClick={() =>
                              router.push(
                                `/fahndungen/${investigation.id}/bearbeiten`,
                              )
                            }
                            className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-600"
                          >
                            <Edit3 className="h-3 w-3" />
                            Bearbeiten
                          </button>
                        )}
                        <button className="flex items-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted">
                          <MoreHorizontal className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Schnellaktionen */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Schnellaktionen
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/fahndungen/neu/enhanced")}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Shield className="h-4 w-4" />
              Neue Fahndung erstellen
            </button>
            <button
              onClick={() => router.push("/fahndungen")}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              <LayoutDashboard className="h-4 w-4" />
              Alle Fahndungen anzeigen
            </button>
            <button
              onClick={() => router.push("/admin")}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              <User className="h-4 w-4" />
              Admin-Bereich
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
