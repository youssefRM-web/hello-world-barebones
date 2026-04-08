import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Trash2, ChevronRight, Printer, Menu, Edit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useGroupsQuery } from "@/hooks/queries";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import DeleteAssetGroupModal from "./DeleteAssetGroupModal";
import LinkedTasksModal from "./LinkedTasksModal";
import LinkedAssetsModal from "./LinkedAssetsModal";
import { useQueryClient } from "@tanstack/react-query";

interface AssetGroupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string | null;
}

const AssetGroupDetailsModal = ({
  isOpen,
  onClose,
  groupId,
}: AssetGroupDetailsModalProps) => {
  const { data: groups } = useGroupsQuery();
  const { acceptedTasks, refreshData } = useReferenceData();
  const { t } = useLanguage();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLinkedTasksModalOpen, setIsLinkedTasksModalOpen] = useState(false);
  const [isLinkedAssetsModalOpen, setIsLinkedAssetsModalOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const queryClient = useQueryClient();

  const group = groups?.find((g) => g._id === groupId);

  useEffect(() => {
    if (group?.name) {
      setEditedName(group.name);
    }
  }, [group]);

  if (!group) return null;

  const groupAssets = group.assets || [];
  const groupTasks = groupAssets.flatMap((a: any) => a.linkedTasks || []);

  const handleDelete = () => {
    setIsDeleteModalOpen(false);
    onClose();
  };

  const handleSaveName = async () => {
    if (!group?._id || !editedName.trim()) return;

    try {
      await apiService.put(`/groups/${group._id}`, {
        name: editedName.trim(),
      });

      setIsEditingName(false);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      // refreshData();
      toast({
        title: t("assets.title"),
        description: t("assets.groupNameUpdated"),
        variant: "success",
      });
    } catch (error: any) {
      console.error("Error updating group:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || t("assets.failedUpdateGroupName"),
        variant: "destructive",
      });
    }
  };

  const CountBadge = ({ count }: { count: number }) => (
    <span
      className={`ml-1.5 px-1.5 min-w-[20px] h-5 text-xs font-medium rounded-full inline-flex items-center justify-center bg-muted text-muted-foreground border border-border`}
    >
      {count}
    </span>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-xl p-0 transition-none">
          <DialogHeader className="space-y-2 py-2 px-5 border-b bg-accent/50">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-1">
                <div className="text-sm text-foreground">
                  {/* Asset Group details */}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-[#DE3B40FF]"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2 className="h-6 w-6" color="#DE3B40FF" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex items-center gap-3 pb-3 px-6 group">
              <div className="w-8 h-8 bg-[#F1F5FE] rounded flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="#4D81ED"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                >
                  <path d="M10 3H4C3.447 3 3 3.447 3 4v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1V4C11 3.447 10.553 3 10 3zM9 9H5V5h4V9zM20 3h-6c-.553 0-1 .447-1 1v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1V4C21 3.447 20.553 3 20 3zM19 9h-4V5h4V9zM10 13H4c-.553 0-1 .447-1 1v6c0 .553.447 1 1 1h6c.553 0 1-.447 1-1v-6C11 13.447 10.553 13 10 13zM9 19H5v-4h4V19zM17 13c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4S19.206 13 17 13zM17 19c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2S18.103 19 17 19z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium first-letter:uppercase">
                    {editedName}
                  </div>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="transition-opacity"
                  >
                    <Edit
                      className="h-4 w-4 cursor-pointer"
                      color="#9095A0FF"
                    />
                  </button>
                </div>
              </div>

              {/* Floating Edit Modal */}
              {isEditingName && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                  <div
                    className="absolute inset-0 bg-black/20"
                    onClick={() => setIsEditingName(false)}
                  />
                  <div className="relative bg-background rounded-lg shadow-2xl border p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                    <Label className="text-sm font-medium">
                      {t("assets.editGroupName")}
                    </Label>
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      autoFocus
                      className="mt-3 h-12 font-medium"
                      placeholder={t("assets.enterGroupName")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveName();
                        if (e.key === "Escape") {
                          setEditedName(group?.name || "");
                          setIsEditingName(false);
                        }
                      }}
                    />
                    <div className="flex justify-end gap-3 mt-5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditedName(group?.name || "");
                          setIsEditingName(false);
                        }}
                      >
                        {t("assets.cancel")}
                      </Button>
                      <Button size="sm" onClick={handleSaveName}>
                        {t("assets.save")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-accent/50">
              <div className="space-y-1 pt-4 pb-4 mx-6">
                {/* Linked Tasks */}
                <button
                  onClick={() => setIsLinkedTasksModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#F5F2FD] w-8 h-8 rounded-md flex justify-center items-center">
                      <Menu className="w-5 h-5 text-[#636AE8FF]" />
                    </div>
                    <span className="text-sm">{t("assets.linkedTasks")}</span>
                    <div className="flex items-center justify-center">
                      <CountBadge
                        count={
                          group.taskCounts.open +
                          group.taskCounts.inProgress +
                          group.taskCounts.completed
                        }
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                {/* Assets */}
                <button
                  onClick={() => setIsLinkedAssetsModalOpen(true)}
                  className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FDF5F1FF] w-8 h-8 rounded-md flex justify-center items-center">
                      <Printer className="w-5 h-5 text-[#E1602CFF]" />
                    </div>
                    <span className="text-sm">{t("assets.title")}</span>
                    <div className="flex items-center justify-center">
                      <CountBadge count={groupAssets.length} />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 py-4 px-6">
              <Button variant="outline" onClick={onClose} className="flex-1">
                {t("assets.close")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteAssetGroupModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        groupName={group.name}
        groupId={group._id}
      />

      <LinkedTasksModal
        isOpen={isLinkedTasksModalOpen}
        onClose={() => setIsLinkedTasksModalOpen(false)}
        groupName={group.name}
        groupIcon=""
        tasks={groupTasks}
      />

      <LinkedAssetsModal
        isOpen={isLinkedAssetsModalOpen}
        onClose={() => setIsLinkedAssetsModalOpen(false)}
        groupId={group._id}
        groupName={group.name}
        groupIcon=""
        assets={groupAssets}
      />
    </>
  );
};

export default AssetGroupDetailsModal;
