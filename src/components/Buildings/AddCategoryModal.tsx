import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Building2, Building, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useApi } from "@/hooks/useApi";
import { apiService } from "@/services/api";
import { toast } from "sonner";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
  const { t } = useLanguage();
  const { buildings, refreshData } = useReferenceData();
  const { executeRequest, isLoading } = useApi();
  const [categoryName, setCategoryName] = useState("");
  const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [autoAssignToNewBuildings, setAutoAssignToNewBuildings] =
    useState(false);

  const filteredBuildings = buildings
    .filter((building) => !building.archived)
    .filter((building) =>
      building.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBuildings([]);
    } else {
      setSelectedBuildings(filteredBuildings.map((b) => b._id));
    }
    setSelectAll(!selectAll);
  };

  const handleBuildingToggle = (buildingId: string) => {
    setSelectedBuildings((prev) =>
      prev.includes(buildingId)
        ? prev.filter((id) => id !== buildingId)
        : [...prev, buildingId],
    );
  };

  const handleCreate = async () => {
    if (!categoryName.trim()) return;

    const categoryData = {
      label: categoryName.trim(),
      buildingIds: selectedBuildings,
      autoAssignToNewBuildings: autoAssignToNewBuildings,
    };

    const result = await executeRequest(() =>
      apiService.post("/category", categoryData),
    );

    onClose();
    await refreshData();

    if (result) {
      setCategoryName("");
      setSelectedBuildings([]);
      setSelectAll(false);
      setSearchTerm("");
      setAutoAssignToNewBuildings(false);
      toast.success(t("buildings.categories"), {
        description: t("buildings.categoryCreatedSuccess"),
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
        {/* HEADER */}
        <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {t("buildings.createCategory")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-full hover:bg-accent/80 transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">{t("buildings.close")}</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t("buildings.createCategoryDesc")}
          </p>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-8">
          <div className="space-y-8">
            {/* Category Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("buildings.categoryName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="category-name"
                placeholder={t("placeholders.enterCategoryName")}
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="h-11 text-sm"
              />
            </div>

            {/* Auto-assign to new buildings checkbox */}
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
              <Checkbox
                id="auto-assign"
                checked={autoAssignToNewBuildings}
                onCheckedChange={(checked) =>
                  setAutoAssignToNewBuildings(checked === true)
                }
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label
                  htmlFor="auto-assign"
                  className="text-sm font-medium cursor-pointer"
                >
                  {t("buildings.autoAssignToNewBuildings")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("buildings.autoAssignToNewBuildingsDescription")}
                </p>
              </div>
            </div>

            {/* Buildings Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  {t("buildings.assignToBuildings")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("buildings.assignToBuildingsDescription")}
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder={t("placeholders.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 text-sm"
                />
              </div>

              {/* Buildings List */}
              <div className="max-h-96 overflow-y-auto border rounded-xl bg-card">
                {filteredBuildings.length === 0 ? (
                  <div className="p-12 text-center">
                    <Building className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("buildings.noBuildingsAvailable")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("buildings.createBuildingFirst")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {/* Select All */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-lg">
                      <Checkbox
                        id="select-all"
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                      <Label
                        htmlFor="select-all"
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <span className="font-medium text-[#1759E8FF]">
                          {t("buildings.selectAll")}
                        </span>
                      </Label>
                    </div>

                    {/* Individual Buildings */}
                    {filteredBuildings.map((building) => (
                      <div
                        key={building._id}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-accent/50 ${
                          selectedBuildings.includes(building._id)
                            ? "bg-primary/10 border border-[#1759E8FF]"
                            : "bg-background"
                        }`}
                      >
                        <Checkbox
                          id={`building-${building._id}`}
                          checked={selectedBuildings.includes(building._id)}
                          onCheckedChange={() =>
                            handleBuildingToggle(building._id)
                          }
                        />
                        <Label
                          htmlFor={`building-${building._id}`}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          {building.photo ? (
                            <img
                              src={building.photo}
                              alt={building.label}
                              className="w-10 h-10 rounded-lg object-cover shadow-sm"
                            />
                          ) : (
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
                                selectedBuildings.includes(building._id)
                                  ? "bg-[#1759E8FF]"
                                  : "bg-muted"
                              }`}
                            >
                              <svg
                                className="w-6 h-6"
                                fill="white"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                              >
                                <path d="M21 20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.314a1 1 0 0 1 .38-.785l8-6.311a1 1 0 0 1 1.24 0l8 6.31a1 1 0 0 1 .38.786V20zM7 12a5 5 0 0 0 10 0h-2a3 3 0 0 1-6 0H7z" />
                              </svg>
                            </div>
                          )}
                          <span className="font-medium">{building.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="min-w-32"
            >
              {t("buildings.cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!categoryName.trim() || isLoading}
              size="lg"
              className="min-w-40 font-medium"
            >
              {isLoading ? t("buildings.creating") : t("buildings.createCategory2")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
