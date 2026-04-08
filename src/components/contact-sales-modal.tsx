import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Loader2, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserQuery, useOrganizationQuery } from "@/hooks/queries";
import { apiUrl } from "@/services/api";

interface ContactSalesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FEATURES = [
  {
    key: "qrReports",
    en: "Instant QR Code Reports",
    de: "Sofortige QR-Code-Berichte",
  },
  {
    key: "assetMgmt",
    en: "Central Asset Management",
    de: "Zentrale Anlagenverwaltung",
  },
  {
    key: "taskMgmt",
    en: "Task & Ticket Management",
    de: "Aufgaben- & Ticketverwaltung",
  },
  {
    key: "preventive",
    en: "Preventive Maintenance",
    de: "Vorbeugende Wartung",
  },
  { key: "docMgmt", en: "Document Management", de: "Dokumentenmanagement" },
  { key: "insights", en: "Smart Insights", de: "Intelligente Einblicke" },
];

export const ContactSalesModal: React.FC<ContactSalesModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const { data: currentUser } = useCurrentUserQuery();
  const { organization } = useOrganizationQuery();

  const [formData, setFormData] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    industry: "",
    locations: "",
    features: [] as string[],
    description: "",
    implementation: "",
    privacyAgreed: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form with user/org data when modal opens
  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        companyName: organization?.name || "",
        firstName: currentUser?.Name || "",
        lastName: currentUser?.Last_Name || "",
        email: currentUser?.Email || "",
      }));
    }
  }, [open, currentUser, organization]);

  const resetForm = () => {
    setFormData({
      companyName: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      industry: "",
      locations: "",
      features: [],
      description: "",
      implementation: "",
      privacyAgreed: false,
    });
  };

  const handleClose = (value: boolean) => {
    if (!value) resetForm();
    onOpenChange(value);
  };

  const toggleFeature = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(key)
        ? prev.features.filter((f) => f !== key)
        : [...prev.features, key],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.companyName ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.industry ||
      !formData.locations ||
      !formData.implementation ||
      !formData.privacyAgreed
    ) {
      toast({
        title: t("contactSales.error"),
        description: t("contactSales.fillRequired"),
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const lang = localStorage.getItem("language") || "en";
      const response = await fetch(`${apiUrl}/contact-sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": lang,
        },
        body: JSON.stringify({
          companyName: formData.companyName,
          contactFirstName: formData.firstName,
          contactLastName: formData.lastName,
          customerID : currentUser?._id,
          email: formData.email,
          phone: formData.phone,
          industry: formData.industry,
          locations: formData.locations,
          features: formData.features.map((key) => {
            const feat = FEATURES.find((f) => f.key === key);
            return feat ? (language === "de" ? feat.de : feat.en) : key;
          }),
          description: formData.description,
          implementation: formData.implementation,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      toast({
        title: t("contactSales.successTitle"),
        description: t("contactSales.successMsg"),
        variant: "success",
      });
      handleClose(false);
    } catch {
      toast({
        title: t("contactSales.error"),
        description: t("contactSales.errorMsg"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const industries =
    language === "de"
      ? [
          "Immobilien",
          "Gesundheitswesen",
          "Bildung",
          "Gastgewerbe",
          "Produktion",
          "Einzelhandel",
          "Öffentlicher Sektor",
          "Sonstiges",
        ]
      : [
          "Real Estate",
          "Healthcare",
          "Education",
          "Hospitality",
          "Manufacturing",
          "Retail",
          "Public Sector",
          "Other",
        ];

  const locationOptions = ["1-5", "6-20", "21-50", "51-100", "100+"];

  const implementationOptions =
    language === "de"
      ? [
          "Sofort",
          "In 1-3 Monaten",
          "In 3-6 Monaten",
          "In 6+ Monaten",
          "Nur Informationen sammeln",
        ]
      : [
          "Immediately",
          "In 1-3 months",
          "In 3-6 months",
          "In 6+ months",
          "Just gathering information",
        ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => handleClose(false)}
            className="absolute right-0 top-0 h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogTitle className="text-2xl font-bold">
            {t("contactSales.title")}
          </DialogTitle>
          <DialogDescription>{t("contactSales.subtitle")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Company Information Section */}
          <div>
            <h3 className="text-base font-semibold mb-1">
              {t("contactSales.companyInfo")}
            </h3>
            {currentUser?._id && (
              <div className="text-sm text-gray-600 mb-4">
                {t("organisation.customerId")}: {currentUser?._id}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label>{t("contactSales.companyName")} *</Label>
                <Input
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, companyName: e.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("contactSales.firstName")} *</Label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, firstName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>{t("contactSales.lastName")} *</Label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, lastName: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label>{t("contactSales.businessEmail")} *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>{t("contactSales.phone")}</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, phone: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Industry */}
          <div>
            <Label>{t("contactSales.industry")} *</Label>
            <Select
              value={formData.industry}
              onValueChange={(v) => setFormData((p) => ({ ...p, industry: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("contactSales.pleaseSelect")} />
              </SelectTrigger>
              <SelectContent>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of Locations */}
          <div>
            <Label>{t("contactSales.locations")} *</Label>
            <Select
              value={formData.locations}
              onValueChange={(v) =>
                setFormData((p) => ({ ...p, locations: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("contactSales.pleaseSelect")} />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Relevant Features */}
          <div>
            <h3 className="text-base font-semibold mb-3">
              {t("contactSales.relevantFeatures")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((feat) => (
                <label
                  key={feat.key}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={formData.features.includes(feat.key)}
                    onCheckedChange={() => toggleFeature(feat.key)}
                  />
                  <span className="text-sm">
                    {language === "de" ? feat.de : feat.en}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Brief Description */}
          <div>
            <Label className="text-base font-semibold">
              {t("contactSales.briefDescription")}
            </Label>
            <Textarea
              placeholder={t("contactSales.descriptionPlaceholder")}
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Planned Implementation */}
          <div>
            <Label>{t("contactSales.plannedImplementation")} *</Label>
            <Select
              value={formData.implementation}
              onValueChange={(v) =>
                setFormData((p) => ({ ...p, implementation: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("contactSales.pleaseSelect")} />
              </SelectTrigger>
              <SelectContent>
                {implementationOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Privacy Agreement */}
          <label className="flex items-start gap-2 cursor-pointer">
            <Checkbox
              checked={formData.privacyAgreed}
              onCheckedChange={(checked) =>
                setFormData((p) => ({ ...p, privacyAgreed: checked === true }))
              }
              className="mt-0.5"
            />
            <span className="text-sm text-muted-foreground">
              {t("contactSales.privacyText")}{" "}
              <a
                href="/datenschutz"
                target="_blank"
                className="text-primary underline hover:text-primary/80"
              >
                {t("contactSales.privacyPolicy")}
              </a>
              . *
            </span>
          </label>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 font-semibold"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isSubmitting
              ? t("contactSales.sending")
              : t("contactSales.sendRequest")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
