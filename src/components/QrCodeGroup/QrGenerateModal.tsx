import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  ArrowLeft,
  QrCode,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronRight,
  DoorClosed,
  Printer,
  Building2,
} from "lucide-react";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { apiUrl } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserQuery } from "@/hooks/queries";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import PageLoadingSkeleton from "@/components/Common/PageLoadingSkeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import PrintingInstructionsModal from "@/components/QrCodeGroup/PrintingInstructionsModal";

interface QrGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step =
  | "building-selection"
  | "spaces-assets"
  | "printing-format"
  | "generate-document";

// Helper to determine initial step based on sidebar selection
const getInitialStep = (selectedBuildingId: string | null): Step => {
  return selectedBuildingId ? "spaces-assets" : "building-selection";
};

const QrGenerateModal = ({ isOpen, onClose, onSuccess }: QrGenerateModalProps) => {
  const {
    buildings,
    spaces,
    assets,
    isLoading,
    refreshData,
    refreshSpaces,
    refreshAssets,
  } = useReferenceData();

  const { toast } = useToast();
  const { data: currentUser } = useCurrentUserQuery();
  const { selectedBuildingId } = useBuildingSelection();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Refresh data when modal opens to ensure we have latest assets
  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);
  // When a building is selected from sidebar, skip building selection step
  const [currentStep, setCurrentStep] = useState<Step>(
    getInitialStep(selectedBuildingId),
  );
  const [activeTab, setActiveTab] = useState("spaces");
  const [selectedSpaces, setSelectedSpaces] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedAssets, setSelectedAssets] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedSpaceFormat, setSelectedSpaceFormat] = useState<string | null>(
    null,
  );
  const [selectedAssetFormat, setSelectedAssetFormat] = useState<string | null>(
    null,
  );
  const [spaceSearchTerms, setSpaceSearchTerms] = useState<
    Record<string, string>
  >({});
  const [assetSearchTerms, setAssetSearchTerms] = useState<
    Record<string, string>
  >({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStickerSize, setSelectedStickerSize] = useState("4x4");
  const [expandedSpaceBuildings, setExpandedSpaceBuildings] = useState<
    Record<string, boolean>
  >({});
  const [expandedAssetBuildings, setExpandedAssetBuildings] = useState<
    Record<string, boolean>
  >({});
  const [showPrintingInstructions, setShowPrintingInstructions] =
    useState(false);
  // Local building selection when sidebar has "All Buildings" selected
  const [modalBuildingId, setModalBuildingId] = useState<string | null>(null);

  // Effective building ID: use sidebar selection if available, otherwise modal selection
  const effectiveBuildingId = selectedBuildingId || modalBuildingId;

  // Reset modal building selection and set correct initial step when modal opens
  useEffect(() => {
    if (isOpen) {
      setModalBuildingId(null);
      // Set initial step based on whether a building is selected from sidebar
      setCurrentStep(getInitialStep(selectedBuildingId));
    }
  }, [isOpen, selectedBuildingId]);

  // Available buildings for dropdown (non-archived)
  const availableBuildings = useMemo(() => {
    return buildings.filter((building) => !building.archived);
  }, [buildings]);

  // Determine which buildings to show based on effective selection
  const buildingsToShow = useMemo(() => {
    const selectedBuilding = buildings.find(
      (b: any) => b._id === effectiveBuildingId,
    );
    if (selectedBuilding) {
      return [selectedBuilding];
    }
    return buildings.filter((building) => !building.archived);
  }, [buildings, effectiveBuildingId]);

  // Transform real data into the structure needed by the UI
  const spacesData = useMemo(() => {
    if (!buildingsToShow.length || !spaces.length) return [];

    return buildingsToShow.map((building) => {
      const buildingSpaces = spaces.filter(
        (space) => space.building_id?._id === building._id && !space.archived,
      );

      // Group spaces by area (using area as floor equivalent)
      const floorMap = new Map<string, any[]>();
      buildingSpaces.forEach((space) => {
        const floorName = space.area?.label || "Unassigned";
        if (!floorMap.has(floorName)) {
          floorMap.set(floorName, []);
        }
        floorMap.get(floorName)?.push({
          id: space._id,
          name: space.name || "Unnamed Space",
          selected: selectedSpaces[space._id] || false,
        });
      });

      const floors = Array.from(floorMap.entries()).map(([name, rooms]) => ({
        name,
        rooms,
      }));

      return {
        id: building._id,
        name: building.label || "Unnamed Building",
        selectedCount: buildingSpaces.filter((s) => selectedSpaces[s._id])
          .length,
        floors,
      };
    });
  }, [buildingsToShow, spaces, selectedSpaces]);

  const assetsData = useMemo(() => {
    if (!buildingsToShow.length || !assets.length || !spaces.length) return [];

    return buildingsToShow.map((building) => {
      const buildingSpaces = spaces.filter(
        (space) => space.building_id?._id === building._id,
      );

      const roomsWithAssets = buildingSpaces
        .map((space) => {
          const spaceAssets = assets.filter(
            (asset) =>
              asset.linked_space_id?._id === space._id && !asset.archived,
          );

          if (spaceAssets.length === 0) return null;

          return {
            name: space.name || "Unnamed Space",
            assets: spaceAssets.map((asset) => ({
              id: asset._id,
              name: asset.name || "Unnamed Asset",
              selected: selectedAssets[asset._id] || false,
            })),
          };
        })
        .filter(Boolean);

      const selectedCount = assets.filter(
        (asset) =>
          selectedAssets[asset._id] &&
          buildingSpaces.some((s) => s._id === asset.linked_space_id?._id),
      ).length;

      return {
        id: building._id,
        name: building.label || "Unnamed Building",
        selectedCount,
        rooms: roomsWithAssets,
      };
    });
  }, [buildingsToShow, spaces, assets, selectedAssets]);

  // Initialize first building as expanded when data loads
  useEffect(() => {
    if (
      spacesData.length > 0 &&
      Object.keys(expandedSpaceBuildings).length === 0
    ) {
      setExpandedSpaceBuildings({ [spacesData[0].id]: true });
    }
  }, [spacesData]);

  useEffect(() => {
    if (
      assetsData.length > 0 &&
      Object.keys(expandedAssetBuildings).length === 0
    ) {
      setExpandedAssetBuildings({ [assetsData[0].id]: true });
    }
  }, [assetsData]);

  const toggleSpaceBuildingExpanded = (buildingId: string) => {
    setExpandedSpaceBuildings((prev) => ({
      ...prev,
      [buildingId]: !prev[buildingId],
    }));
  };

  const toggleAssetBuildingExpanded = (buildingId: string) => {
    setExpandedAssetBuildings((prev) => ({
      ...prev,
      [buildingId]: !prev[buildingId],
    }));
  };

  const spaceFormats = [
    {
      id: "din-a4-3x3",
      name: "DIN A4",
      sub: "21 x 29.7 cm",
      size: "A4",
      selected: false,
    },
    {
      id: "din-a5-3x3",
      name: "DIN A5",
      sub: "14.8 x 21 cm",
      size: "A5",
      selected: false,
    },
    {
      id: "sticker-3x3",
      name: "Sticker",
      sub: "3.5 x 3.5 cm",
      size: "3x3",
      selected: false,
    },
    {
      id: "sticker-4x4",
      name: "Sticker",
      sub: "4 x 4 cm",
      size: "4x4",
      selected: true,
    },
    {
      id: "sticker-5x5",
      name: "Sticker",
      sub: "5 x 5 cm",
      size: "5x5",
      selected: false,
    },
  ];
  const assetFormats = [
    {
      id: "din-a4-3x3",
      name: "DIN A4",
      sub: "21 x 29.7 cm",
      size: "A4",
      selected: false,
    },
    {
      id: "din-a5-3x3",
      name: "DIN A5",
      sub: "14.8 x 21 cm",
      size: "A5",
      selected: false,
    },
    {
      id: "sticker-3x3",
      name: "Sticker",
      sub: "3.5 x 3.5 cm",
      size: "3x3",
      selected: false,
    },
    {
      id: "sticker-4x4",
      name: "Sticker",
      sub: "4 x 4 cm",
      size: "4x4",
      selected: true,
    },
    {
      id: "sticker-5x5",
      name: "Sticker",
      sub: "5 x 5 cm",
      size: "5x5",
      selected: false,
    },
  ];

  const getSelectedSpacesCount = () => {
    return spacesData.reduce(
      (total, building) =>
        total +
        building.floors.reduce(
          (floorTotal, floor) =>
            floorTotal + floor.rooms.filter((room) => room.selected).length,
          0,
        ),
      0,
    );
  };

  const getSelectedAssetsCount = () => {
    return assetsData.reduce(
      (total, building) =>
        total +
        building.rooms.reduce(
          (roomTotal, room) =>
            roomTotal + room.assets.filter((asset) => asset.selected).length,
          0,
        ),
      0,
    );
  };

  const canProceedToNextStep = () => {
    if (currentStep === "building-selection") {
      return !!effectiveBuildingId;
    }
    if (currentStep === "spaces-assets") {
      return getSelectedSpacesCount() > 0 || getSelectedAssetsCount() > 0;
    }
    if (currentStep === "printing-format") {
      const hasSpaces = getSelectedSpacesCount() > 0;
      const hasAssets = getSelectedAssetsCount() > 0;
      const spaceFormatSelected = !hasSpaces || selectedSpaceFormat;
      const assetFormatSelected = !hasAssets || selectedAssetFormat;
      return spaceFormatSelected && assetFormatSelected;
    }
    return true;
  };

  const handleNext = async () => {
    if (currentStep === "building-selection" && canProceedToNextStep()) {
      setCurrentStep("spaces-assets");
    } else if (currentStep === "spaces-assets" && canProceedToNextStep()) {
      setCurrentStep("printing-format");
    } else if (currentStep === "printing-format" && canProceedToNextStep()) {
      await generateQrCodes();
    }
  };

  const generateQrCodes = async () => {
    // Validate building selection first
    if (!effectiveBuildingId) {
      toast({
        title: t("qrCodes.noBuildingSelected"),
        description: t("qrCodes.selectBuildingFirst"),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Get selected space IDs
      const spaceIds = Object.keys(selectedSpaces).filter(
        (id) => selectedSpaces[id],
      );

      // Get selected asset IDs
      const assetIds = Object.keys(selectedAssets).filter(
        (id) => selectedAssets[id],
      );

      const lang = localStorage.getItem("language") || "en";

      const payload = {
        spaces: spaceIds.map((id) => {
          const space = spaces.find((s) => s._id === id);
          return { id, name: space?.name || "Unnamed Space" };
        }),
        assets: assetIds.map((id) => {
          const asset = assets.find((a) => a._id === id);
          return { id, name: asset?.name || "Unnamed Asset" };
        }),
        // NEW: send both sizes as array
        stickerSizes: [
          selectedSpaceFormat
            ? spaceFormats.find((f) => f.id === selectedSpaceFormat)?.size
            : null,
          selectedAssetFormat
            ? assetFormats.find((f) => f.id === selectedAssetFormat)?.size
            : null,
        ].filter(Boolean), // → e.g. ["A4", "3x3"]
        organizationId: currentUser?.Organization_id?._id,
        buildingId: effectiveBuildingId,
        language : lang
        // remove old fields:
        // spaceFormat, assetFormat, stickerSize
      };

      const token = JSON.parse(localStorage.getItem("userInfo"))?.accessToken;
      const response = await fetch(`${apiUrl}/qr-codes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate QR codes");
      }

      toast({
        title: t("qrCodes.title"),
        description: t("qrCodes.generatingQrCodes"),
        variant: "success",
      });

      setCurrentStep("generate-document");
    } catch (error: any) {
      console.error("Error generating QR codes:", error);
      toast({
        title: t("qrCodes.error"),
        description: error.message || t("qrCodes.generateFailed"),
        variant: "destructive",
      });
    } finally {
      // Invalidate QR codes query to refresh the linked QR codes in asset/space details
      await queryClient.invalidateQueries({ queryKey: ["qrCodes"] });
      await refreshAssets();
      await refreshSpaces();
      setIsGenerating(false);
    }
  };

  const handleBack = () => {
    if (currentStep === "spaces-assets") {
      // Only go back to building selection if no building is selected from sidebar
      if (!selectedBuildingId) {
        setCurrentStep("building-selection");
      }
    } else if (currentStep === "printing-format") {
      setCurrentStep("spaces-assets");
    } else if (currentStep === "generate-document") {
      setCurrentStep("printing-format");
    }
  };

  const handleClose = () => {
    // Reset to appropriate initial step based on sidebar selection
    setCurrentStep(getInitialStep(selectedBuildingId));
    setActiveTab("spaces");
    setSelectedSpaces({});
    setSelectedAssets({});
    setSelectedSpaceFormat(null);
    setSelectedAssetFormat(null);
    setSpaceSearchTerms({});
    setAssetSearchTerms({});
    setModalBuildingId(null);
    onClose();
  };

  // Toggle space selection
  const toggleSpaceSelection = (spaceId: string) => {
    setSelectedSpaces((prev) => ({
      ...prev,
      [spaceId]: !prev[spaceId],
    }));
  };

  // Toggle asset selection
  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets((prev) => ({
      ...prev,
      [assetId]: !prev[assetId],
    }));
  };

  // Select all spaces in a floor
  const selectAllInFloor = (buildingId: string, floorName: string) => {
    const building = spacesData.find((b) => b.id === buildingId);
    if (!building) return;

    const floor = building.floors.find((f) => f.name === floorName);
    if (!floor) return;

    const updates: Record<string, boolean> = {};
    floor.rooms.forEach((room) => {
      updates[room.id] = true;
    });

    setSelectedSpaces((prev) => ({ ...prev, ...updates }));
  };

  // Clear all spaces in a floor
  const clearAllInFloor = (buildingId: string, floorName: string) => {
    const building = spacesData.find((b) => b.id === buildingId);
    if (!building) return;

    const floor = building.floors.find((f) => f.name === floorName);
    if (!floor) return;

    const updates: Record<string, boolean> = {};
    floor.rooms.forEach((room) => {
      updates[room.id] = false;
    });

    setSelectedSpaces((prev) => ({ ...prev, ...updates }));
  };

  // Select all assets in a room
  const selectAllAssetsInRoom = (buildingId: string, roomName: string) => {
    const building = assetsData.find((b) => b.id === buildingId);
    if (!building) return;

    const room = building.rooms.find((r) => r.name === roomName);
    if (!room) return;

    const updates: Record<string, boolean> = {};
    room.assets.forEach((asset) => {
      updates[asset.id] = true;
    });

    setSelectedAssets((prev) => ({ ...prev, ...updates }));
  };

  // Clear all assets in a room
  const clearAllAssetsInRoom = (buildingId: string, roomName: string) => {
    const building = assetsData.find((b) => b.id === buildingId);
    if (!building) return;

    const room = building.rooms.find((r) => r.name === roomName);
    if (!room) return;

    const updates: Record<string, boolean> = {};
    room.assets.forEach((asset) => {
      updates[asset.id] = false;
    });

    setSelectedAssets((prev) => ({ ...prev, ...updates }));
  };

  const handleDownload = () => {
    // Simulate download functionality
    const link = document.createElement("a");
    link.href = "#"; // This would be the actual file URL
    link.download = "qr-codes.pdf";
    link.click();
  };

  const renderBuildingSelection = () => (
    <div className="space-y-6">
      <p className="text-center text-foreground text-base max-w-2xl mx-auto">
        {t("qrCodes.selectBuildingDesc")}
      </p>

      <div className="max-w-md mx-auto">
        <label className="block text-sm font-medium text-foreground mb-2">
          <Building2 className="w-4 h-4 inline-block mr-2" />
          {t("qrCodes.selectBuilding")}
        </label>
        <Select
          value={modalBuildingId || ""}
          onValueChange={(value) => {
            setModalBuildingId(value);
            // Clear selections when building changes
            setSelectedSpaces({});
            setSelectedAssets({});
          }}
        >
          <SelectTrigger className="w-full capitalize">
            <SelectValue
              placeholder={t("qrCodes.chooseBuilding")}
              className="capitalize"
            />
          </SelectTrigger>
          <SelectContent>
            {availableBuildings.map((building) => (
              <SelectItem
                key={building._id}
                value={building._id}
                className="capitalize"
              >
                {building.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {modalBuildingId && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg capitalize">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {availableBuildings.find((b) => b._id === modalBuildingId)?.label}
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderSpacesAssets = () => (
    <div className="space-y-6">
      <p className="text-center text-foreground text-base max-w-2xl mx-auto">
        {t("qrCodes.selectSpacesAssetsDesc")}
      </p>

      {/* Show selected building info */}
      {effectiveBuildingId && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground ">
              {
                availableBuildings.find((b) => b._id === effectiveBuildingId)
                  ?.label
              }
            </span>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10">
          <TabsTrigger value="spaces" className="gap-2">
            <DoorClosed className="w-4 h-4" />
            {t("qrCodes.spaces")} ({getSelectedSpacesCount()})
          </TabsTrigger>
          <TabsTrigger value="assets" className="gap-2">
            <Printer className="w-4 h-4" />
            {t("qrCodes.assets")} ({getSelectedAssetsCount()})
          </TabsTrigger>
        </TabsList>

        {/* SPACES TAB */}
        <TabsContent value="spaces" className="space-y-10">
          {spacesData?.length > 0 ? (
            spacesData.map((building, buildingIdx) => {
              const isExpanded =
                expandedSpaceBuildings[building.id] ?? buildingIdx === 0;
              const hasSpaces = building.floors.some((f) => f.rooms.length > 0);
              const searchQuery =
                spaceSearchTerms[building.id]?.toLowerCase() || "";

              // Filter floors and rooms based on search
              const filteredFloors = building.floors
                .map((floor) => ({
                  ...floor,
                  rooms: floor.rooms.filter(
                    (room) =>
                      !searchQuery ||
                      room.name.toLowerCase().includes(searchQuery),
                  ),
                }))
                .filter((floor) => floor.rooms.length > 0);

              const hasFilteredResults = filteredFloors.length > 0;

              return (
                <div
                  key={building.id}
                  className="rounded-2xl border bg-card overflow-hidden shadow-sm first-letter:uppercase"
                >
                  {/* Building Header */}
                  <div
                    className="px-6 py-5 bg-muted/30 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                    onClick={() => toggleSpaceBuildingExpanded(building.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                      <h3 className="text-lg font-semibold text-foreground capitalize">
                        {building.name}
                      </h3>
                    </div>

                    <div
                      className="flex items-center gap-6 w-full md:w-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Search */}
                      <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder={t("qrCodes.searchSpaces")}
                          className="pl-10 h-9 text-sm w-full md:w-64"
                          value={spaceSearchTerms[building.id] || ""}
                          onChange={(e) =>
                            setSpaceSearchTerms((prev) => ({
                              ...prev,
                              [building.id]: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <span className="text-sm font-medium text-foreground whitespace-nowrap">
                        {building.selectedCount} {t("qrCodes.selected")}
                      </span>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sm h-8 px-3"
                          onClick={() =>
                            building.floors.forEach((f) =>
                              clearAllInFloor(building.id, f.name),
                            )
                          }
                        >
                          {t("qrCodes.clear")}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-sm h-8 px-4 bg-primary/10 hover:bg-primary/20"
                          onClick={() =>
                            building.floors.forEach((f) =>
                              selectAllInFloor(building.id, f.name),
                            )
                          }
                        >
                          {t("qrCodes.selectAll")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Floors - Collapsible Content */}
                  {isExpanded &&
                    (!hasSpaces ? (
                      <div className="px-6 py-10 text-center text-muted-foreground">
                        {t("qrCodes.noSpacesInBuilding")}
                      </div>
                    ) : !hasFilteredResults && searchQuery ? (
                      <div className="px-6 py-10 text-center text-muted-foreground">
                        {t("qrCodes.noSpacesMatching")} "
                        {spaceSearchTerms[building.id]}"
                      </div>
                    ) : (
                      filteredFloors.map((floor, floorIdx) => (
                        <div
                          key={floor.name}
                          className={`capitalize ${
                            floorIdx !== filteredFloors.length - 1
                              ? "border-b"
                              : ""
                          }`}
                        >
                          <div className="px-6 py-4 bg-background/50 flex justify-between items-center">
                            <h4 className="font-medium text-foreground">
                              {floor.name}
                            </h4>
                            <div className="flex gap-3 text-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() =>
                                  clearAllInFloor(building.id, floor.name)
                                }
                              >
                                {t("qrCodes.clear")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() =>
                                  selectAllInFloor(building.id, floor.name)
                                }
                              >
                                {t("qrCodes.selectAll")}
                              </Button>
                            </div>
                          </div>

                          <div className="px-6 pb-6 bg-card">
                            <div className="flex flex-wrap gap-3">
                              {floor.rooms.map((room) => (
                                <label
                                  key={room.id}
                                  className={`
                                  flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-md cursor-pointer transition-all
                                  ${
                                    room.selected
                                      ? "bg-primary/10 border-primary text-[#1759E8FF] font-medium shadow-sm"
                                      : "bg-background border-border "
                                  }
                                `}
                                >
                                  <Checkbox
                                    checked={room.selected}
                                    onCheckedChange={() =>
                                      toggleSpaceSelection(room.id)
                                    }
                                  />
                                  <span className="text-sm">{room.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    ))}
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-20 text-lg">
              {t("qrCodes.noSpacesFound")}
            </p>
          )}
        </TabsContent>

        {/* ASSETS TAB — IDENTICAL STYLE */}
        <TabsContent value="assets" className="space-y-10">
          {assetsData?.length > 0 ? (
            assetsData.map((building, buildingIdx) => {
              const isExpanded =
                expandedAssetBuildings[building.id] ?? buildingIdx === 0;
              const hasAssets = building.rooms.length > 0;
              const searchQuery =
                assetSearchTerms[building.id]?.toLowerCase() || "";

              // Filter rooms and assets based on search
              const filteredRooms = building.rooms
                .map((room) => ({
                  ...room,
                  assets: room.assets.filter(
                    (asset) =>
                      !searchQuery ||
                      asset.name.toLowerCase().includes(searchQuery),
                  ),
                }))
                .filter((room) => room.assets.length > 0);

              const hasFilteredResults = filteredRooms.length > 0;

              return (
                <div
                  key={building.id}
                  className="rounded-2xl border bg-card overflow-hidden shadow-sm first-letter:uppercase"
                >
                  <div
                    className="px-6 py-5 bg-muted/30 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                    onClick={() => toggleAssetBuildingExpanded(building.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                      <h3 className="text-lg font-semibold text-foreground capitalize">
                        {building.name}
                      </h3>
                    </div>

                    <div
                      className="flex items-center gap-6 w-full md:w-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative flex-1 md:flex-initial">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder={t("qrCodes.searchAssets")}
                          className="pl-10 h-9 text-sm w-full md:w-64"
                          value={assetSearchTerms[building.id] || ""}
                          onChange={(e) =>
                            setAssetSearchTerms((prev) => ({
                              ...prev,
                              [building.id]: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <span className="text-sm font-medium text-foreground whitespace-nowrap">
                        {building.selectedCount} {t("qrCodes.selected")}
                      </span>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sm h-8 px-3"
                          onClick={() =>
                            building.rooms.forEach((r) =>
                              clearAllAssetsInRoom(building.id, r.name),
                            )
                          }
                        >
                          {t("qrCodes.clear")}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-sm h-8 px-4 bg-primary/10 hover:bg-primary/20"
                          onClick={() =>
                            building.rooms.forEach((r) =>
                              selectAllAssetsInRoom(building.id, r.name),
                            )
                          }
                        >
                          {t("qrCodes.selectAll")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Content */}
                  {isExpanded &&
                    (!hasAssets ? (
                      <div className="px-6 py-10 text-center text-muted-foreground">
                        {t("qrCodes.noAssetsInBuilding")}
                      </div>
                    ) : !hasFilteredResults && searchQuery ? (
                      <div className="px-6 py-10 text-center text-muted-foreground">
                        {t("qrCodes.noAssetsMatching")} "
                        {assetSearchTerms[building.id]}"
                      </div>
                    ) : (
                      filteredRooms.map((room, idx) => (
                        <div
                          key={room.name}
                          className={`${
                            idx < filteredRooms.length - 1 ? "border-b" : ""
                          }`}
                        >
                          <div className="px-6 py-4 bg-background/50 flex justify-between items-center">
                            <h4 className="font-medium text-foreground capitalize">
                              {room.name}
                            </h4>
                            <div className="flex gap-3 text-sm">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() =>
                                  clearAllAssetsInRoom(building.id, room.name)
                                }
                              >
                                {t("qrCodes.clear")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() =>
                                  selectAllAssetsInRoom(building.id, room.name)
                                }
                              >
                                {t("qrCodes.selectAll")}
                              </Button>
                            </div>
                          </div>

                          <div className="px-6 pb-6 bg-card">
                            <div className="flex flex-wrap gap-3">
                              {room.assets.map((asset) => (
                                <label
                                  key={asset.id}
                                  className={`
                                  flex items-center capitalize gap-3 px-4 py-3 rounded-md bg-muted/50 cursor-pointer transition-all
                                  ${
                                    asset.selected
                                      ? "bg-primary/10 border-primary text-[#1759E8FF] font-medium shadow-sm"
                                      : "bg-background border-border"
                                  }
                                `}
                                >
                                  <Checkbox
                                    checked={asset.selected}
                                    onCheckedChange={() =>
                                      toggleAssetSelection(asset.id)
                                    }
                                  />
                                  <span className="text-sm">{asset.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    ))}
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted-foreground py-20 text-lg">
              {t("qrCodes.noAssetsFound")}
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderPrintingFormat = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <p className="text-lg text-foreground font-medium">
          {t("qrCodes.chooseSizingDesc")}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("qrCodes.pleaseReadOur")}{" "}
          <span
            className="text-blue-600 underline cursor-pointer hover:text-blue-700"
            onClick={() => setShowPrintingInstructions(true)}
          >
            {t("qrCodes.printingInfoLink")}
          </span>{" "}
          {t("qrCodes.printingInfoDesc")}
        </p>
      </div>

      {/* SPACES — unchanged */}
      {getSelectedSpacesCount() > 0 && (
        <div className="space-y-6">
          <h3 className="text-center font-semibold text-foreground flex items-center justify-center gap-3">
            <DoorClosed className="w-5 h-5" />
            {t("qrCodes.spaces")} —{" "}
            <span className="font-normal text-muted-foreground">
              {getSelectedSpacesCount()} {t("qrCodes.selected")}
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {spaceFormats.map((format) => (
              <div
                key={format.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedSpaceFormat === format.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-accent/50"
                }`}
                onClick={() => {
                  setSelectedSpaceFormat(format.id);
                  setSelectedStickerSize(format.size); // ← this still works for legacy
                }}
              >
                <div className="text-center space-y-3">
                  <div
                    className={`text-sm font-medium ${
                      selectedSpaceFormat === format.id
                        ? "text-blue-600"
                        : "text-foreground"
                    }`}
                  >
                    {format.name}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      selectedSpaceFormat === format.id
                        ? "text-blue-600"
                        : "text-foreground"
                    }`}
                  >
                    {format.sub}
                  </div>
                  <div className="w-12 h-16 flex items-end justify-center">
                    {format.name.includes("DIN") ? (
                      <svg
                        className="w-10 h-10 rotate-90"
                        fill={
                          selectedSpaceFormat === format.id
                            ? "#1759E8FF"
                            : "#BCC1CAFF"
                        }
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-10 h-10 "
                        fill={
                          selectedSpaceFormat === format.id
                            ? "#1759E8FF"
                            : "#BCC1CAFF"
                        }
                        id="Flat"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                      >
                        <path d="M168,32H88A56.06,56.06,0,0,0,32,88v80a56.06,56.06,0,0,0,56,56h48a8.07,8.07,0,0,0,2.53-.41c26.23-8.75,76.31-58.83,85.06-85.06A8.07,8.07,0,0,0,224,136V88A56.06,56.06,0,0,0,168,32ZM48,168V88A40,40,0,0,1,88,48h80a40,40,0,0,1,40,40v40H184a56.06,56.06,0,0,0-56,56v24H88A40,40,0,0,1,48,168Zm96,35.14V184a40,40,0,0,1,40-40h19.14C191,163.5,163.5,191,144,203.14Z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSETS — NOW 100% SAME UI AS SPACES */}
      {getSelectedAssetsCount() > 0 && (
        <div className="space-y-6">
          <h3 className="text-center font-semibold text-foreground flex items-center justify-center gap-3">
            <Printer className="w-5 h-5" />
            {t("qrCodes.assets")} —{" "}
            <span className="font-normal text-muted-foreground">
              {getSelectedAssetsCount()} {t("qrCodes.selected")}
            </span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {assetFormats.map((format) => (
              <div
                key={format.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAssetFormat === format.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-accent/50"
                }`}
                onClick={() => setSelectedAssetFormat(format.id)}
              >
                <div className="text-center space-y-3">
                  <div
                    className={`text-sm font-medium ${
                      selectedAssetFormat === format.id
                        ? "text-blue-600"
                        : "text-foreground"
                    }`}
                  >
                    {format.name}
                  </div>
                  <div
                    className={`text-sm font-medium ${
                      selectedAssetFormat === format.id
                        ? "text-blue-600"
                        : "text-foreground"
                    }`}
                  >
                    {format.sub}
                  </div>
                  <div className="w-12 h-16 flex items-end justify-center">
                    {format.name.includes("DIN") ? (
                      <svg
                        className="w-9 h-9"
                        fill={
                          selectedAssetFormat === format.id
                            ? "#1759E8FF"
                            : "#BCC1CAFF"
                        }
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-10 h-10"
                        fill={
                          selectedAssetFormat === format.id
                            ? "#1759E8FF"
                            : "#686583"
                        }
                        id="Flat"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                      >
                        <path d="M168,32H88A56.06,56.06,0,0,0,32,88v80a56.06,56.06,0,0,0,56,56h48a8.07,8.07,0,0,0,2.53-.41c26.23-8.75,76.31-58.83,85.06-85.06A8.07,8.07,0,0,0,224,136V88A56.06,56.06,0,0,0,168,32ZM48,168V88A40,40,0,0,1,88,48h80a40,40,0,0,1,40,40v40H184a56.06,56.06,0,0,0-56,56v24H88A40,40,0,0,1,48,168Zm96,35.14V184a40,40,0,0,1,40-40h19.14C191,163.5,163.5,191,144,203.14Z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderGenerateDocument = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-[#1DD75BFF] rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>

      <div className="flex justify-center items-center gap-4">
        <div className="w-16 h-20 border-2 border-gray-300 rounded flex items-center flex-col justify-center bg-white">
          <svg
            className="w-8 h-8"
            fill="#686583"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z" />
          </svg>
          <QrCode className="w-8 h-8 text-gray-600" />
        </div>
        <div className="w-16 h-16 border-2 border-gray-300 rounded flex items-center justify-center flex-col bg-white">
          <svg
            className="w-6 h-6"
            fill="#686583"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z" />
          </svg>
          <QrCode className="w-8 h-8 text-gray-600" />
        </div>
      </div>

      <div className="space-y-3 max-w-lg mx-auto">
        <p className="text-sm text-foreground">
          {t("qrCodes.generateDocSuccess")}
        </p>
      </div>

      {/* <Button
        onClick={handleDownload}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
      >
        <Download className="w-4 h-4" />
        Download PDF
      </Button> */}
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case "building-selection":
        return t("qrCodes.buildingSelection");
      case "spaces-assets":
        return t("qrCodes.spacesAndAssets");
      case "printing-format":
        return t("qrCodes.printingFormat");
      case "generate-document":
        return t("qrCodes.generateDocument");
      default:
        return "";
    }
  };

  // Dynamic step numbering based on whether building step is shown
  const showBuildingStep = !selectedBuildingId;

  const getStepNumber = (step: Step): number => {
    if (showBuildingStep) {
      // All 4 steps visible
      switch (step) {
        case "building-selection":
          return 1;
        case "spaces-assets":
          return 2;
        case "printing-format":
          return 3;
        case "generate-document":
          return 4;
        default:
          return 0;
      }
    } else {
      // Only 3 steps visible (building step hidden)
      switch (step) {
        case "spaces-assets":
          return 1;
        case "printing-format":
          return 2;
        case "generate-document":
          return 3;
        default:
          return 0;
      }
    }
  };

  const currentStepNumber = getStepNumber(currentStep);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-4xl  sm:max-h-[90vh] max-h-[95vh] p-0 flex flex-col overflow-hidden rounded-2xl">
          {/* FIXED HEADER – Clean & Responsive */}
          <DialogHeader className="shrink-0 px-6 py-5 gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold">
                {t("qrCodes.generateQrCodes")}
              </DialogTitle>
              <button
                onClick={handleClose}
                className=" rounded-lg p-2 opacity-70 hover:opacity-100 hover:bg-accent/70 transition-all"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {/* Responsive Progress Steps – Dynamically show/hide building step */}
            <div className="mt-6 flex items-center justify-center lg:justify-start gap-3 sm:gap-6 flex-wrap">
              {(showBuildingStep
                ? [
                    {
                      step: 1,
                      label: t("qrCodes.building"),
                      key: "building-selection" as Step,
                    },
                    {
                      step: 2,
                      label: t("qrCodes.spacesAndAssets"),
                      key: "spaces-assets" as Step,
                    },
                    {
                      step: 3,
                      label: t("qrCodes.printingFormat"),
                      key: "printing-format" as Step,
                    },
                    {
                      step: 4,
                      label: t("qrCodes.generateDocument"),
                      key: "generate-document" as Step,
                    },
                  ]
                : [
                    {
                      step: 1,
                      label: t("qrCodes.spacesAndAssets"),
                      key: "spaces-assets" as Step,
                    },
                    {
                      step: 2,
                      label: t("qrCodes.printingFormat"),
                      key: "printing-format" as Step,
                    },
                    {
                      step: 3,
                      label: t("qrCodes.generateDocument"),
                      key: "generate-document" as Step,
                    },
                  ]
              ).map((item, idx, arr) => {
                const stepNum = getStepNumber(item.key);
                const isCompleted = stepNum < currentStepNumber;
                const isCurrent = currentStep === item.key;

                return (
                  <div
                    key={item.key}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    <div
                      className={`flex items-center gap-2 text-sm font-medium transition-all ${
                        isCurrent ? "text-[#2E69E8FF]" : "text-muted-foreground"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          isCurrent
                            ? "bg-[#1759E8FF] text-white shadow-md"
                            : isCompleted
                              ? "bg-[#1759E8FF] text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {item.step}
                      </span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div
                        className={`w-8 sm:w-10 h-0.5 transition-all ${
                          isCompleted ? "bg-[#1759E8FF]" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </DialogHeader>

          {/* SCROLLABLE BODY – Only this scrolls */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-8">
            {isLoading ? (
              <PageLoadingSkeleton variant="tree" />
            ) : (
              <>
                {currentStep === "building-selection" &&
                  renderBuildingSelection()}
                {currentStep === "spaces-assets" && renderSpacesAssets()}
                {currentStep === "printing-format" && renderPrintingFormat()}
                {currentStep === "generate-document" &&
                  renderGenerateDocument()}
              </>
            )}
          </div>

          {/* FIXED FOOTER – Always visible */}
          <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                {/* Show back button unless on first step (building-selection when no sidebar building, or spaces-assets when sidebar building selected) */}
                {!(
                  currentStep === "building-selection" ||
                  (currentStep === "spaces-assets" && selectedBuildingId)
                ) && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBack}
                    className="gap-2"
                  >
                    {t("qrCodes.back")}
                  </Button>
                )}
              </div>
              <div className="flex gap-3 w-full sm:w-auto justify-center sm:justify-end">
                <Button variant="outline" size="lg" onClick={handleClose}>
                  {t("qrCodes.cancel")}
                </Button>
                {currentStep !== "generate-document" ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedToNextStep() || isGenerating}
                    size="lg"
                    className="min-w-32 text-white"
                  >
                    {isGenerating
                      ? t("qrCodes.generating")
                      : currentStep === "printing-format"
                        ? t("qrCodes.generate")
                        : t("qrCodes.next")}
                  </Button>
                ) : (
                  <Button
                    onClick={handleClose}
                    size="lg"
                    className="min-w-40 text-white"
                  >
                    {t("qrCodes.okay")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <PrintingInstructionsModal
        isOpen={showPrintingInstructions}
        onClose={() => setShowPrintingInstructions(false)}
      />
    </>
  );
};

export default QrGenerateModal;
