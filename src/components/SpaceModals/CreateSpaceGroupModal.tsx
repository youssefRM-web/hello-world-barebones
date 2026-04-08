import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Building, X, DoorClosed } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBuildingData } from "@/hooks/useBuildingData";
import { useCreateGroupMutation, useGroupsQuery } from "@/hooks/queries";
import { useToast } from "@/hooks/use-toast";
import { useReferenceData } from "@/contexts/ReferenceDataContext";

interface CreateSpaceGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSpaceGroupModal({ isOpen, onClose }: CreateSpaceGroupModalProps) {
  const { t } = useLanguage();
  const { filteredSpaces } = useBuildingData();
  const { toast } = useToast();
  const createGroupMutation = useCreateGroupMutation();
  const { data: groups = [] } = useGroupsQuery();
  const [groupName, setGroupName] = useState("");
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { refreshData } = useReferenceData();

  const assignedSpaceIds = new Set(
    groups.flatMap((group: any) => (group.spaces || []).map((space: any) => space._id))
  );

  const unassignedSpaces = filteredSpaces.filter((space) => !assignedSpaceIds.has(space._id));

  const searchFilteredSpaces = useMemo(() => {
    if (!searchTerm.trim()) return unassignedSpaces;
    const query = searchTerm.toLowerCase();
    return unassignedSpaces.filter((space) => space.name.toLowerCase().includes(query));
  }, [searchTerm, unassignedSpaces]);

  const handleSelectAll = () => {
    if (selectAll) { setSelectedSpaces([]); } else { setSelectedSpaces(searchFilteredSpaces.map((s) => s._id)); }
    setSelectAll(!selectAll);
  };

  const handleSpaceToggle = (spaceId: string) => {
    setSelectedSpaces((prev) => prev.includes(spaceId) ? prev.filter((id) => id !== spaceId) : [...prev, spaceId]);
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return;
    try {
      await createGroupMutation.mutateAsync({ name: groupName.trim(), spaces: selectedSpaces, belongTo: "spaces" });
      onClose();
      toast({ title: t("spaces.title"), description: t("spaces.spaceGroupCreated"), variant: "success" });
      refreshData();
      setGroupName(""); setSelectedSpaces([]); setSelectAll(false); setSearchTerm("");
    } catch (error) {
      toast({ title: t("common.error"), description: t("spaces.failedCreateGroup"), variant: "destructive" });
    }
  };

  const handleClose = () => {
    setGroupName(""); setSelectedSpaces([]); setSelectAll(false); setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold tracking-tight">{t("spaces.createSpaceGroup")}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-9 w-9 rounded-full hover:bg-accent/80 transition-colors">
              <X className="h-5 w-5" />
              <span className="sr-only">{t("spaces.close")}</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{t("spaces.createSpaceGroupDesc")}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("spaces.groupName")} <span className="text-destructive">*</span></Label>
              <Input type="text" placeholder={t("spaces.groupNamePlaceholder")} value={groupName} onChange={(e) => setGroupName(e.target.value)} className="h-11 text-sm" />
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-medium">{t("spaces.addSpaces")} <span className="text-muted-foreground text-sm">({t("spaces.optional")})</span></Label>

              {unassignedSpaces.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border/50 rounded-xl bg-muted/20">
                  <DoorClosed className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <p className="text-sm font-medium text-muted-foreground">{t("spaces.noSpacesAvailable")}</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">{t("spaces.allSpacesAssigned")}</p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input type="text" placeholder={t("spaces.searchSpacesByName")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11 text-sm" />
                  </div>

                  {searchFilteredSpaces.length > 0 && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 rounded-lg">
                      <Checkbox id="select-all" checked={selectAll} onCheckedChange={handleSelectAll} />
                      <Label htmlFor="select-all" className="font-medium cursor-pointer text-primary">{t("spaces.selectAllVisible")}</Label>
                    </div>
                  )}

                  <div className="max-h-96 overflow-y-auto border rounded-xl bg-card">
                    {searchFilteredSpaces.length === 0 ? (
                      <div className="p-12 text-center">
                        <p className="text-sm text-muted-foreground">{t("spaces.noSpacesMatchingSearch").replace("{search}", searchTerm)}</p>
                      </div>
                    ) : (
                      <div className="space-y-1 p-3">
                        {searchFilteredSpaces.filter((space) => !space.archived).map((space) => (
                          <div
                            key={space._id}
                            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all hover:bg-accent/50 cursor-pointer ${selectedSpaces.includes(space._id) ? "bg-primary/10 border border-primary" : "bg-background"}`}
                            onClick={() => handleSpaceToggle(space._id)}
                          >
                            <Checkbox id={`space-${space._id}`} checked={selectedSpaces.includes(space._id)} onCheckedChange={() => handleSpaceToggle(space._id)} onClick={(e) => e.stopPropagation()} />
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <DoorClosed className="w-5 h-5 text-primary" />
                              </div>
                              <span className="font-medium text-foreground">{space.name}</span>
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
            <Button variant="outline" size="lg" onClick={handleClose} className="min-w-32">{t("spaces.cancel")}</Button>
            <Button onClick={handleCreate} disabled={!groupName.trim() || createGroupMutation.isPending} size="lg" className="min-w-44 font-medium">
              {createGroupMutation.isPending ? t("spaces.creatingGroup") : t("spaces.createGroup")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
