import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  Trash2,
  Archive,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Package,
  DoorClosed,
  Building as BuildingIcon,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AcceptedTasks } from "@/types";
import { useDeleteTaskMutation, useArchiveTaskMutation } from "@/hooks/queries";
import { apiService, endpoints } from "@/services/api";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: AcceptedTasks;
  onTaskDeleted: () => void;
}

type ActionMode = "choose" | "archive" | "delete";

export function DeleteTaskModal({
  isOpen,
  onClose,
  task,
  onTaskDeleted,
}: DeleteTaskModalProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { buildings, refreshAssets, refreshSpaces } = useReferenceData();
  const deleteTaskMutation = useDeleteTaskMutation();
  const archiveTaskMutation = useArchiveTaskMutation();

  const [actionMode, setActionMode] = useState<ActionMode>("choose");
  const [isCheckingDependencies, setIsCheckingDependencies] = useState(false);
  const [isBuildingArchived, setIsBuildingArchived] = useState(false);
  const [buildingName, setBuildingName] = useState("");
  const [linkedEntityInfo, setLinkedEntityInfo] = useState<{
    type: "Asset" | "Space" | null;
    name: string;
    buildingId: string;
  }>({ type: null, name: "", buildingId: "" });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setActionMode("choose");
      checkDependencies();
    } else {
      setIsBuildingArchived(false);
      setBuildingName("");
      setLinkedEntityInfo({ type: null, name: "", buildingId: "" });
    }
  }, [isOpen, task]);

  const checkDependencies = async () => {
    setIsCheckingDependencies(true);
    try {
      // Get the linked entity info
      const linkedTo = task.Linked_To;
      const linkedToModel = task.Linked_To_Model;

      if (linkedTo) {
        // Get building ID from the linked entity
        let buildingId = "";
        if (
          typeof linkedTo.building_id === "object" &&
          linkedTo.building_id?._id
        ) {
          buildingId = linkedTo.building_id._id;
        } else if (typeof linkedTo.building_id === "string") {
          buildingId = linkedTo.building_id;
        }

        setLinkedEntityInfo({
          type: linkedToModel || null,
          name: linkedTo.name || "",
          buildingId,
        });

        // Check if the building is archived
        const building = buildings.find((b) => b._id === buildingId);
        if (building) {
          setIsBuildingArchived(building.archived);
          setBuildingName(building.label);
        }
      } else {
        // Task not linked to anything, check Building_id directly
        const buildingId = task.Building_id;
        if (buildingId) {
          const building = buildings.find((b) => b._id === buildingId);
          if (building) {
            setIsBuildingArchived(building.archived);
            setBuildingName(building.label);
          }
        }
      }
    } catch (error) {
      console.error("Failed to check dependencies:", error);
    } finally {
      setIsCheckingDependencies(false);
    }
  };

  const handleArchive = async () => {
    if (!task._id) return;

    // Block if building is archived
    if (isBuildingArchived) {
      toast({
        title: t("board.cannotArchiveTask"),
        description: `${t("board.belongsToArchivedBuilding")} "${buildingName}". ${t("board.restoreBuildingFirst")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await archiveTaskMutation.mutateAsync({
        taskId: task._id,
        archived: true,
      });
      onClose();
      onTaskDeleted();
      await refreshAssets();
      await refreshSpaces();
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleDelete = async () => {
    if (!task._id) return;

    // Block if building is archived
    if (isBuildingArchived) {
      toast({
        title: t("board.cannotDeleteTask"),
        description: `${t("board.belongsToArchivedBuilding")} "${buildingName}". ${t("board.restoreBuildingFirst")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      await deleteTaskMutation.mutateAsync(task._id);
      onClose();
      onTaskDeleted();
      await refreshAssets();
      await refreshSpaces();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const isProcessing =
    deleteTaskMutation.isPending || archiveTaskMutation.isPending;

  // Render building archived warning
  const renderBuildingArchivedWarning = () => (
    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
      <div className="flex items-center gap-2 text-destructive mb-2">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">{t("board.actionBlocked")}</span>
      </div>
      <p className="text-sm text-muted-foreground">
        {t("board.belongsToArchivedBuilding")} <strong>"{buildingName}"</strong>
        .
        {actionMode === "archive"
          ? t("board.restoreBuildingFirst")
          : t("board.restoreBuildingFirst")}
      </p>
    </div>
  );

  // Render initial choice screen
  const renderChoiceScreen = () => (
    <>
      <AlertDialogHeader>
        <button
          onClick={onClose}
          className="rounded-sm self-end ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <AlertDialogTitle className="flex items-center justify-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          {t("board.deleteOrArchiveTask")}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-center">
          <p className="mb-4">
            {t("board.whatToDo")} <strong>"{task.issue_summary}"</strong>?
          </p>
        </AlertDialogDescription>
      </AlertDialogHeader>

      {isCheckingDependencies ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            {t("board.checkingDependencies")}
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Linked entity info */}
          {linkedEntityInfo.type && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                {linkedEntityInfo.type === "Asset" ? (
                  <Package className="h-4 w-4" />
                ) : (
                  <DoorClosed className="h-4 w-4" />
                )}
                <span>
                  {t("board.linkedToText")} {linkedEntityInfo.type}:{" "}
                  <strong>{linkedEntityInfo.name}</strong>
                </span>
              </div>
              {buildingName && (
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <BuildingIcon className="h-4 w-4" />
                  <span>
                    {t("board.buildingLabel")}: <strong>{buildingName}</strong>
                  </span>
                  {isBuildingArchived && (
                    <span className="text-xs text-destructive">
                      ({t("board.archived")})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Archive Option */}
          <button
            onClick={() => setActionMode("archive")}
            className="w-full p-4 border rounded-lg hover:bg-accent/50 transition-colors text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Archive className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground group-hover:text-primary">
                  {t("board.archiveTaskOption")}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("board.archiveTaskDescription")}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary mt-2" />
            </div>
          </button>

          {/* Delete Option */}
          <button
            onClick={() => setActionMode("delete")}
            className="w-full p-4 border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors text-left group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-destructive">
                  {t("board.deletePermanently")}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("board.deleteTaskDescription")}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-destructive mt-2" />
            </div>
          </button>
        </div>
      )}

      <AlertDialogFooter className="mt-4">
        <AlertDialogCancel className="w-full">
          {t("common.cancel")}
        </AlertDialogCancel>
      </AlertDialogFooter>
    </>
  );

  // Render archive confirmation screen
  const renderArchiveScreen = () => (
    <>
      <AlertDialogHeader>
        <button
          onClick={() => setActionMode("choose")}
          className="rounded-sm self-end ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <AlertDialogTitle className="flex items-center justify-center gap-2">
          <Archive className="h-5 w-5 text-orange-600" />
          {t("board.archiveConfirmTitle")}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-center">
          {isBuildingArchived ? null : (
            <p>
              {t("board.archiveConfirmMessage")}{" "}
              <strong>"{task.issue_summary}"</strong>?
            </p>
          )}
        </AlertDialogDescription>
      </AlertDialogHeader>

      {isBuildingArchived ? (
        renderBuildingArchivedWarning()
      ) : (
        <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
          <strong>{t("board.note")}:</strong> {t("board.archiveNote")}
        </div>
      )}

      <AlertDialogFooter>
        <Button
          variant="outline"
          onClick={() => setActionMode("choose")}
          className="w-full"
        >
          {t("board.back")}
        </Button>
        {!isBuildingArchived && (
          <Button
            onClick={handleArchive}
            disabled={isProcessing}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          >
            {archiveTaskMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("board.archiving")}
              </span>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                {t("board.archiveConfirmTitle")}
              </>
            )}
          </Button>
        )}
      </AlertDialogFooter>
    </>
  );

  // Render delete confirmation screen
  const renderDeleteScreen = () => (
    <>
      <AlertDialogHeader>
        <button
          onClick={() => setActionMode("choose")}
          className="rounded-sm self-end ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        <AlertDialogTitle className="flex items-center justify-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          {t("board.deleteConfirmTitle")}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-center">
          {isBuildingArchived ? null : (
            <p>
              Are you sure you want to permanently delete this task? This action
              cannot be undone.
            </p>
          )}
        </AlertDialogDescription>
      </AlertDialogHeader>

      {isBuildingArchived ? (
        renderBuildingArchivedWarning()
      ) : (
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 text-sm">
          <p className="text-muted-foreground">
            <strong>{t("board.warning")}:</strong> {t("board.deleteWarning")}
          </p>
        </div>
      )}

      <AlertDialogFooter>
        <Button
          variant="outline"
          onClick={() => setActionMode("choose")}
          className="w-full"
        >
          {t("board.back")}
        </Button>
        {!isBuildingArchived && (
          <Button
            onClick={handleDelete}
            disabled={isProcessing}
            className="w-full bg-destructive text-white hover:bg-destructive/90"
          >
            {deleteTaskMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("board.deleting")}
              </span>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                {t("board.deletePermanently")}
              </>
            )}
          </Button>
        )}
      </AlertDialogFooter>
    </>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        {actionMode === "choose" && renderChoiceScreen()}
        {actionMode === "archive" && renderArchiveScreen()}
        {actionMode === "delete" && renderDeleteScreen()}
      </AlertDialogContent>
    </AlertDialog>
  );
}
