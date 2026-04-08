import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Copy, Check, MapPin } from "lucide-react";
import { useOrganizationQuery } from "@/hooks/queries";
import { useApi } from "@/hooks/useApi";
import { apiService, endpoints } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const SettingsTab = () => {
  const { organization, refetch } = useOrganizationQuery();
  const { executeRequest } = useApi();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  const [publicReportingEnabled, setPublicReportingEnabled] = useState(false);
  const [requireContact, setRequireContact] = useState(false);
  const [contactMethod, setContactMethod] = useState("email");
  const [askForName, setAskForName] = useState(false);
  const [autoAccept, setAutoAccept] = useState(false);

  useEffect(() => {
    if (organization) {
      setPublicReportingEnabled(organization.publicReportingEnabled || false);
      setRequireContact(organization.requireContactDetails || false);
      setContactMethod(organization.contactType || "email");
      setAskForName(organization.askForName || false);
      setAutoAccept(organization.autoAccept || false);
    }
  }, [organization]);

  const updateSetting = async (updateData: any) => {
    if (!organization) return;

    const result = await executeRequest(
      () =>
        apiService.patch(
          `${endpoints.organizations}/${organization._id}`,
          updateData
        ),
      {
        successMessage: t("organisation.settingsUpdated"),
      }
    );

    if (result) {
      refetch();
    }
  };

  const handlePublicReportingChange = (value: boolean) => {
    setPublicReportingEnabled(value);
    updateSetting({ publicReportingEnabled: value });
  };

  const handleRequireContactChange = (value: boolean) => {
    setRequireContact(value);
    updateSetting({ requireContactDetails: value });
  };

  const handleContactMethodChange = (value: string) => {
    setContactMethod(value);
    updateSetting({ contactType: value });
  };

  const handleAskForNameChange = (value: boolean) => {
    setAskForName(value);
    updateSetting({ askForName: value });
  };

  const handleAutoAcceptChange = (value: boolean) => {
    setAutoAccept(value);
    updateSetting({ autoAccept: value });
  };

  const copyReportLink = () => {
    if (!organization) return;

    const link = `${window.location.origin}/report/location?org=${organization._id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({
      title: t("organisation.linkCopied"),
      description: t("organisation.linkCopiedDesc"),
      variant: "success"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-[700px]">
      <Card className="border-none px-0 py-6 space-y-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-7 h-7" />
            {t("organisation.publicReporting")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("organisation.publicReportingDesc")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                {t("organisation.enablePublicReporting")}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("organisation.enablePublicReportingDesc")}
              </p>
            </div>
            <Switch
              checked={publicReportingEnabled}
              onCheckedChange={handlePublicReportingChange}
            />
          </div>

          {publicReportingEnabled && organization && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <Label className="text-sm font-medium">
                {t("organisation.publicReportingLink")}
              </Label>
              <div className="flex gap-2">
                <Input
                  value={`${window.location.origin}/report/location?org=${organization._id}`}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyReportLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">{t("organisation.contactMethod")}</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("organisation.contactMethodDesc")}
              </p>
            </div>
            <div className="mt-3">
              <Select
                value={contactMethod}
                onValueChange={handleContactMethodChange}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">{t("organisation.emailOnly")}</SelectItem>
                  <SelectItem value="phone">{t("organisation.phoneOnly")}</SelectItem>
                  <SelectItem value="email-and-phone">{t("organisation.emailAndPhone")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                {t("organisation.requireContactDetails")}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("organisation.requireContactDetailsDesc")}
              </p>
            </div>
            <Switch
              checked={requireContact}
              onCheckedChange={handleRequireContactChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                {t("organisation.askForName")}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("organisation.askForNameDesc")}
              </p>
            </div>
            <Switch
              checked={askForName}
              onCheckedChange={handleAskForNameChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">
                {t("organisation.autoAcceptReports")}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t("organisation.autoAcceptReportsDesc")}
              </p>
            </div>
            <Switch
              checked={autoAccept}
              onCheckedChange={handleAutoAcceptChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
