import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, DoorClosed, Plus, Trash2 } from "lucide-react";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useGroupsQuery } from "@/hooks/queries";
import { apiService, endpoints } from "@/services/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface LinkedSpacesModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  spaces: any[];
}

const LinkedSpacesModal = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  spaces,
}: LinkedSpacesModalProps) => {
  const { spaces: allSpaces, refreshData } = useReferenceData();
  const { data: groups = [] } = useGroupsQuery();
  const [isAddSpaceModalOpen, setIsAddSpaceModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [removingSpaceId, setRemovingSpaceId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const assignedSpaceIds = new Set(
    groups.flatMap((group: any) =>
      (group.spaces || []).map((space: any) =>
        typeof space === "string" ? space : space._id
      )
    )
  );

  const unassignedSpaces = allSpaces.filter(
    (space: any) => !assignedSpaceIds.has(space._id)
  );

  const handleAddSpace = async (spaceId: string) => {
    setIsAdding(true);
    try {
      await apiService.put(`${endpoints.groups}/${groupId}`, {
        spaces: [...spaces.map((s) => s._id), spaceId],
      });
      toast.success(t("spaces.title"), { description: t("spaces.spaceAddedToGroup") });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      refreshData();
      setIsAddSpaceModalOpen(false);
    } catch (error) {
      toast.error(t("common.error"), { description: t("spaces.failedAddToGroup") });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveSpace = async (spaceId: string) => {
    setRemovingSpaceId(spaceId);
    try {
      await apiService.put(`${endpoints.groups}/${groupId}`, {
        spaces: spaces.filter((s) => s._id !== spaceId).map((s) => s._id),
      });
      toast.success(t("spaces.title"), { description: t("spaces.spaceRemovedFromGroup") });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      refreshData();
    } catch (error) {
      console.error("Error removing space from group:", error);
      toast.error(t("common.error"), { description: t("spaces.failedRemoveFromGroup") });
    } finally {
      setRemovingSpaceId(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="relative border-b pb-4">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0" onClick={onClose}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex items-center justify-center">
                <svg className="w-6 h-6" fill="#4D81ED" xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                  <path d="M10 3H4C3.447 3 3 3.447 3 4v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1V4C11 3.447 10.553 3 10 3zM9 9H5V5h4V9zM20 3h-6c-.553 0-1 .447-1 1v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1V4C21 3.447 20.553 3 20 3zM19 9h-4V5h4V9zM10 13H4c-.553 0-1 .447-1 1v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1v-6C11 13.447 10.553 13 10 13zM9 19H5v-4h4V19zM17 13c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4S19.206 13 17 13zM17 19c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2S18.103 19 17 19z" />
                </svg>
              </div>
              <DialogTitle className="text-lg font-semibold text-foreground">{groupName}</DialogTitle>
            </div>
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-6 w-6 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-foreground">{t("spaces.linkedSpaces")}</h3>
                <div className="flex items-center justify-center px-2 py-1">
                  <span style={{ fontSize: 10, border: "1px solid", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    {spaces.length}
                  </span>
                </div>
              </div>
              <Button size="sm" onClick={() => setIsAddSpaceModalOpen(true)} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                {t("spaces.addSpace2")}
              </Button>
            </div>

            {spaces.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground italic text-sm">{t("spaces.noSpacesInGroup")}</div>
            ) : (
              <div className="space-y-3">
                {spaces.map((space) => (
                  <div key={space._id} className="p-3 border rounded-lg hover:bg-accent/50">
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0">
                        <DoorClosed className="w-5 h-5" color="#4D81ED" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{space.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {space.building_id?.label || space.building_id?.name || "N/A"} • {space.area_id?.label || space.area_id?.name || "N/A"}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveSpace(space._id)} disabled={removingSpaceId === space._id}>
                        {removingSpaceId === space._id ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddSpaceModalOpen} onOpenChange={setIsAddSpaceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("spaces.addSpaceTo").replace("{group}", groupName)}</DialogTitle>
          </DialogHeader>

          {unassignedSpaces.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground italic text-sm">{t("spaces.noSpacesAvailableToAssign")}</div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {unassignedSpaces.map((space: any) => (
                <div key={space._id} className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors" onClick={() => handleAddSpace(space._id)}>
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0">
                      <DoorClosed className="w-5 h-5" color="#4D81ED" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{space.name}</div>
                      <div className="text-xs text-muted-foreground">{space.building_id?.label || "N/A"} • {space.area?.label || "N/A"}</div>
                    </div>
                    {isAdding && <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsAddSpaceModalOpen(false)}>{t("spaces.close")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LinkedSpacesModal;
