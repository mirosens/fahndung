"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Eye,
  Trash2,
  Share2,
  Copy,
  Download,
  FileCopy,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Flag,
} from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "~/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { toast } from "~/lib/toast";

interface Investigation {
  id: string;
  title: string;
  case_number: string;
  status: string;
  priority: "normal" | "urgent" | "new";
}

interface BulkActionsProps {
  selectedInvestigations: Investigation[];
  onAction?: () => void;
  onClearSelection?: () => void;
  userPermissions?: {
    canEdit: boolean;
    canDelete: boolean;
    canPublish: boolean;
  };
}

export default function BulkActions({
  selectedInvestigations,
  onAction,
  onClearSelection,
  userPermissions,
}: BulkActionsProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const canEdit = userPermissions?.canEdit ?? true;
  const canDelete = userPermissions?.canDelete ?? true;
  const canPublish = userPermissions?.canPublish ?? true;

  // tRPC Mutations
  const deleteMutation = api.post.deleteInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndungen erfolgreich gelöscht");
      onAction?.();
      onClearSelection?.();
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Fahndungen");
    },
  });

  const publishMutation = api.post.publishInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndungen erfolgreich veröffentlicht");
      onAction?.();
    },
    onError: () => {
      toast.error("Fehler beim Veröffentlichen der Fahndungen");
    },
  });

  const archiveMutation = api.post.archiveInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndungen erfolgreich archiviert");
      onAction?.();
    },
    onError: () => {
      toast.error("Fehler beim Archivieren der Fahndungen");
    },
  });

  const updatePriorityMutation = api.post.updateInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Priorität erfolgreich geändert");
      onAction?.();
    },
    onError: () => {
      toast.error("Fehler beim Ändern der Priorität");
    },
  });

  const duplicateMutation = api.post.duplicateInvestigation.useMutation({
    onSuccess: () => {
      toast.success("Fahndungen erfolgreich dupliziert");
      onAction?.();
    },
    onError: () => {
      toast.error("Fehler beim Duplizieren der Fahndungen");
    },
  });

  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      const promises = selectedInvestigations.map((investigation) =>
        deleteMutation.mutateAsync({ id: investigation.id }),
      );
      await Promise.all(promises);
      toast.success(
        `${selectedInvestigations.length} Fahndungen erfolgreich gelöscht`,
      );
      onClearSelection?.();
    } catch (error) {
      console.error("Fehler beim Bulk-Löschen:", error);
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleBulkPublish = async () => {
    setIsLoading(true);
    try {
      const promises = selectedInvestigations.map((investigation) =>
        publishMutation.mutateAsync({ id: investigation.id, publish: true }),
      );
      await Promise.all(promises);
      toast.success(
        `${selectedInvestigations.length} Fahndungen erfolgreich veröffentlicht`,
      );
    } catch (error) {
      console.error("Fehler beim Bulk-Veröffentlichen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    setIsLoading(true);
    try {
      const promises = selectedInvestigations.map((investigation) =>
        archiveMutation.mutateAsync({ id: investigation.id, archive: true }),
      );
      await Promise.all(promises);
      toast.success(
        `${selectedInvestigations.length} Fahndungen erfolgreich archiviert`,
      );
    } catch (error) {
      console.error("Fehler beim Bulk-Archivieren:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkPriorityChange = async (
    priority: "normal" | "urgent" | "new",
  ) => {
    setIsLoading(true);
    try {
      const promises = selectedInvestigations.map((investigation) =>
        updatePriorityMutation.mutateAsync({
          id: investigation.id,
          priority,
        }),
      );
      await Promise.all(promises);
      toast.success(
        `Priorität für ${selectedInvestigations.length} Fahndungen geändert`,
      );
    } catch (error) {
      console.error("Fehler beim Bulk-Priorität-Ändern:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDuplicate = async () => {
    setIsLoading(true);
    try {
      const promises = selectedInvestigations.map((investigation) =>
        duplicateMutation.mutateAsync({ id: investigation.id }),
      );
      await Promise.all(promises);
      toast.success(
        `${selectedInvestigations.length} Fahndungen erfolgreich dupliziert`,
      );
    } catch (error) {
      console.error("Fehler beim Bulk-Duplizieren:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkExport = async () => {
    try {
      // Öffne mehrere Tabs für den Export
      selectedInvestigations.forEach((investigation) => {
        const exportUrl = `/api/export/fahndung/${investigation.id}`;
        window.open(exportUrl, "_blank");
      });
      toast.success(
        `Export für ${selectedInvestigations.length} Fahndungen gestartet`,
      );
    } catch (error) {
      console.error("Fehler beim Bulk-Export:", error);
      toast.error("Fehler beim Exportieren");
    }
  };

  const handleBulkShare = async () => {
    try {
      const urls = selectedInvestigations.map(
        (investigation) =>
          `${window.location.origin}/fahndungen/${investigation.case_number}`,
      );

      if (navigator.share) {
        await navigator.share({
          title: "Fahndungen teilen",
          text: `${selectedInvestigations.length} Fahndungen`,
          url: urls.join("\n"),
        });
      } else {
        // Fallback: Kopiere URLs in Zwischenablage
        await navigator.clipboard.writeText(urls.join("\n"));
        toast.success("Links in Zwischenablage kopiert");
      }
    } catch (error) {
      console.error("Fehler beim Bulk-Share:", error);
      toast.error("Fehler beim Teilen");
    }
  };

  if (selectedInvestigations.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            {selectedInvestigations.length} Fahndung
            {selectedInvestigations.length !== 1 ? "en" : ""} ausgewählt
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Auswahl aufheben
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <Flag className="mr-2 h-4 w-4" />
                Priorität ändern
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => handleBulkPriorityChange("normal")}
              >
                <Star className="mr-2 h-4 w-4" />
                Normal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleBulkPriorityChange("urgent")}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Dringend
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkPriorityChange("new")}>
                <Clock className="mr-2 h-4 w-4" />
                Neu
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {canPublish && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkPublish}
              disabled={isLoading}
              className="border-green-200 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800"
            >
              <Eye className="mr-2 h-4 w-4" />
              Veröffentlichen
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkArchive}
            disabled={isLoading}
            className="border-orange-200 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300 dark:hover:bg-orange-800"
          >
            <Archive className="mr-2 h-4 w-4" />
            Archivieren
          </Button>

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDuplicate}
              disabled={isLoading}
              className="border-purple-200 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-300 dark:hover:bg-purple-800"
            >
              <FileCopy className="mr-2 h-4 w-4" />
              Duplizieren
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkExport}
            disabled={isLoading}
            className="border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-800"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportieren
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkShare}
            disabled={isLoading}
            className="border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Teilen
          </Button>

          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isLoading}
              className="border-red-200 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-800"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Löschen
            </Button>
          )}
        </div>
      </div>

      {/* Bulk-Lösch-Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Fahndungen löschen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie {selectedInvestigations.length} Fahndung
              {selectedInvestigations.length !== 1 ? "en" : ""} löschen möchten?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Lösche..." : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
