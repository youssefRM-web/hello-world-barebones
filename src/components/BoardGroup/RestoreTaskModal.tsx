import React, { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  X,
  RotateCcw,
  Loader2,
  AlertTriangle,
  Package,
  DoorClosed,
  Building as BuildingIcon,
  Link2Off,
  CheckCircle,
} from "lucide-react";
import { apiService, endpoints } from "@/services/api";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AcceptedTasks, Space, Asset } from "@/types";
import { TASKS_QUERY_KEY } from "@/hooks/queries/useTasksQuery";

interface RestoreTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  task: AcceptedTasks | null;
}

interface DependencyStatus {
  buildingArchived: boolean;
  buildingName: string;
  buildingDeleted: boolean;
  spaceArchived: boolean;
  spaceName: string;
  spaceDeleted: boolean;
  assetArchived: boolean;
  assetName: string;
  assetDeleted: boolean;
  linkedType: "Asset" | "Space" | null;
  isAlreadyActive: boolean;
}

const initialDependencyStatus: DependencyStatus = {
  buildingArchived: false,
  buildingName: "",
  buildingDeleted: false,
  spaceArchived: false,
  spaceName: "",
  spaceDeleted: false,
  assetArchived: false,
  assetName: "",
  assetDeleted: false,
  linkedType: null,
  isAlreadyActive: false,
};

