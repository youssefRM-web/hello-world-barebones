import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCurrentUserQuery,
  useOrganizationQuery,
} from "@/hooks/queries";
import LoadingSpinner from "@/components/Common/LoadingSpinner";
import { format } from "date-fns";
import { Download, FileText, Loader2 } from "lucide-react";
import { apiService, endpoints } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
  taxAmount?: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  organizationId: string;
  planId: string;
  paymentId?: string;
  status: string;
  type: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  grossTotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  items: InvoiceItem[];
  billingInfo?: any;
  organizationInfo?: any;
  notes?: string;
  molliePaymentId?: string;
  isRecurring: boolean;
  recurringInterval?: string;
  nextInvoiceDate?: string;
  metadata?: any;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const InvoicesTab = () => {
  const { data: currentUser } = useCurrentUserQuery();
  const { organization } = useOrganizationQuery();
  const { toast } = useToast();
  const { t } = useLanguage();

  const {
    data: invoices,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["invoices", currentUser?.Organization_id?._id],
    queryFn: async (): Promise<Invoice[]> => {
      const response = await apiService.get<Invoice[]>(
        `${endpoints.invoices}/organization/${currentUser?.Organization_id?._id}`
      );
      return response.data || [];
    },
    enabled: !!currentUser?.Organization_id?._id,
  });

  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);

  // Invoice notification settings
  const registrationEmail = currentUser?.Email || "";
  const [notificationEmail, setNotificationEmail] = useState("");
  const [includeAttachment, setIncludeAttachment] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const savedEmail = organization?.invoiceNotificationEmail;
    const savedAttachment = organization?.includeInvoiceAttachment;
    setNotificationEmail(savedEmail || registrationEmail);
    if (typeof savedAttachment === "boolean") {
      setIncludeAttachment(savedAttachment);
    }
  }, [registrationEmail, organization]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await apiService.patch(
        `${endpoints.organizations}/${currentUser?.Organization_id?._id}`,
        {
          invoiceNotificationEmail: notificationEmail,
          includeInvoiceAttachment: includeAttachment,
        }
      );
      toast({
        title: t("organisation.success"),
        description: t("organisation.invoiceSettingsSaved"),
        variant: "success",
      });
    } catch (err: any) {
      console.error("Error saving invoice settings:", err);
      toast({
        title: t("organisation.error"),
        description: err.response?.data?.message || t("organisation.error"),
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    if (!invoice.invoiceUrl) {
      toast({
        title: t("organisation.error"),
        description: t("organisation.invoiceDownloadFailed"),
        variant: "destructive",
      });
      return;
    }

    setDownloadingInvoiceId(invoice._id);

    try {
      const response = await fetch(invoice.invoiceUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber || invoice._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast({
        title: t("organisation.error"),
        description: t("organisation.invoiceDownloadFailed"),
        variant: "destructive",
      });
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-600";
      case "sent":
      case "pending":
        return "bg-yellow-600";
      case "overdue":
      case "failed":
        return "bg-red-600";
      case "cancelled":
        return "bg-muted";
      case "draft":
        return "bg-muted-foreground";
      default:
        return "bg-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card className="pt-6 border-none px-0">
        <CardContent className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="pt-6 border-none px-0">
        <CardContent className="flex justify-center items-center py-12">
          <p className="text-destructive">{t("organisation.error")}</p>
        </CardContent>
      </Card>
    );
  }

  const invoiceSettingsCard = (
    <Card className="border-none mb-6">
      <CardContent className="pt-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          {t("organisation.invoiceSettings")}
        </h3>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="notificationEmail">
              {t("organisation.invoiceNotificationEmail")}
            </Label>
            <p className="text-sm text-muted-foreground">
              {t("organisation.invoiceNotificationEmailDesc")}
            </p>
            <Input
              id="notificationEmail"
              type="email"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              placeholder={registrationEmail}
              className="max-w-md"
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between max-w-md">
            <div className="space-y-1">
              <Label htmlFor="includeAttachment">
                {t("organisation.includeAttachment")}
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("organisation.includeAttachmentDesc")}
              </p>
            </div>
            <Switch
              id="includeAttachment"
              checked={includeAttachment}
              onCheckedChange={setIncludeAttachment}
            />
          </div>
          <div className="pt-2">
            <Button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              size="lg"
              className="flex items-center gap-2"
            >
              {isSavingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("organisation.save")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!invoices || invoices.length === 0) {
    return (
      <div className="space-y-6">
        {invoiceSettingsCard}
        <div className="flex flex-col items-center justify-center h-[40vh] text-center">
          <FileText className="h-12 w-12 text-muted-foreground/30 mb-2" />
          <p className="text-muted-foreground">
            {t("organisation.noInvoicesFound")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {invoiceSettingsCard}
      <Card className="pt-6 border-none">
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[10px]"></TableHead>
                  <TableHead className="min-w-[100px]">
                    {t("organisation.invoiceDate")}
                  </TableHead>
                  <TableHead className="min-w-[140px]">
                    {t("organisation.invoiceNo")}
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    {t("organisation.status")}
                  </TableHead>
                  <TableHead className="min-w-[100px]">
                    {t("organisation.amount")}
                  </TableHead>
                  <TableHead className="w-32"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell></TableCell>
                    <TableCell className="font-medium">
                      {format(new Date(invoice.issueDate), "dd.MM.yyyy")}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`${getStatusColor(invoice.status)} text-primary-foreground px-6 py-2 rounded-md text-sm whitespace-nowrap first-letter:uppercase`}
                      >
                        {t(`organisation.status${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1).toLowerCase()}`)}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.grossTotal.toFixed(2)} {invoice.currency}
                    </TableCell>
                    <TableCell>
                      {invoice.invoiceUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                          disabled={downloadingInvoiceId === invoice._id}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          {t("organisation.download")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoicesTab;
