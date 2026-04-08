import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Search, Printer } from "lucide-react";
import { useBuildingData } from "@/hooks/useBuildingData";
import { useLanguage } from "@/contexts/LanguageContext";
import { Label } from "../ui/label";
import { useCreateGroupMutation, useGroupsQuery } from "@/hooks/queries";
import { useToast } from "@/hooks/use-toast";
import { useReferenceData } from "@/contexts/ReferenceDataContext";

interface CreateAssetGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAssetGroupModal = ({
  isOpen,
  onClose,
}: CreateAssetGroupModalProps) => {
  const [groupName, setGroupName] = useState("");
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { filteredAssets } = useBuildingData();
  const { t } = useLanguage();
  const { toast } = useToast();
  const createGroupMutation = useCreateGroupMutation();
  const { data: groups = [] } = useGroupsQuery();
  const { refreshAssets } = useReferenceData();

  const assignedAssetIds = new Set(
    groups.flatMap((group: any) =>
      (group.assets || []).map((a: any) => (typeof a === "string" ? a : a._id)),
    ),
  );
  const unassignedAssets = (filteredAssets || []).filter(
    (asset) => !assignedAssetIds.has(asset._id),
  );

  const searchFilteredAssets = useMemo(() => {
    if (!searchQuery.trim()) return unassignedAssets;
    const query = searchQuery.toLowerCase();
    return unassignedAssets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(query) ||
        asset.linked_space_id?.name.toLowerCase().includes(query) ||
        asset.brand?.toLowerCase().includes(query) ||
        asset.supplier?.toLowerCase().includes(query),
    );
  }, [searchQuery, unassignedAssets]);

  const handleAssetToggle = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId],
    );
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;

    try {
      await createGroupMutation.mutateAsync({
        name: groupName.trim(),
        assets: selectedAssets,
        belongTo: "assets",
      });

      onClose();
      toast({
        title: t("assets.title"),
        description: t("assets.assetGroupCreatedSuccess"),
        variant: "success",
      });

      setGroupName("");
      setSelectedAssets([]);
      setSearchQuery("");
    } catch (error) {
      toast({
        title: "Error",
        description: t("assets.failedCreateAssetGroup"),
        variant: "destructive",
      });
    } finally {
      await refreshAssets();
    }
  };

  const handleClose = () => {
    onClose();
    setGroupName("");
    setSelectedAssets([]);
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              {t("assets.createAssetGroup")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-9 w-9 rounded-full hover:bg-accent/80 transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">{t("assets.close")}</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t("assets.createAssetGroupDesc")}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 ">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("assets.groupName")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                type="text"
                placeholder={t("assets.groupNamePlaceholder")}
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="h-11 text-sm"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">
                {t("assets.addAssets")}{" "}
                <span className="text-muted-foreground text-sm">
                  ({t("assets.optional")})
                </span>
              </Label>

              {unassignedAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                  <Printer className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {t("assets.noAssetsAvailable")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    {t("assets.noAssetsAvailableDesc")}
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t("assets.searchAssetsPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 text-sm"
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto border rounded-xl bg-card">
                    {searchFilteredAssets.length === 0 ? (
                      <div className="p-12 text-center">
                        <p className="text-sm text-muted-foreground">
                          {t("assets.noAssetsMatchingSearch")} "{searchQuery}"
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1 p-3">
                        {searchFilteredAssets
                          .filter((asset) => !asset.archived)
                          .map((asset) => (
                            <div
                              key={asset._id}
                              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all hover:bg-accent/50 cursor-pointer ${
                                selectedAssets.includes(asset._id)
                                  ? "bg-primary/10 border border-primary"
                                  : "bg-background"
                              }`}
                              onClick={() => handleAssetToggle(asset._id)}
                            >
                              <Checkbox
                                id={`asset-${asset._id}`}
                                checked={selectedAssets.includes(asset._id)}
                                onCheckedChange={() =>
                                  handleAssetToggle(asset._id)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <Printer className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-foreground">
                                    {asset.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {asset.linked_space_id?.name ||
                                      t("assets.noSpaceAssigned")}
                                    {asset.brand && (
                                      <>
                                        {" • "}
                                        <span className="font-medium">
                                          {asset.brand}
                                        </span>
                                      </>
                                    )}
                                    {asset.supplier && (
                                      <>
                                        {" • "}
                                        {asset.supplier}
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleClose}
              className="min-w-32"
            >
              {t("assets.cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!groupName.trim() || createGroupMutation.isPending}
              size="lg"
              className="min-w-44 font-medium"
            >
              {createGroupMutation.isPending
                ? t("assets.creatingGroup")
                : t("assets.createGroup")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssetGroupModal;