const RestoreTaskModal = ({
  isOpen,
  onClose,
  onSuccess,
  task,
}: RestoreTaskModalProps) => {
  const { buildings, spaces, refreshAssets, refreshSpaces } = useReferenceData();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [isRestoring, setIsRestoring] = useState(false);
  const [isCheckingDependencies, setIsCheckingDependencies] = useState(false);
  const [dependencyStatus, setDependencyStatus] = useState<DependencyStatus>(initialDependencyStatus);

  // Check dependencies when modal opens
  useEffect(() => {
    if (isOpen && task) {
      checkDependencies();
    }
    if (!isOpen) {
      setDependencyStatus(initialDependencyStatus);
    }
  }, [isOpen, task, buildings, spaces]);

  const checkDependencies = async () => {
    if (!task) return;

    setIsCheckingDependencies(true);
    try {
      // Edge case: Task is already active
      if (!task.archived) {
        setDependencyStatus({
          ...initialDependencyStatus,
          isAlreadyActive: true,
        });
        setIsCheckingDependencies(false);
        return;
      }

      const linkedTo = task.Linked_To;
      const linkedToModel = task.Linked_To_Model;

      let buildingId = "";
      let buildingArchived = false;
      let buildingName = "";
      let buildingDeleted = false;
      let spaceArchived = false;
      let spaceName = "";
      let spaceDeleted = false;
      let assetArchived = false;
      let assetName = "";
      let assetDeleted = false;

      if (linkedTo) {
        // Get building ID from the linked entity
        if (typeof linkedTo.building_id === "object" && linkedTo.building_id?._id) {
          buildingId = linkedTo.building_id._id;
        } else if (typeof linkedTo.building_id === "string") {
          buildingId = linkedTo.building_id;
        }

        // Check building status
        const building = buildings.find((b) => b._id === buildingId);
        if (building) {
          buildingArchived = building.archived;
          buildingName = building.label;
        } else if (buildingId) {
          // Building might have been deleted
          buildingDeleted = true;
        }

        if (linkedToModel === "Asset") {
          // Task is linked to an asset - Hierarchy: Building → Space → Asset → Task
          assetName = linkedTo.name || "";

          // Check if asset exists and its archived status
          try {
            const assetResponse = await apiService.get<Asset>(
              `${endpoints.assets}/${linkedTo._id}`
            );
            if (assetResponse.data) {
              assetArchived = assetResponse.data.archived || false;
              assetName = assetResponse.data.name || assetName;

              // If asset has a linked space, check if that space is archived
              const linkedSpaceId = linkedTo.linked_space_id || assetResponse.data?.linked_space_id;
              if (linkedSpaceId) {
                const spaceId = typeof linkedSpaceId === "object" 
                  ? (linkedSpaceId as any)?._id 
                  : linkedSpaceId;
                
                const space = spaces.find((s) => s._id === spaceId);
                if (space) {
                  spaceArchived = space.archived;
                  spaceName = space.name || space.label || "";
                } else if (spaceId) {
                  // Try to fetch space from API
                  try {
                    const spaceResponse = await apiService.get<Space>(
                      `${endpoints.spaces}/${spaceId}`
                    );
                    if (spaceResponse.data) {
                      spaceArchived = spaceResponse.data.archived || false;
                      spaceName = spaceResponse.data.name || "";
                    } else {
                      spaceDeleted = true;
                    }
                  } catch {
                    spaceDeleted = true;
                  }
                }
              }
            } else {
              assetDeleted = true;
            }
          } catch {
            assetDeleted = true;
          }
        } else if (linkedToModel === "Space") {
          // Task is linked to a space - Hierarchy: Building → Space → Task
          spaceName = linkedTo.name || "";

          // Check if space exists and its archived status
          const space = spaces.find((s) => s._id === linkedTo._id);
          if (space) {
            spaceArchived = space.archived;
            spaceName = space.name || space.label || "";
          } else {
            try {
              const spaceResponse = await apiService.get<Space>(
                `${endpoints.spaces}/${linkedTo._id}`
              );
              if (spaceResponse.data) {
                spaceArchived = spaceResponse.data.archived || false;
                spaceName = spaceResponse.data.name || "";
              } else {
                spaceDeleted = true;
              }
            } catch {
              spaceDeleted = true;
            }
          }
        }
      } else {
        // Task not linked to anything, check Building_id directly
        buildingId =
          typeof task.Building_id === "string"
            ? task.Building_id
            : task.Building_id?._id || "";
        if (buildingId) {
          const building = buildings.find((b) => b._id === buildingId);
          if (building) {
            buildingArchived = building.archived;
            buildingName = building.label;
          } else {
            buildingDeleted = true;
          }
        }
      }

      setDependencyStatus({
        buildingArchived,
        buildingName,
        buildingDeleted,
        spaceArchived,
        spaceName,
        spaceDeleted,
        assetArchived,
        assetName,
        assetDeleted,
        linkedType: linkedToModel || null,
        isAlreadyActive: false,
      });
    } catch (error) {
      console.error("Failed to check dependencies:", error);
    } finally {
      setIsCheckingDependencies(false);
    }
  };

  const canRestore = () => {
    // Edge case: Task already active
    if (dependencyStatus.isAlreadyActive) return false;
    
    // Edge case: Linked entity was deleted
    if (dependencyStatus.assetDeleted || dependencyStatus.spaceDeleted || dependencyStatus.buildingDeleted) {
      return false;
    }
    
    // Validation order: Asset → Space → Building (reversed for checking from child to parent)
    if (dependencyStatus.linkedType === "Asset") {
      // Check Asset first (closest parent)
      if (dependencyStatus.assetArchived) return false;
      // Then check Space
      if (dependencyStatus.spaceArchived) return false;
    } else if (dependencyStatus.linkedType === "Space") {
      // Check Space first
      if (dependencyStatus.spaceArchived) return false;
    }
    // Finally check Building (root parent)
    if (dependencyStatus.buildingArchived) return false;
    
    return true;
  };

  const getBlockingMessage = (): { title: string; message: string; icon: React.ElementType } | null => {
    // Edge case: Task already active
    if (dependencyStatus.isAlreadyActive) {
       return {
         title: t("board.alreadyActive"),
         message: t("board.taskAlreadyActive"),
         icon: CheckCircle,
      };
    }

    // Edge case: Linked entity was deleted
    if (dependencyStatus.assetDeleted) {
       return {
         title: t("board.linkedEntityRemoved"),
         message: t("board.linkedToRemovedAsset"),
         icon: Link2Off,
      };
    }
    if (dependencyStatus.spaceDeleted) {
       return {
         title: t("board.linkedEntityRemoved"),
         message: t("board.linkedToRemovedSpace"),
         icon: Link2Off,
      };
    }
    if (dependencyStatus.buildingDeleted) {
       return {
         title: t("board.linkedEntityRemoved"),
         message: t("board.linkedToRemovedBuilding"),
         icon: Link2Off,
      };
    }

    // Validation order per requirements: Asset → Space → Building
    if (dependencyStatus.linkedType === "Asset") {
      // Check Asset first
      if (dependencyStatus.assetArchived) {
         return {
           title: t("board.assetIsArchived"),
           message: `${t("board.restoreAssetFirst")} "${dependencyStatus.assetName}" ${t("board.beforeRestoringTask")}`,
           icon: Package,
        };
      }
      // Then Space
      if (dependencyStatus.spaceArchived) {
         return {
           title: t("board.spaceIsArchived"),
           message: `${t("board.restoreSpaceFirst")} "${dependencyStatus.spaceName}" ${t("board.beforeRestoringTask")}`,
           icon: DoorClosed,
        };
      }
    } else if (dependencyStatus.linkedType === "Space") {
      // Check Space first
      if (dependencyStatus.spaceArchived) {
         return {
           title: t("board.spaceIsArchived"),
           message: `${t("board.restoreSpaceFirst")} "${dependencyStatus.spaceName}" ${t("board.beforeRestoringTask")}`,
           icon: DoorClosed,
        };
      }
    }

    // Finally Building
    if (dependencyStatus.buildingArchived) {
       return {
         title: t("board.buildingIsArchived"),
         message: `${t("board.restoreBuildingFirstRestore")} "${dependencyStatus.buildingName}" ${t("board.beforeRestoringTask")}`,
         icon: BuildingIcon,
      };
    }

    return null;
  };

  const handleRestore = async () => {
    if (!task?._id) return;

    if (!canRestore()) {
      const blocking = getBlockingMessage();
      if (blocking) {
        toast({
          title: blocking.title,
          description: blocking.message,
          variant: "destructive",
        });
      }
      return;
    }

    setIsRestoring(true);
    try {
      await apiService.patch(`${endpoints.acceptedTasks}/${task._id}`, {
        archived: false,
      });

      onClose();
      onSuccess?.();
       toast({
         title: t("board.title"),
         description: `${t("board.restoreTask")} "${task.issue_summary}" ${t("board.restoredSuccessfully")}`,
        variant: "success",
      });

      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      await refreshAssets();
      await refreshSpaces();
    } catch (error) {
      toast({
        title: t("common.error"),
        description: t("board.failedToRestoreTask"),
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const blockingInfo = getBlockingMessage();
  const isBlocked = !canRestore();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <button
            onClick={onClose}
            className="rounded-sm self-end ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
          <AlertDialogTitle className="flex items-center justify-center gap-2">
            <RotateCcw className="h-5 w-5 text-primary" />
             {t("board.restoreTaskTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
             {isCheckingDependencies ? (
               <span>{t("board.checkingDependencies")}</span>
            ) : isBlocked ? null : (
              <p>
                {t("board.restoreConfirmMessage")}{" "}
                <strong>"{task?.issue_summary}"</strong>?
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isCheckingDependencies ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
             <span className="ml-2 text-sm text-muted-foreground">
               {t("board.checkingParentEntities")}
            </span>
          </div>
        ) : isBlocked && blockingInfo ? (
          <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">{blockingInfo.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {blockingInfo.message}
            </p>
          </div>
        ) : (
          <>
            {/* Show linked entity info */}
            {dependencyStatus.linkedType && (
              <div className="p-3 bg-muted/50 rounded-lg text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {dependencyStatus.linkedType === "Asset" ? (
                    <>
                      <Package className="h-4 w-4" />
                       <span>
                         {t("board.linkedToText")} {t("board.asset")}:{" "}
                         <strong>{dependencyStatus.assetName}</strong>
                      </span>
                    </>
                  ) : (
                    <>
                      <DoorClosed className="h-4 w-4" />
                       <span>
                         {t("board.linkedToText")} {t("board.space")}:{" "}
                         <strong>{dependencyStatus.spaceName}</strong>
                      </span>
                    </>
                  )}
                </div>
                {dependencyStatus.buildingName && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <BuildingIcon className="h-4 w-4" />
                     <span>
                       {t("board.buildingLabel")}: <strong>{dependencyStatus.buildingName}</strong>
                     </span>
                  </div>
                )}
              </div>
            )}

             <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
               <strong>{t("board.note")}:</strong> {t("board.restoreNote")}
             </div>
          </>
        )}

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full">
            {isBlocked ? t("board.close") : t("board.cancel")}
          </Button>
          {!isBlocked && !isCheckingDependencies && (
            <Button
              onClick={handleRestore}
              disabled={isRestoring}
              className="w-full"
            >
              {isRestoring ? (
                 <span className="flex items-center gap-2">
                   <Loader2 className="h-4 w-4 animate-spin" />
                   {t("board.restoring")}
                </span>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t("board.restoreTaskTitle")}
                </>
              )}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RestoreTaskModal;