"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  History,
  Download,
  FileText,
  Image,
  Calendar,
  Users,
  Eye,
  Share2,
  Settings,
  Database,
  RefreshCw,
  TrendingUp,
  Activity,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { toast } from "~/lib/toast";

interface Investigation {
  id: string;
  title: string;
  case_number: string;
  status: string;
  priority: "normal" | "urgent" | "new";
  created_at: string;
  updated_at: string;
  article_views?: number;
  created_by?: string;
}

interface AdvancedActionsProps {
  investigation: Investigation;
  onAction?: () => void;
  userPermissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canPublish: boolean;
    canViewStats: boolean;
  };
}

export default function AdvancedActions({
  investigation,
  onAction,
  userPermissions,
}: AdvancedActionsProps) {
  const router = useRouter();
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const canViewStats = userPermissions?.canViewStats ?? true;

  // tRPC Queries
  const { data: stats } = api.post.getInvestigationStats.useQuery(
    { id: investigation.id },
    { enabled: canViewStats && isStatsOpen },
  );

  const { data: history } = api.post.getInvestigationHistory.useQuery(
    { id: investigation.id },
    { enabled: isHistoryOpen },
  );

  const handleExportJSON = async () => {
    try {
      const response = await fetch(
        `/api/export/fahndung/${investigation.id}?format=json`,
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fahndung-${investigation.case_number}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("JSON-Export erfolgreich");
      } else {
        toast.error("Fehler beim JSON-Export");
      }
    } catch (error) {
      console.error("JSON Export failed:", error);
      toast.error("Fehler beim JSON-Export");
    }
  };

  const handleExportImages = async () => {
    try {
      const response = await fetch(
        `/api/export/fahndung/${investigation.id}/images`,
      );
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fahndung-${investigation.case_number}-images.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Bilder-Export erfolgreich");
      } else {
        toast.error("Fehler beim Bilder-Export");
      }
    } catch (error) {
      console.error("Images Export failed:", error);
      toast.error("Fehler beim Bilder-Export");
    }
  };

  const handleRefreshStats = () => {
    // Trigger a refresh of the stats
    window.location.reload();
    toast.success("Statistiken aktualisiert");
  };

  const handleShareStats = async () => {
    try {
      const statsText = `
Fahndung: ${investigation.title}
Aktennummer: ${investigation.case_number}
Status: ${investigation.status}
Priorität: ${investigation.priority}
Aufrufe: ${stats?.views ?? 0}
Erstellt: ${new Date(investigation.created_at).toLocaleDateString("de-DE")}
      `.trim();

      if (navigator.share) {
        await navigator.share({
          title: "Fahndung Statistiken",
          text: statsText,
        });
      } else {
        await navigator.clipboard.writeText(statsText);
        toast.success("Statistiken in Zwischenablage kopiert");
      }
    } catch (error) {
      console.error("Share stats failed:", error);
      toast.error("Fehler beim Teilen der Statistiken");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {canViewStats && (
            <DropdownMenuItem onClick={() => setIsStatsOpen(true)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Statistiken
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setIsHistoryOpen(true)}>
            <History className="mr-2 h-4 w-4" />
            Historie
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setIsExportOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Erweiterte Exporte
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleExportJSON}>
            <FileText className="mr-2 h-4 w-4" />
            Als JSON exportieren
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleExportImages}>
            <Image className="mr-2 h-4 w-4" />
            Bilder exportieren
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleRefreshStats}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Statistiken aktualisieren
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleShareStats}>
            <Share2 className="mr-2 h-4 w-4" />
            Statistiken teilen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Statistiken Dialog */}
      <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistiken
            </DialogTitle>
            <DialogDescription>
              Detaillierte Statistiken für {investigation.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Aufrufe</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {stats?.views ?? 0}
                </p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <p className="text-lg font-semibold capitalize text-green-600">
                  {investigation.status}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Erstellt:</span>
                <span className="text-sm font-medium">
                  {new Date(investigation.created_at).toLocaleDateString(
                    "de-DE",
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Aktualisiert:
                </span>
                <span className="text-sm font-medium">
                  {new Date(investigation.updated_at).toLocaleDateString(
                    "de-DE",
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Priorität:
                </span>
                <span className="text-sm font-medium capitalize">
                  {investigation.priority}
                </span>
              </div>
            </div>

            {stats?.trends && (
              <div className="rounded-lg border p-3">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Trends</span>
                </div>
                <p className="text-sm text-muted-foreground">{stats.trends}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Historie Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Änderungshistorie
            </DialogTitle>
            <DialogDescription>
              Alle Änderungen an {investigation.title}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 space-y-3 overflow-y-auto">
            {history && history.length > 0 ? (
              history.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex-shrink-0">
                    <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString("de-DE")}
                    </p>
                    {entry.details && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {entry.details}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <History className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>Keine Änderungshistorie verfügbar</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Erweiterte Exporte
            </DialogTitle>
            <DialogDescription>
              Wählen Sie ein Export-Format für {investigation.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExportJSON}
            >
              <FileText className="mr-2 h-4 w-4" />
              Als JSON (Vollständige Daten)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExportImages}
            >
              <Image className="mr-2 h-4 w-4" />
              Bilder als ZIP-Archiv
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const url = `/api/export/fahndung/${investigation.id}?format=pdf`;
                window.open(url, "_blank");
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Als PDF (Druckversion)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const url = `/api/export/fahndung/${investigation.id}?format=csv`;
                window.open(url, "_blank");
              }}
            >
              <Database className="mr-2 h-4 w-4" />
              Als CSV (Tabellendaten)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
