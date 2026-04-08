import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useBuilding } from "@/contexts/BuildingContext";
import { useBuildingSelection } from "@/contexts/BuildingSelectionContext";
import { useGroupsQuery } from "@/hooks/queries";
import { apiUrl } from "@/services/api";
import axios from "axios";
import * as XLSX from "xlsx";

interface ImportSpacesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ParsedSpace {
    name: string;
    buildingName: string;
    areaName: string;
    spaceGroupName: string;
    additionalInformation: string;
    isValid: boolean;
    errors: string[];
    building_id?: string;
    area_id?: string;
    spaceGroup?: string;
}

// Security: Maximum file size (5MB)
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Security: Allowed file extensions
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls'];

// Security: Maximum rows to prevent DoS
const MAX_ROWS = 1000;

// Security: Sanitize string input to prevent injection
const sanitizeString = (value: any): string => {
    if (value === null || value === undefined) return "";

    // Convert to string
    let str = String(value).trim();

    // Remove potentially dangerous characters and patterns
    // Remove HTML tags
    str = str.replace(/<[^>]*>/g, "");

    // Remove JavaScript event handlers
    str = str.replace(/on\w+\s*=/gi, "");

    // Remove script-related content
    str = str.replace(/javascript:/gi, "");
    str = str.replace(/vbscript:/gi, "");
    str = str.replace(/data:/gi, "");

    // Limit length to prevent buffer overflow attacks
    str = str.substring(0, 500);

    // Escape special characters that could be used in injection
    return str;
};

// Security: Validate file has no macros (check for VBA project)
const checkForMacros = (workbook: XLSX.WorkBook): boolean => {
    // Check for VBA project stream
    if (workbook.vbaraw) {
        return true;
    }

    // Check sheet names for macro-related patterns
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
    const extension = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
    return ALLOWED_EXTENSIONS.includes(extension);
};

