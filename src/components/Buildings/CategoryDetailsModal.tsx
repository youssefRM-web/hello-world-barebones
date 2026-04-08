import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Home,
  X,
  Tag,
  Edit,
  Info,
  Badge,
  MessageSquare,
  Paperclip,
  Calendar,
  Check,
  InfoIcon,
  ChevronsDown,
  Printer,
  Save,
  ChevronRight,
  Building2,
} from "lucide-react";
import { DeleteCategoryModal } from "./DeleteCategoryModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { useApi } from "@/hooks/useApi";
import { apiService } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import LinkedItemModal from "@/components/SpaceModals/LinkedItemModal";
import { LinkedBuildingsModal } from "./LinkedBuildingsModal";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useTasksQuery } from "@/hooks/queries/useTasksQuery";
import { useLanguage } from "@/contexts/LanguageContext";

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any;
}

type PriorityConfig = {
  classes: string;
  icon: JSX.Element;
};

export function CategoryDetailsModal({
  isOpen,
  onClose,
  category,
}: CategoryDetailsModalProps) {
  const { t } = useLanguage();
  const { executeRequest } = useApi();
  const { updateCategory, refreshData } = useReferenceData();
  const { data: allTasks = [] } = useTasksQuery();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showLinkedItemModal, setShowLinkedItemModal] = useState(false);
  const [linkedItemModalData, setLinkedItemModalData] = useState<{
    title: string;
    items?: any[];
  } | null>(null);
  const [showLinkedBuildingsModal, setShowLinkedBuildingsModal] =
    useState(false);
  const [localLinkedBuildings, setLocalLinkedBuildings] = useState(
    category?.buildingIds || [],
  );
  const [autoAssign, setAutoAssign] = useState(category?.autoAssignToNewBuildings || false);
  const [isTogglingAutoAssign, setIsTogglingAutoAssign] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const linkedTasksData = useMemo(() => {
    const tasks = category?.taskIds || [];
    return {
      open: tasks.filter((t: any) => t.Status === "TO_DO"),
      inProgress: tasks.filter((t: any) => t.Status === "IN_PROGRESS"),
      done: tasks.filter((t: any) => t.Status === "DONE"),
    };
  }, [category?.taskIds]);

  useEffect(() => {
    if (category?.label) {
      setEditedName(category.label);
    }
    if (category?.buildingIds) {
      setLocalLinkedBuildings(category.buildingIds);
    }
    setAutoAssign(category?.autoAssignToNewBuildings || false);
  }, [category]);

  const handleSaveName = async () => {
    if (!category?._id || !editedName.trim()) return;

    const result = await executeRequest(() =>
      apiService.patch(`/category/${category._id}`, {
        label: editedName.trim(),
      }),
    );

    if (result) {
      setIsEditingName(false);
      updateCategory(category._id, { label: editedName.trim() });
      toast({
        title: t("buildings.categories"),
        description: t("buildings.categoryNameUpdated"),
        variant: "success",
      });
    }
  };

  const getPriorityConfig = (priority: string): PriorityConfig => {
    switch (priority) {
      case "High":
        return {
          classes: "text-[#DE3B40FF] bg-[#FDF2F2FF] first-letter:uppercase",
          icon: <InfoIcon className="w-3 h-3 text-[#DE3B40FF]" />,
        };
      case "Medium":
        return {
          classes: "text-[#EA916EFF] bg-[#FDF5F1FF] first-letter:uppercase",
          icon: (
            <svg
              className="w-3 h-3"
              fill="#EA916EFF"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <g>
                <rect fill="none" height="20" width="20" />
              </g>
              <g>
                <g>
                  <rect height="2" width="18" x="3" y="3" />
                  <rect height="2" width="18" x="3" y="19" />
                  <rect height="2" width="18" x="3" y="11" />
                </g>
              </g>
            </svg>
          ),
        };
      case "Low":
        return {
          classes: "text-[#379AE6FF] bg-[#F1F8FDFF] first-letter:uppercase ",
          icon: <ChevronsDown className="w-3 h-3 text-[#379AE6FF]" />,
        };
      default:
        return {
          classes:
            "text-gray-600 bg-gray-50 border-gray-200 first-letter:uppercase",
          icon: <ChevronsDown className="w-3 h-3 text-blue-600" />,
        };
    }
  };

  const handleOpenLinkedItemModal = (title: string, items?: any[]) => {
    setLinkedItemModalData({ title, items });
    setShowLinkedItemModal(true);
  };

  const handleCloseLinkedItemModal = () => {
    setShowLinkedItemModal(false);
    setLinkedItemModalData(null);
  };

  const CountBadge = ({ count }: { count: number }) => (
    <span
      className={`ml-1.5 px-1.5 min-w-[20px] h-5 text-xs font-medium rounded-full inline-flex items-center justify-center bg-muted text-muted-foreground border border-border`}
    >
      {count}
    </span>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 transition-none">
        <DialogHeader className="space-y-2 py-2 px-5 border-b bg-accent/50 ">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-1">
              <div className="text-sm text-foreground">
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-accent/70 transition-all"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex items-center gap-3 pb-3 px-6 group">
            <div className="bg-[#F1F5FE] w-10 h-10 rounded-md flex items-center justify-center">
              <Tag className="w-6 h-6" color="#4D81ED" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-[00000] first-letter:uppercase">
                  {editedName}
                </div>
                <button onClick={() => setIsEditingName(true)}>
                  <Edit className="h-4 w-4 cursor-pointer" />
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
                    {t("buildings.editCategoryName")}
                  </Label>
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    autoFocus
                    className="mt-3 h-12 font-medium"
                    placeholder={t("buildings.enterCategoryName")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") {
                        setEditedName(category?.label || "");
                        setIsEditingName(false);
                      }
                    }}
                  />
                  <div className="flex justify-end gap-3 mt-5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditedName(category?.label || "");
                        setIsEditingName(false);
                      }}
                    >
                      {t("buildings.cancel")}
                    </Button>
                    <Button size="sm" onClick={handleSaveName}>
                      {t("buildings.save")}
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
                onClick={() =>
                  handleOpenLinkedItemModal("Tasks", category?.taskIds)
                }
                className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#F5F2FD] w-8 h-8 rounded-md flex justify-center items-center">
                    <svg
                      className="w-5 h-5"
                      fill="#636AE8FF"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5s1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5S5.5 6.83 5.5 6S4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5s1.5-.68 1.5-1.5s-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
                    </svg>
                  </div>
                  <span className="text-sm">{t("buildings.linkedTasks")}</span>

                  <CountBadge
                    count={
                      linkedTasksData.open.length +
                      linkedTasksData.inProgress.length +
                      linkedTasksData.done.length
                    }
                  />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* Assets */}
              <button
                onClick={() =>
                  handleOpenLinkedItemModal("Asset", category?.assets)
                }
                className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#F1F5FE] w-8 h-8 rounded-md flex justify-center items-center">
                    <Printer className="w-5 h-5 text-[#4D81ED]" />
                  </div>
                  <span className="text-sm">{t("pages.assets")}</span>

                  <CountBadge count={(category?.assets || []).length} />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              {/* Linked Buildings */}
              <button
                onClick={() => setShowLinkedBuildingsModal(true)}
                className="w-full flex items-center justify-between p-3 bg-background border rounded-md hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#E5E7EB] w-8 h-8 rounded-md flex justify-center items-center">
                    <svg className="w-5 h-5" fill="#6B7280" viewBox="0 0 24 24">
                      <path d="M21 20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.314a1 1 0 0 1 .38-.785l8-6.311a1 1 0 0 1 1.24 0l8 6.31a1 1 0 0 1 .38.786V20zM7 12a5 5 0 0 0 10 0h-2a3 3 0 0 1-6 0H7z" />
                    </svg>
                  </div>
                  <span className="text-sm">{t("buildings.linkedBuildings")}</span>
                  <CountBadge count={localLinkedBuildings?.length} />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            {/* Auto-assign toggle */}
            <div className="mx-6 mb-4 flex items-center justify-between p-3 bg-background border rounded-md">
              <div className="flex items-center gap-3">
                <div className="bg-[#FEF3C7] w-8 h-8 rounded-md flex justify-center items-center">
                  <Building2 className="w-5 h-5 text-[#D97706]" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">{t("buildings.autoAssignToNewBuildings")}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("buildings.autoAssignToNewBuildingsDescription")}</p>
                </div>
              </div>
              <Switch
                checked={autoAssign}
                disabled={isTogglingAutoAssign}
                onCheckedChange={async (checked) => {
                  setAutoAssign(checked);
                  setIsTogglingAutoAssign(true);
                  try {
                    await apiService.patch(`/category/${category._id}`, {
                      autoAssignToNewBuildings: checked,
                    });
                    updateCategory(category._id, { autoAssignToNewBuildings: checked });
                    toast({
                      title: t("buildings.categories"),
                      description: checked
                        ? t("buildings.autoAssignToNewBuildings")
                        : t("buildings.DesactivateAutoAssignToNewBuildings"),
                      variant: "success",
                    });
                  } catch (error) {
                    setAutoAssign(!checked);
                    toast({
                      title: t("common.error"),
                      description: t("common.error"),
                      variant: "destructive",
                    });
                  } finally {
                    setIsTogglingAutoAssign(false);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex gap-2 py-4 px-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t("buildings.close")}
            </Button>
          </div>
        </div>
      </DialogContent>

      {showLinkedItemModal && linkedItemModalData && (
        <LinkedItemModal
          isOpen={showLinkedItemModal}
          onClose={handleCloseLinkedItemModal}
          onBack={handleCloseLinkedItemModal}
          title={linkedItemModalData.title}
          spaceName={category?.label || "Category"}
          items={linkedItemModalData.items}
          space={{
            linkedTasks: category?.taskIds || [],
            assets: category?.assets,
            documents: category?.buildingIds,
            createdAt: category?.createdAt,
          }}
        />
      )}

      {showLinkedBuildingsModal && (
        <LinkedBuildingsModal
          isOpen={showLinkedBuildingsModal}
          onClose={() => setShowLinkedBuildingsModal(false)}
          categoryId={category?._id}
          categoryName={category?.label || "Category"}
          buildings={localLinkedBuildings}
          onBuildingsChange={setLocalLinkedBuildings}
        />
      )}

      <DeleteCategoryModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
        }}
        onConfirm={() => {
          setShowDeleteModal(false);
          onClose();
        }}
        categoryName={category?.label || "Category"}
        categoryId={category?._id || ""}
      />
    </Dialog>
  );
}
