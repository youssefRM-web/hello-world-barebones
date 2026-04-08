import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { apiService, endpoints } from "@/services/api";
import { Eye } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { PreviewReportModal } from "../PublicReport/PreviewReportModal";
import { useReferenceData } from "@/contexts/ReferenceDataContext";

interface AreaForm {
  _id: string;
  label: string;
}

interface Organization {
  _id: string;
  name: string;
}

interface buildingProps {
  _id: string;
  label: string;
  areas: AreaForm[];
  organization_id: Organization;
  photo: string;
  address: string;
  zipCode: string;
  city: string;
  requireContactDetails: boolean;
  contactType: string;
  askForName: boolean;
  autoAccept: boolean;
  showReportedIssues?: boolean;
}

interface ReportFlowTabProps {
  building: buildingProps;
}

export function ReportFlowTab({ building }: ReportFlowTabProps) {
  const { t } = useLanguage();
  const { executeRequest, isLoading } = useApi();
  const queryClient = useQueryClient();
  const { refreshData } = useReferenceData();
  const [requireContact, setRequireContact] = useState(
    building.requireContactDetails ?? false
  );
  const [askForName, setAskForName] = useState(building.askForName ?? false);
  const [autoAccept, setAutoAccept] = useState(building.autoAccept ?? false);
  const [showReportedIssues, setShowReportedIssues] = useState(building.showReportedIssues ?? true);
  const [contactMethod, setContactMethod] = useState(
    building.contactType ?? "email"
  );
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setRequireContact(building.requireContactDetails ?? false);
    setAskForName(building.askForName ?? false);
    setAutoAccept(building.autoAccept ?? false);
    setShowReportedIssues(building.showReportedIssues ?? true);
    setContactMethod(building.contactType ?? "email");
  }, [building._id, building.requireContactDetails, building.askForName, building.autoAccept, building.showReportedIssues, building.contactType]);

  const updateSetting = useCallback(
    async (field: string, value: boolean | string) => {
      try {
        await apiService.patch(`${endpoints.buildings}/${building._id}`, {
          [field]: value,
        });
        await refreshData()
        await queryClient.invalidateQueries({ queryKey: ["buildings"] });
        await queryClient.invalidateQueries({ queryKey: ["affectedBuildings"] });
        await queryClient.refetchQueries({ queryKey: ["buildings"] });

        toast({
          title: t("buildings.general"),
          description: t("buildings.settingsUpdatedSuccess"),
          variant: "success",
        });
      } catch (error) {
        console.error("Error updating setting:", error);
        toast({
          title: t("buildings.general"),
          description: t("buildings.settingsUpdateFailed"),
          variant: "destructive",
        });
      } 
    },
    [building._id, queryClient, t]
  );

  const handleRequireContactChange = async (checked: boolean) => {
    setRequireContact(checked);
    await updateSetting("requireContactDetails", checked);
  };

  const handleAskForNameChange = async (checked: boolean) => {
    setAskForName(checked);
    await updateSetting("askForName", checked);
  };

  const handleAutoAcceptChange = async (checked: boolean) => {
    setAutoAccept(checked);
    await updateSetting("autoAccept", checked);
  };

  const handleShowReportedIssuesChange = async (checked: boolean) => {
    setShowReportedIssues(checked);
    await updateSetting("showReportedIssues", checked);
  };

  const handleContactMethodChange = async (value: string) => {
    setContactMethod(value);
    await updateSetting("contactType", value);
  };

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button
            className="bg-[#1759E8FF] hover:bg-blue-700 text-primary-foreground"
            onClick={handlePreview}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t("buildings.reportFlowPreview")}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Contact Method Selector */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">
                {t("buildings.contactDetailsLabel")} <span className="text-muted-foreground text-sm first-letter:uppercase">
                  {" "}
                  ({t("buildings.optional")})
                </span>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("buildings.contactDetailsDesc")}
              </p>
            </div>
            <div className="mt-3">
              <Select
                value={contactMethod}
                onValueChange={handleContactMethodChange}
              >
                <SelectTrigger className="w-48 relative">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    {t("buildings.emailOnly")}
                  </SelectItem>
                  <SelectItem value="phone">
                    {t("buildings.phoneOnly")}
                  </SelectItem>
                  <SelectItem value="email-and-phone">
                    {t("buildings.emailAndPhone")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ask for name */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {t("buildings.askForNameLabel")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("buildings.askForNameDesc")}
                </p>
              </div>
              <Switch
                checked={askForName}
                onCheckedChange={handleAskForNameChange}
              />
            </div>
          </div>

          {/* Require contact */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {t("buildings.requireContactLabel")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("buildings.requireContactDesc")}
                </p>
              </div>
              <Switch
                checked={requireContact}
                onCheckedChange={handleRequireContactChange}
              />
            </div>
          </div>

          {/* Show reported issues */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {t("buildings.showReportedIssuesLabel")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("buildings.showReportedIssuesDesc")}
                </p>
              </div>
              <Switch
                checked={showReportedIssues}
                onCheckedChange={handleShowReportedIssuesChange}
              />
            </div>
          </div>
        </div>
      </div>

      <PreviewReportModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        linkedToType="space"
        linkedToId="preview"
        organizationId={building.organization_id?._id || ""}
        buildingId={building._id}
        name={building.label}
        previewMode={true}
        previewSettings={{
          requireContactDetails: requireContact,
          askForName: askForName,
          contactType: contactMethod,
        }}
      />
    </>
  );
}
