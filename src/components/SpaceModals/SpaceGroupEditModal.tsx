import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGroupsQuery } from "@/hooks/queries";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";

const SpaceGroupEditModal = ({
  isOpen,
  onClose,
  currentGroup,
  onSave,
  spaceId,
}) => {
  const { data: allGroups = [] } = useGroupsQuery();
  const { refreshSpaces } = useReferenceData();
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState(currentGroup || "");
  const { t } = useLanguage();

  const groups = allGroups.filter(
    (group) =>
      group._id === currentGroup ||
      !group.spaces?.some((space: any) => space._id === spaceId),
  );

  const handleSave = async () => {
    try {
      await apiService.patch(`/space/${spaceId}`, {
        spaceGroup: selectedGroup || null,
      });
      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      toast.success(t("spaces.title"), {
        description: t("spaces.spaceGroupUpdated"),
      });
      onSave(selectedGroup);
      refreshSpaces();
      onClose();
    } catch (error) {
      console.error("Error updating space group:", error);
      toast.error(t("common.error"), {
        description: t("spaces.failedUpdateSpaceGroup"),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("spaces.editSpaceGroup")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              {t("spaces.selectSpaceGroupLabel")}
            </Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="mt-2 h-10">
                <SelectValue placeholder={t("spaces.noSpaceGroup")} />
              </SelectTrigger>
              <SelectContent>
                {groups.length == 0 && (
                  <SelectItem value="none" disabled>
                    {t("spaces.noSpaceGroup")}
                  </SelectItem>
                )}
                {groups
                  .filter((g) => g.belongTo === "spaces")
                  .map((group) => (
                    <SelectItem key={group._id} value={group._id}>
                      {group.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              {t("spaces.cancel")}
            </Button>
            <Button onClick={handleSave}>{t("spaces.save")}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpaceGroupEditModal;
