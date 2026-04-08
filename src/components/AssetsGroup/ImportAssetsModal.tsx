import React, { useState, useRef, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Download,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import { useGroupsQuery } from "@/hooks/queries";
import { apiUrl } from "@/services/api";
import axios from "axios";
import * as XLSX from "xlsx";
import { queryClient } from "@/lib/queryClient";

interface ImportAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedAsset {
  name: string;
  buildingName: string;
  areaName: string;
  spaceName: string;
  groupName: string;
  categoryName: string;
  supplier: string;
  serialNumber: string;
  isValid: boolean;
  errors: string[];
  building_id?: string;
  area_id?: string;
  space_id?: string;
  group_id?: string;
  category_id?: string;
}

// Security: Maximum file size (5MB)
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Security: Allowed file extensions
const ALLOWED_EXTENSIONS = [".xlsx", ".xls"];

// Security: Maximum rows to prevent DoS
const MAX_ROWS = 1000;

// Security: Sanitize string input to prevent injection
const sanitizeString = (value: any): string => {
  if (value === null || value === undefined) return "";

  let str = String(value).trim();

  // Remove HTML tags
  str = str.replace(/<[^>]*>/g, "");

  // Remove JavaScript event handlers
  str = str.replace(/on\w+\s*=/gi, "");

  // Remove script-related content
  str = str.replace(/javascript:/gi, "");
  str = str.replace(/vbscript:/gi, "");
  str = str.replace(/data:/gi, "");

  // Limit length
  str = str.substring(0, 500);

  return str;
};

// Security: Validate file has no macros
const checkForMacros = (workbook: XLSX.WorkBook): boolean => {
  if (workbook.vbaraw) {
    return true;
  }

  const suspiciousPatterns = [
    /^_xlnm/i,
    /auto_open/i,
    /auto_close/i,
    /workbook_open/i,
    /workbook_close/i,
  ];

  for (const sheetName of workbook.SheetNames) {
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(sheetName)) {
        return true;
      }
    }
  }

  return false;
};

// Security: Validate file extension
const validateFileExtension = (fileName: string): boolean => {
  const extension = fileName.toLowerCase().slice(fileName.lastIndexOf("."));
  return ALLOWED_EXTENSIONS.includes(extension);
};

const ImportAssetsModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ImportAssetsModalProps) => {
  const { t } = useLanguage();
  const { buildings, spaces, categories, refreshData, refreshAssets } =
    useReferenceData();
  const { selectedBuildingId } = useBuildingSelection();
  const { data: groups = [] } = useGroupsQuery();

  // Get filtered buildings based on sidebar selection
  const filteredBuildings = useMemo(() => {
    return selectedBuildingId
      ? buildings.filter((b) => b._id === selectedBuildingId)
      : buildings;
  }, [buildings, selectedBuildingId]);

  // Get the selected building name for display
  const selectedBuildingName = useMemo(() => {
    return selectedBuildingId
      ? buildings.find((b) => b._id === selectedBuildingId)?.label
      : null;
  }, [buildings, selectedBuildingId]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedAssets, setParsedAssets] = useState<ParsedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [step, setStep] = useState<"upload" | "preview">("upload");

  const resetState = () => {
    setSelectedFile(null);
    setParsedAssets([]);
    setParseError(null);
    setStep("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Column header keys for template and import mapping
  const columnHeaders = {
    assetName: t("assets.colAssetName"),
    buildingName: t("assets.colBuildingName"),
    areaName: t("assets.colAreaName"),
    spaceName: t("assets.colSpaceName"),
    groupName: t("assets.colGroupName"),
    category: t("assets.colCategory"),
    supplier: t("assets.colSupplier"),
    id: t("assets.colIdNumber"),
  };

  // All known aliases for each column (EN + DE + common variations)
  const columnAliases = {
    assetName: ["Asset Name", "Anlagenname", "name", "Name"],
    buildingName: ["Building Name", "Gebäudename", "building", "Building"],
    areaName: ["Area Name", "Bereichsname", "area", "Area"],
    spaceName: ["Space Name", "Raumname", "space", "Space"],
    groupName: ["Group Name", "Gruppenname", "group", "Group"],
    category: ["Category", "Kategorie", "category", "Category Name"],
    supplier: ["Supplier", "Lieferant", "supplier"],
    id: ["ID", "ID Number", "id", "Id", "ID-Nummer"],
  };

  const resolveColumn = (row: any, aliases: string[]): string => {
    for (const alias of aliases) {
      if (row[alias] !== undefined && row[alias] !== null) {
        return sanitizeString(row[alias]);
      }
    }
    return "";
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        [columnHeaders.assetName]: "Example Asset 1",
        [columnHeaders.buildingName]: "Main Building",
        [columnHeaders.areaName]: "Floor 1",
        [columnHeaders.spaceName]: "Room 101",
        [columnHeaders.groupName]: "HVAC Equipment",
        [columnHeaders.category]: "Equipment",
        [columnHeaders.supplier]: "ABC Supplies",
        [columnHeaders.id]: "SN-001234",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assets Template");

    ws["!cols"] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
    ];

    XLSX.writeFile(wb, "assets_import_template.xlsx");

    toast({
      title: t("assets.templateDownloaded"),
      description: t("assets.templateDownloadedDesc"),
      variant: "success",
    });
  };

  const validateAndMapAsset = (row: any): ParsedAsset => {
    const errors: string[] = [];

    // Use alias-based column resolution for both EN and DE headers
    const name = resolveColumn(row, columnAliases.assetName);
    const buildingName = resolveColumn(row, columnAliases.buildingName);
    const areaName = resolveColumn(row, columnAliases.areaName);
    const spaceName = resolveColumn(row, columnAliases.spaceName);
    const groupName = resolveColumn(row, columnAliases.groupName);
    const categoryName = resolveColumn(row, columnAliases.category);
    const supplier = resolveColumn(row, columnAliases.supplier);
    const serialNumber = resolveColumn(row, columnAliases.id);

    // Validate required fields
    if (!name) {
      errors.push("Asset name is required");
    }
    if (!buildingName) {
      errors.push("Building name is required");
    }

    // Find matching building (respect sidebar building selection)
    const matchedBuilding = filteredBuildings.find(
      (b) => b.label.toLowerCase() === buildingName.toLowerCase() && !b.archived
    );

    if (buildingName && !matchedBuilding) {
      if (selectedBuildingId) {
        const existsInAll = buildings.find(
          (b) =>
            b.label.toLowerCase() === buildingName.toLowerCase() && !b.archived
        );
        if (existsInAll) {
          errors.push(`Building "${buildingName}" is not the selected building`);
        } else {
          errors.push(`Building "${buildingName}" not found`);
        }
      } else {
        errors.push(`Building "${buildingName}" not found`);
      }
    }

    // Find matching area within the building (optional)
    let matchedArea = null;
    if (matchedBuilding && areaName) {
      matchedArea = matchedBuilding.areas?.find(
        (a: any) => a.label.toLowerCase() === areaName.toLowerCase()
      );
      if (!matchedArea) {
        errors.push(
          `Area "${areaName}" not found in building "${buildingName}" (will be skipped)`
        );
      }
    }

    // Find matching space (optional)
    let matchedSpace = null;
    if (spaceName) {
      matchedSpace = spaces.find((s) => {
        const spaceBuildingId =
          typeof s.building_id === "string" ? s.building_id : s.building_id?._id;
        const matchesBuilding = matchedBuilding
          ? spaceBuildingId === matchedBuilding._id
          : true;
        return (
          s.name.toLowerCase() === spaceName.toLowerCase() && matchesBuilding
        );
      });
      if (!matchedSpace) {
        errors.push(`Space "${spaceName}" not found (will be skipped)`);
      }
    }

    // Find matching group (optional)
    let matchedGroup = null;
    if (groupName) {
      matchedGroup = groups.find(
        (g) =>
          g.belongTo === "assets" &&
          g.name.toLowerCase() === groupName.toLowerCase()
      );
      if (!matchedGroup) {
        errors.push(`Asset group "${groupName}" not found (will be skipped)`);
      }
    }

    // Find matching category (optional)
    let matchedCategory = null;
    if (categoryName) {
      matchedCategory = categories.find(
        (c) => c.label.toLowerCase() === categoryName.toLowerCase()
      );
      if (!matchedCategory) {
        errors.push(`Category "${categoryName}" not found (will be skipped)`);
      }
    }

    return {
      name,
      buildingName,
      areaName,
      spaceName,
      groupName,
      categoryName,
      supplier,
      serialNumber,
      isValid: errors.filter((e) => !e.includes("will be skipped")).length === 0,
      errors,
      building_id: matchedBuilding?._id,
      area_id: matchedArea?._id,
      space_id: matchedSpace?._id,
      group_id: matchedGroup?._id,
      category_id: matchedCategory?._id,
    };
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setParseError(null);
    setParsedAssets([]);

    try {
      // Security: Validate file extension
      if (!validateFileExtension(file.name)) {
        throw new Error(
          "Invalid file type. Only .xlsx and .xls files are allowed."
        );
      }

      // Security: Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error(
          `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`
        );
      }

      // Read file
      const arrayBuffer = await file.arrayBuffer();

      // Security: Parse with options that disable macros and external links
      const workbook = XLSX.read(arrayBuffer, {
        type: "array",
        cellFormula: false,
        cellHTML: false,
        cellText: false,
        cellStyles: false,
        bookVBA: true,
      });

      // Security: Check for macros
      if (checkForMacros(workbook)) {
        throw new Error(
          "Security Error: This file contains macros which are not allowed. Please remove macros and try again."
        );
      }

      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        throw new Error("No sheets found in the file.");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Security: Limit number of rows
      if (jsonData.length > MAX_ROWS) {
        throw new Error(
          `Too many rows. Maximum ${MAX_ROWS} rows allowed per import.`
        );
      }

      // Filter out empty rows (rows where all values are empty/whitespace)
      const filteredData = jsonData.filter((row: any) => {
        return Object.values(row).some((val) => {
          const str = String(val ?? "").trim();
          return str.length > 0;
        });
      });

      if (filteredData.length === 0) {
        throw new Error(
          "No data found in the file. Please check the file format."
        );
      }

      // Validate and map each row
      const assets = filteredData.map((row) => validateAndMapAsset(row));

      setSelectedFile(file);
      setParsedAssets(assets);
      setStep("preview");
    } catch (error: any) {
      console.error("Error parsing file:", error);
      setParseError(error.message || "Failed to parse file");
      toast({
        title: t("common.error"),
        description: error.message || "Failed to parse file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    const validAssets = parsedAssets.filter((a) => a.isValid);

    if (validAssets.length === 0) {
      toast({
        title: t("assets.noValidAssets"),
        description: t("assets.fixErrorsAndRetry"),
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    const token = JSON.parse(localStorage.getItem("userInfo") || "{}")
      ?.accessToken;

    let successCount = 0;
    let errorCount = 0;

    for (const asset of validAssets) {
      try {
        const payload = {
          name: asset.name,
          building_id: asset.building_id,
          area_id: asset.area_id || null,
          linked_space_id: asset.space_id || null,
          category_id: asset.category_id || null,
          supplier: asset.supplier || null,
          id_number: asset.serialNumber || null,
        };

        const response = await axios.post(`${apiUrl}/asset`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // If asset was created and has a group, update the group
        if (response.data?._id && asset.group_id) {
          const group = groups.find((g) => g._id === asset.group_id);
          if (group) {
            const existingAssetIds = (group.assets || []).map((a: any) =>
              typeof a === "string" ? a : a._id
            );
            await axios.put(
              `${apiUrl}/groups/${asset.group_id}`,
              { assets: [...existingAssetIds, response.data._id] },
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          }
        }

        successCount++;
      } catch (error) {
        console.error(`Error creating asset ${asset.name}:`, error);
        errorCount++;
      }
    }

    // Refresh data
    try {
      await refreshData();
      await refreshAssets();
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    } catch (e) {
      console.warn("Refresh after import had an issue:", e);
    }

    toast({
      title: t("assets.importComplete"),
      description: `${t("assets.importSuccess").replace("{count}", String(successCount))}${
        errorCount > 0 ? ` ${t("assets.importFailed").replace("{count}", String(errorCount))}` : ""
      }`,
      variant: successCount > 0 ? "success" : "destructive",
    });

    if (successCount > 0) {
      try {
        onSuccess();
      } catch (e) {
        console.warn("onSuccess callback error:", e);
      }
      handleClose();
    }

    setIsImporting(false);
  };

  const validCount = parsedAssets.filter((a) => a.isValid).length;
  const invalidCount = parsedAssets.filter((a) => !a.isValid).length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90dvh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              {t("assets.importAssetsFromExcel")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-9 w-9 rounded-full hover:bg-accent/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === "upload" && (
            <div className="space-y-6">
              {/* Building Selection Notice */}
              {selectedBuildingName && (
                <Alert className="border-blue-500/20 bg-blue-500/5">
                  <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-sm">
                    <strong>{t("assets.buildingFilterActive")}:</strong>{" "}
                    {t("assets.buildingFilterDesc").replace("{building}", selectedBuildingName)}
                  </AlertDescription>
                </Alert>
              )}

              {/* Security Notice */}
              <Alert className="border-primary/20 bg-primary/5">
                <Shield className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  <strong>{t("assets.securityNotice")}:</strong>{" "}
                  {t("assets.securityNoticeDesc")}
                </AlertDescription>
              </Alert>

              {/* Template Download */}
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t("assets.downloadTemplate")}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("assets.downloadTemplateDesc")}
                    </p>
                  </div>
                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    {t("assets.download")}
                  </Button>
                </div>
              </div>

              {/* File Upload Area */}
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      {t("assets.processingFile")}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{t("support.browseFiles")}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t("assets.dragAndDrop")}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {parseError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{parseError}</AlertDescription>
                </Alert>
              )}

              {/* Expected Columns */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">{t("assets.expectedColumns")}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>{t("assets.colAssetName")}</strong> ({t("assets.requiredField")}) - {t("assets.assetNameDesc")}</p>
                  <p><strong>{t("assets.colBuildingName")}</strong> ({t("assets.requiredField")}) - {t("assets.buildingNameDesc")}</p>
                  <p><strong>{t("assets.colAreaName")}</strong> ({t("assets.optionalField")}) - {t("assets.areaNameDesc")}</p>
                  <p><strong>{t("assets.colSpaceName")}</strong> ({t("assets.optionalField")}) - {t("assets.spaceNameDesc")}</p>
                  <p><strong>{t("assets.colGroupName")}</strong> ({t("assets.optionalField")}) - {t("assets.groupNameDesc")}</p>
                  <p><strong>{t("assets.colCategory")}</strong> ({t("assets.optionalField")}) - {t("assets.categoryDesc")}</p>
                  <p><strong>{t("assets.colSupplier")}</strong> ({t("assets.optionalField")}) - {t("assets.supplierDesc")}</p>
                  <p><strong>{t("assets.colIdNumber")}</strong> ({t("assets.optionalField")}) - {t("assets.serialNumberDesc")}</p>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {validCount} {t("assets.valid")}
                  </span>
                </div>
                {invalidCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {invalidCount} {t("assets.invalid")}
                    </span>
                  </div>
                )}
              </div>

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[400px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-10">{t("assets.statusCol")}</TableHead>
                        <TableHead>{t("assets.assetNameCol")}</TableHead>
                        <TableHead>{t("assets.buildingCol")}</TableHead>
                        <TableHead>{t("assets.areaCol")}</TableHead>
                        <TableHead>{t("assets.spaceCol")}</TableHead>
                        <TableHead>{t("assets.groupCol")}</TableHead>
                        <TableHead>{t("assets.errorsCol")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedAssets.map((asset, index) => (
                        <TableRow
                          key={index}
                          className={!asset.isValid ? "bg-red-50/50" : ""}
                        >
                          <TableCell>
                            {asset.isValid ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {asset.name || "-"}
                          </TableCell>
                          <TableCell>{asset.buildingName || "-"}</TableCell>
                          <TableCell>{asset.areaName || "-"}</TableCell>
                          <TableCell>{asset.spaceName || "-"}</TableCell>
                          <TableCell>{asset.groupName || "-"}</TableCell>
                          <TableCell>
                            {asset.errors.length > 0 && (
                              <ul className="text-xs text-red-600 list-disc list-inside">
                                {asset.errors.map((error, i) => (
                                  <li key={i}>{error}</li>
                                ))}
                              </ul>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t bg-background flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {step === "upload" && t("assets.uploadHint")}
            {step === "preview" &&
              `${validCount} ${t("assets.assetsReadyToImport")}`}
          </div>
          <div className="flex items-center gap-3">
            {step === "preview" && (
              <Button variant="outline" onClick={resetState}>
                {t("assets.back")}
              </Button>
            )}
            <Button variant="outline" onClick={handleClose}>
              {t("assets.cancel")}
            </Button>
            {step === "preview" && (
              <Button
                onClick={handleImport}
                disabled={validCount === 0 || isImporting}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("assets.importing")}
                  </>
                ) : (
                  t("assets.importCount").replace("{count}", String(validCount))
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportAssetsModal;
