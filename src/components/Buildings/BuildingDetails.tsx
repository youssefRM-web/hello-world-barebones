import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreasTab } from "./AreasTab";
import { ReportFlowTab } from "./ReportFlowTab";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useApi } from "@/hooks/useApi";
import { apiService, apiUrl, endpoints } from "@/services/api";
import type { BuildingFormData } from "@/types";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useBuilding } from "@/contexts/BuildingContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { validateFileSize } from "@/utils/fileValidation";
import { toast } from "@/hooks/use-toast";

export default function BuildingDetails() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const { buildings, refreshData } = useReferenceData();
  const { executeRequest, isLoading } = useApi();
  const queryClient = useQueryClient();
  const { selectedBuilding, setSelectedBuilding } = useBuilding();
  const { hasPermission, isAdmin } = usePermissions();

  const activeTab = searchParams.get("tab") || "general";
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  const building = buildings.find((b) => b._id === id);

  const [buildingName, setBuildingName] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [imgError, setImgError] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [removingImage, setRemovingImage] = useState(false);

  useEffect(() => {
    if (building) {
      setBuildingName(building.label || "");
      setAddress(building.address || "");
      setZipCode(building.zipCode || "");
      setCity(building.city || "");
    }
  }, [building]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFileSize(file, t)) {
      e.target.value = "";
      return;
    }
    const input = e.target;
    setFile(file);
    setUploadError("");
    await handleUpload(file, input);
  };

  const handleUpload = async (
    fileToUpload: File,
    inputElement?: HTMLInputElement
  ) => {
    if (!fileToUpload) return;
    setLoading(true);
    setUploadError("");
    const formData = new FormData();
    formData.append("file", fileToUpload);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo?.accessToken;
      if (!token) throw new Error("User not authenticated");
      const { data } = await axios.post(
        `${apiUrl}/building/${building._id}/picture`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await refreshData();
      toast({
          title: t("pages.building"),
          description: t("buildings.updateSuccessfully"),
          variant: "success",
        });
      await queryClient.invalidateQueries({ queryKey: ["affectedBuildings"] });
      await queryClient.invalidateQueries({ queryKey: ["buildings"] });
      await queryClient.invalidateQueries({ queryKey: ["orgBuildings"] });
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
      setFile(null);
      if (inputElement) inputElement.value = "";
    }
  };

  const handleRemoveImage = async () => {
    setRemovingImage(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const token = userInfo?.accessToken;
      await axios.delete(`${apiUrl}/building/${building._id}/remove-picture`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshData();
      toast({
          title: t("pages.building"),
          description: t("buildings.updateSuccessfully"),
          variant: "success",
        });
      await queryClient.invalidateQueries({ queryKey: ["affectedBuildings"] });
      await queryClient.invalidateQueries({ queryKey: ["buildings"] });
      await queryClient.invalidateQueries({ queryKey: ["orgBuildings"] });
    } catch (err) {
      console.error("Error removing image:", err);
    } finally {
      setRemovingImage(false);
    }
  };

  const handleSave = async () => {
    if (!building) return;
    await executeRequest(() =>
      apiService.patch(`${endpoints.buildings}/${building._id}`, {
        label: buildingName,
        address,
        zipCode,
        city,
      })
    );
    await refreshData();
     toast({
          title: t("pages.building"),
          description: t("buildings.updateSuccessfully"),
          variant: "success",
        });
    await queryClient.invalidateQueries({ queryKey: ["affectedBuildings"] });
    await queryClient.invalidateQueries({ queryKey: ["buildings"] });
    await queryClient.invalidateQueries({ queryKey: ["orgBuildings"] });
  };

  if (!building) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        {t("buildings.notFound")}
      </div>
    );
  }

  const canManageCategories = isAdmin || hasPermission("buildings", "manageCategories");
  const canManageReportFlow = isAdmin || hasPermission("buildings", "manageReportFlow");

  return (
    <div className="flex flex-col gap-6">
      <main className="flex-1 p-6">
        <div className="flex flex-col gap-6 ">
          <div className="flex items-center gap-4">
            <Link to="/dashboard/building">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-semibold first-letter:uppercase">{building.label}</h1>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="mb-6 gap-2 lg:gap-6">
              <TabsTrigger value="general">
                {t("buildings.general")}
              </TabsTrigger>
              <TabsTrigger value="areas">{t("buildings.areas")}</TabsTrigger>
              {canManageReportFlow && (
                <TabsTrigger value="report-flow">
                  {t("buildings.reportFlow")}
                </TabsTrigger>
              )}
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6 max-w-[700px]">
              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>{t("buildings.uploadPhoto")}</Label>
                <p className="text-sm text-gray-600">
                  {t("buildings.photoFormat")}
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative h-24 w-24   rounded-lg  font-semibold">
                    {building.photo && !imgError ? (
                      <img
                        src={building.photo}
                        alt={building.label}
                        className="w-full h-full object-cover rounded-md "
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <span className="bg-[#0F4C7BFF]  w-full h-full flex items-center rounded-lg justify-center text-white text-2xl">
                        {building.label?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    )}
                    {(loading || removingImage) && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {uploadError && (
                      <p className="text-xs text-[#DE3B40FF]">{uploadError}</p>
                    )}
                    <div className="flex gap-2">
                      <label htmlFor="file-upload">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          disabled={loading || removingImage}
                          className="cursor-pointer"
                        >
                          <span>
                            {loading
                              ? "Uploading..."
                              : t("buildings.chooseImage")}
                          </span>
                        </Button>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          disabled={loading || removingImage}
                        />
                      </label>
                      {building.photo && !imgError && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          disabled={loading || removingImage}
                        >
                          {removingImage ? t("buildings.removing") : t("buildings.remove")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Building Details Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="building-name">
                    {t("buildings.buildingName")}
                  </Label>
                  <Input
                    id="building-name"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("buildings.address")}</Label>
                  <Input
                    id="address"
                    placeholder={t("buildings.streetNameNumber")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip-code">{t("buildings.zipCode")}</Label>
                    <Input
                      id="zip-code"
                      placeholder={t("buildings.zipCode")}
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">{t("buildings.city")}</Label>
                    <Input
                      id="city"
                      placeholder={t("buildings.cityName")}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  className="text-white "
                  onClick={handleSave}
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? t("buildings.saving") : t("buildings.save")}
                </Button>
              </div>
            </TabsContent>

            {/* Areas Tab */}
            <TabsContent value="areas" className="max-w-[700px]">
              <AreasTab 
                building={building} 
                id={building._id}
                onBuildingUpdated={async (updatedBuilding) => {
                  await refreshData();
                  await queryClient.invalidateQueries({ queryKey: ["affectedBuildings"] });
                  await queryClient.invalidateQueries({ queryKey: ["buildings"] });
                  if (selectedBuilding?._id === building._id) {
                    setSelectedBuilding(updatedBuilding);
                  }
                }}
              />
            </TabsContent>

            {/* Report Flow Tab */}
            {canManageReportFlow && (
              <TabsContent value="report-flow" className="max-w-[700px]">
                <ReportFlowTab key={building._id} building={building} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