const ImportSpacesModal = ({
    isOpen,
    onClose,
    onSuccess,
}: ImportSpacesModalProps) => {
    const { t } = useLanguage();
    const { buildings, refreshData } = useReferenceData();
    const { selectedBuilding } = useBuilding();
    const { selectedBuildingId } = useBuildingSelection();
    const { data: groups = [] } = useGroupsQuery();

    // Get filtered buildings based on sidebar selection
    const filteredBuildings = selectedBuildingId
        ? buildings.filter(b => b._id === selectedBuildingId)
        : buildings;
    
    // Get the selected building name for display
    const selectedBuildingName = selectedBuildingId
        ? buildings.find(b => b._id === selectedBuildingId)?.label
        : null;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [parsedSpaces, setParsedSpaces] = useState<ParsedSpace[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [parseError, setParseError] = useState<string | null>(null);
    const [step, setStep] = useState<'upload' | 'preview'>('upload');

    const resetState = () => {
        setSelectedFile(null);
        setParsedSpaces([]);
        setParseError(null);
        setStep('upload');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const downloadTemplate = () => {
        // Create template workbook
        const templateData = [
            {
                "Space Name": "Example Space 1",
                "Building Name": "Main Building",
                "Area Name": "Floor 1",
                "Space Group": "Office Spaces",
                "Additional Information": "Near entrance"
            },
            {
                "Space Name": "Example Space 2",
                "Building Name": "Main Building",
                "Area Name": "Floor 2",
                "Space Group": "",
                "Additional Information": ""
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Spaces Template");

        // Set column widths
        ws['!cols'] = [
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 20 },
            { wch: 30 }
        ];

        XLSX.writeFile(wb, "spaces_import_template.xlsx");

        toast({
            title: t("spaces.templateDownloaded"),
            description: t("spaces.templateDownloadedDesc"),
            variant: "success"
        });
    };

    const validateAndMapSpace = (row: any): ParsedSpace => {
        const errors: string[] = [];

        // Sanitize all inputs
        const name = sanitizeString(row["Space Name"] || row["name"] || row["Name"]);
        const buildingName = sanitizeString(row["Building Name"] || row["building"] || row["Building"]);
        const areaName = sanitizeString(row["Area Name"] || row["area"] || row["Area"]);
        const spaceGroupName = sanitizeString(row["Space Group"] || row["spaceGroup"] || row["Group"]);
        const additionalInfo = sanitizeString(row["Additional Information"] || row["additionalInformation"] || row["Notes"] || "");

        // Validate required fields
        if (!name) {
            errors.push("Space name is required");
        }
        if (!buildingName) {
            errors.push("Building name is required");
        }
        if (!areaName) {
            errors.push("Area name is required");
        }

        // Find matching building (respect sidebar building selection)
        const matchedBuilding = filteredBuildings.find(
            b => b.label.toLowerCase() === buildingName.toLowerCase() && !b.archived
        );
        
if (buildingName && !matchedBuilding) {
    if (selectedBuildingId) {
        // Building exists but not in filtered selection
        const existsInAll = buildings.find(
            b => b.label.toLowerCase() === buildingName.toLowerCase() && !b.archived
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

        // Find matching area within the building
        let matchedArea = null;
        if (matchedBuilding && areaName) {
            matchedArea = matchedBuilding.areas?.find(
                (a: any) => a.label.toLowerCase() === areaName.toLowerCase()
            );
            if (!matchedArea) {
                errors.push(`Area "${areaName}" not found in building "${buildingName}"`);
            }
        }

        // Find matching space group (optional)
        let matchedGroup = null;
        if (spaceGroupName) {
            matchedGroup = groups.find(
                g => g.belongTo === "spaces" && g.name.toLowerCase() === spaceGroupName.toLowerCase()
            );
            if (!matchedGroup) {
                errors.push(`Space group "${spaceGroupName}" not found (will be skipped)`);
            }
        }

        return {
            name,
            buildingName,
            areaName,
            spaceGroupName,
            additionalInformation: additionalInfo,
            isValid: errors.filter(e => !e.includes("will be skipped")).length === 0,
            errors,
            building_id: matchedBuilding?._id,
            area_id: matchedArea?._id,
            spaceGroup: matchedGroup?._id,
        };
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setParseError(null);
        setParsedSpaces([]);

        try {
            // Security: Validate file extension
            if (!validateFileExtension(file.name)) {
                throw new Error("Invalid file type. Only .xlsx and .xls files are allowed.");
            }

            // Security: Validate file size
            if (file.size > MAX_FILE_SIZE_BYTES) {
                throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`);
            }

            // Read file
            const arrayBuffer = await file.arrayBuffer();

            // Security: Parse with options that disable macros and external links
            const workbook = XLSX.read(arrayBuffer, {
                type: 'array',
                cellFormula: false, // Disable formula parsing
                cellHTML: false,    // Disable HTML parsing
                cellText: false,    // Disable rich text
                cellStyles: false,  // Disable styles
                bookVBA: true,      // Detect VBA to check for macros
            });

            // Security: Check for macros
            if (checkForMacros(workbook)) {
                throw new Error("Security Error: This file contains macros which are not allowed. Please remove macros and try again.");
            }

            // Get first sheet
            const firstSheetName = workbook.SheetNames[0];
            if (!firstSheetName) {
                throw new Error("No sheets found in the file.");
            }

            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { blankrows: false });

            // Filter out ghost/empty rows
            const filteredData = jsonData.filter((row: any) => {
                return Object.values(row).some((val) => {
                    const str = String(val ?? "").trim();
                    return str.length > 0;
                });
            });

            // Security: Limit number of rows
            if (filteredData.length > MAX_ROWS) {
                throw new Error(`Too many rows. Maximum ${MAX_ROWS} rows allowed per import.`);
            }

            if (filteredData.length === 0) {
                throw new Error("No data found in the file. Please check the file format.");
            }

            // Validate and map each row
            const spaces = filteredData.map(row => validateAndMapSpace(row));

            setSelectedFile(file);
            setParsedSpaces(spaces);
            setStep('preview');

        } catch (error: any) {
            console.error("Error parsing file:", error);
            setParseError(error.message || "Failed to parse file");
            toast({
                title: "Error",
                description: error.message || "Failed to parse file",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async () => {
        const validSpaces = parsedSpaces.filter(s => s.isValid);

        if (validSpaces.length === 0) {
            toast({
                title: t("spaces.noValidSpaces"),
                description: t("spaces.fixErrorsAndRetry"),
                variant: "destructive",
            });
            return;
        }

        setIsImporting(true);
        const token = JSON.parse(localStorage.getItem("userInfo") || "{}")?.accessToken;

        let successCount = 0;
        let errorCount = 0;

        for (const space of validSpaces) {
            try {
                const payload: any = {
                    name: space.name,
                    building_id: space.building_id,
                    spaceGroup: space.spaceGroup || null,
                    additionalInformation: space.additionalInformation || null,
                };

                // Send area as both area_id and area object for compatibility
                if (space.area_id) {
                    payload.area_id = space.area_id;
                    // Find the area label for the area object
                    const building = buildings.find(b => b._id === space.building_id);
                    const area = building?.areas?.find((a: any) => a._id === space.area_id);
                    if (area) {
                        payload.area = { _id: area._id, label: area.label };
                    }
                }

                await axios.post(`${apiUrl}/space`, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                successCount++;
            } catch (error) {
                console.error(`Error creating space ${space.name}:`, error);
                errorCount++;
            }
        }

        // Refresh data
        await refreshData();

        toast({
            title: t("spaces.importComplete"),
            description: `${t("spaces.importSuccess").replace("{count}", String(successCount))}${errorCount > 0 ? ` ${t("spaces.importFailed").replace("{count}", String(errorCount))}` : ''}`,
            variant: successCount > 0 ? "success" : "destructive",
        });

        if (successCount > 0) {
            onSuccess();
            handleClose();
        }

        setIsImporting(false);
    };

    const validCount = parsedSpaces.filter(s => s.isValid).length;
    const invalidCount = parsedSpaces.filter(s => !s.isValid).length;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90dvh] p-0 gap-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
                {/* Header */}
                <DialogHeader className="p-6 pb-4 border-b bg-background">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            {t("spaces.importSpaces")}
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
                    {step === 'upload' && (
                        <div className="space-y-6">
                            {/* Building Selection Notice */}
                            {selectedBuildingName && (
                                <Alert className="border-blue-500/20 bg-blue-500/5">
                                    <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                                    <AlertDescription className="text-sm">
                                        <strong>{t("spaces.buildingFilterActive")}:</strong> {t("spaces.buildingFilterDesc").replace("{building}", selectedBuildingName || "")}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Security Notice */}
                            <Alert className="border-primary/20 bg-primary/5">
                                <Shield className="h-4 w-4 text-primary" />
                                <AlertDescription className="text-sm">
                                    <strong>{t("spaces.securityNotice")}:</strong> {t("spaces.securityNoticeDesc")}
                                </AlertDescription>
                            </Alert>

                            {/* Template Download */}
                            <div className="p-4 border rounded-lg bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium">{t("spaces.downloadTemplate")}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {t("spaces.downloadTemplateDesc")}
                                        </p>
                                    </div>
                                    <Button variant="outline" onClick={downloadTemplate}>
                                        <Download className="h-4 w-4 mr-2" />
                                        {t("spaces.downloadTemplate")}
                                    </Button>
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">{t("spaces.uploadExcelFile")}</Label>
                                <div
                                    className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {isLoading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                                            <p className="text-sm text-muted-foreground">{t("spaces.validatingFile")}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-sm font-medium">{t("support.browseFiles")}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {t("spaces.fileTypeHint")}
                                            </p>
                                        </>
                                    )}
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {parseError && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{parseError}</AlertDescription>
                                </Alert>
                            )}

                            {/* Expected Format */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium">{t("spaces.expectedColumns")}</h3>
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p><strong>Space Name</strong> ({t("spaces.required")}) - {t("spaces.spaceNameRequired")}</p>
                                    <p><strong>Building Name</strong> ({t("spaces.required")}) - {t("spaces.buildingNameRequired")}</p>
                                    <p><strong>Area Name</strong> ({t("spaces.required")}) - {t("spaces.areaNameRequired")}</p>
                                    <p><strong>Space Group</strong> ({t("spaces.optional")}) - {t("spaces.spaceGroupOptional")}</p>
                                    <p><strong>Additional Information</strong> ({t("spaces.optional")}) - {t("spaces.additionalInfoOptional")}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    <span>{validCount} {t("spaces.valid")}</span>
                                </div>
                                {invalidCount > 0 && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                        <span>{invalidCount} {t("spaces.withErrors")}</span>
                                    </div>
                                )}
                            </div>

                            {/* Preview Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <div className="max-h-[400px] overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10">Status</TableHead>
                                                <TableHead>Space Name</TableHead>
                                                <TableHead>Building</TableHead>
                                                <TableHead>Area</TableHead>
                                                <TableHead>Group</TableHead>
                                                <TableHead>Issues</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {parsedSpaces.map((space, index) => (
                                                <TableRow key={index} className={!space.isValid ? "bg-destructive/5" : ""}>
                                                    <TableCell>
                                                        {space.isValid ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium">{space.name || "-"}</TableCell>
                                                    <TableCell>{space.buildingName || "-"}</TableCell>
                                                    <TableCell>{space.areaName || "-"}</TableCell>
                                                    <TableCell>{space.spaceGroupName || "-"}</TableCell>
                                                    <TableCell className="text-xs text-destructive">
                                                        {space.errors.join(", ")}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <Button variant="ghost" onClick={resetState} className="text-sm">
                                {t("spaces.uploadDifferentFile")}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t bg-background/95 backdrop-blur px-6 py-4">
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={handleClose}>{t("spaces.cancel")}</Button>
                        {step === 'preview' && (
                            <Button
                                onClick={handleImport}
                                disabled={isImporting || validCount === 0}
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        {t("spaces.importing")}
                                    </>
                                ) : (
                                    t("spaces.importCount").replace("{count}", String(validCount))
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImportSpacesModal;