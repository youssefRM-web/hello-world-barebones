import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreditCard, Plus, Edit, Trash2, Home, Wallet, ReceiptText } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { apiService } from "@/services/api";
import { useOrganizationQuery, useCurrentUserQuery } from "@/hooks/queries";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const BillingTab = () => {
  const { t, language  } = useLanguage();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { executeRequest, isLoading } = useApi();
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const { organization, refetch } = useOrganizationQuery();

  const [billingInfo, setBillingInfo] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
  });

  const [billingAddress, setBillingAddress] = useState({
    sameAsCompany: false,
    address: "",
    zip: "",
    city: "",
    country: "germany",
  });

  useEffect(() => {
    if (organization) {
      setBillingInfo({
        companyName: organization.billingCompanyName || organization.name || "",
        firstName: organization.organizationOwner.Name || "",
        lastName: organization.organizationOwner.Last_Name || "",
      });

      const sameAsCompany = organization.billingSameAsCompanyAddress || false;
      
      if (sameAsCompany) {
        setBillingAddress({
          sameAsCompany: true,
          address: organization.address || "",
          zip: organization.zip || "",
          city: organization.city || "",
          country: organization.country || "",
        });
      } else {
        setBillingAddress({
          sameAsCompany: false,
          address: organization.billingAddress || "",
          zip: organization.billingZip || "",
          city: organization.billingCity || "",
          country: organization.billingCountry || "",
        });
      }
    }
  }, [organization]);

  const handleBillingInfoChange = (field: string, value: string) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string | boolean) => {
    if (field === "sameAsCompany" && value === true && organization) {
      setBillingAddress({
        sameAsCompany: true,
        address: organization.address || "",
        zip: organization.zip || "",
        city: organization.city || "",
        country: organization.country || "",
      });
    } else if (field === "sameAsCompany" && value === false) {
      setBillingAddress(prev => ({ ...prev, sameAsCompany: false }));
    } else {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSaveBilling = async () => {
    // Validate required fields
    const requiredFields: Record<string, string> = {
      address: billingAddress.address,
      zip: billingAddress.zip,
      city: billingAddress.city,
      country: billingAddress.country,
      companyName: billingInfo.companyName,
      firstName: billingInfo.firstName,
      lastName: billingInfo.lastName,
    };

    const errors: Record<string, boolean> = {};
    let hasError = false;
    Object.entries(requiredFields).forEach(([key, value]) => {
      if (!value || !value.trim()) {
        errors[key] = true;
        hasError = true;
      }
    });

    if (hasError) {
      setFieldErrors(errors);
      toast({
        title: t("organisation.error"),
        description: t("organisation.billingFieldsRequired"),
        variant: "destructive",
      });
      return;
    }

    setFieldErrors({});

    const payload = {
      billingCompanyName: billingInfo.companyName,
      billingFirstName: billingInfo.firstName,
      billingLastName: billingInfo.lastName,
      billingAddress: billingAddress.address,
      billingZip: billingAddress.zip,
      billingCity: billingAddress.city,
      billingCountry: billingAddress.country,
      billingSameAsCompanyAddress: billingAddress.sameAsCompany,
    };

    await executeRequest(
      () => apiService.post("organization/billing/update", payload),
      {
        successMessage: t("organisation.billingUpdated"),
        errorMessage: t("organisation.billingUpdateFailed"),
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const handleCancel = () => {
    setBillingInfo({
      companyName: "",
      firstName: "",
      lastName: "",
    });
    
    setBillingAddress({
      sameAsCompany: false,
      address: "",
      zip: "",
      city: "",
      country: "",
    });
  };

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("organisation.addPaymentMethod")}</DialogTitle>
            <DialogDescription className="pt-4">
              {t("organisation.noPaymentServices")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setIsModalOpen(false)}>{t("organisation.close")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    <div className="space-y-4 sm:space-y-6 max-w-[700px]">
      <Card className="border-none px-0 space-y-4 py-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ReceiptText className="w-7 h-7" color="#197DCAFF" />
            {t("organisation.billingInformation")}
          </CardTitle>
          <p className="text-sm text-gray-600">{t("organisation.billingInfoDesc")}</p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-full">
              <Label>{t("organisation.companyName")} *</Label>
              <Input 
                placeholder={t("organisation.companyName")} 
                className={`mt-1 ${fieldErrors.companyName ? "border-destructive" : ""}`}
                value={billingInfo.companyName}
                onChange={(e) => { handleBillingInfoChange("companyName", e.target.value); setFieldErrors(prev => ({ ...prev, companyName: false })); }}
              />
              {fieldErrors.companyName && <p className="text-xs text-destructive mt-1">{t("organisation.fieldRequired")}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">{t("organisation.firstName")} *</Label>
              <Input 
                id="first-name" 
                placeholder={t("organisation.firstNamePlaceholder")}
                className={fieldErrors.firstName ? "border-destructive" : ""}
                value={billingInfo.firstName}
                onChange={(e) => { handleBillingInfoChange("firstName", e.target.value); setFieldErrors(prev => ({ ...prev, firstName: false })); }}
              />
              {fieldErrors.firstName && <p className="text-xs text-destructive mt-1">{t("organisation.fieldRequired")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">{t("organisation.lastName")} *</Label>
              <Input 
                id="last-name" 
                placeholder={t("organisation.lastNamePlaceholder")}
                className={fieldErrors.lastName ? "border-destructive" : ""}
                value={billingInfo.lastName}
                onChange={(e) => { handleBillingInfoChange("lastName", e.target.value); setFieldErrors(prev => ({ ...prev, lastName: false })); }}
              />
              {fieldErrors.lastName && <p className="text-xs text-destructive mt-1">{t("organisation.fieldRequired")}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none px-0 space-y-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 text-orange-500">
              <Home className="w-7 h-7" color="#EA916EFF" />
            </div>
            {t("organisation.billingAddress")}
          </CardTitle>
          <p className="text-sm text-gray-600">{t("organisation.billingAddressDesc")}</p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="same-address"
              checked={billingAddress.sameAsCompany}
              onCheckedChange={(checked) => handleAddressChange("sameAsCompany", checked)}
            />
            <Label htmlFor="same-address" className="text-sm">{t("organisation.sameAsCompanyAddress")}</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing-address">{t("organisation.address")} *</Label>
              <Input 
                id="billing-address" 
                placeholder={t("organisation.streetAndNo")}
                className={fieldErrors.address ? "border-destructive" : ""}
                value={billingAddress.address}
                onChange={(e) => { handleAddressChange("address", e.target.value); setFieldErrors(prev => ({ ...prev, address: false })); }}
                disabled={billingAddress.sameAsCompany}
              />
              {fieldErrors.address && <p className="text-xs text-destructive mt-1">{t("organisation.fieldRequired")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-zip">{t("organisation.zip")} *</Label>
              <Input 
                id="billing-zip" 
                placeholder={t("organisation.zipCode")}
                className={fieldErrors.zip ? "border-destructive" : ""}
                value={billingAddress.zip}
                onChange={(e) => { handleAddressChange("zip", e.target.value); setFieldErrors(prev => ({ ...prev, zip: false })); }}
                disabled={billingAddress.sameAsCompany}
              />
              {fieldErrors.zip && <p className="text-xs text-destructive mt-1">{t("organisation.fieldRequired")}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing-city">{t("organisation.city")} *</Label>
              <Input 
                id="billing-city" 
                placeholder={t("organisation.cityName")}
                className={fieldErrors.city ? "border-destructive" : ""}
                value={billingAddress.city}
                onChange={(e) => { handleAddressChange("city", e.target.value); setFieldErrors(prev => ({ ...prev, city: false })); }}
                disabled={billingAddress.sameAsCompany}
              />
              {fieldErrors.city && <p className="text-xs text-destructive mt-1">{t("organisation.fieldRequired")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-country">{t("organisation.country")} *</Label>
              <Select
                value={billingAddress.country}
                onValueChange={(value) => { handleAddressChange("country", value); setFieldErrors(prev => ({ ...prev, country: false })); }}
                disabled={billingAddress.sameAsCompany}
              >
                <SelectTrigger className={`relative ${fieldErrors.country ? "border-destructive" : ""}`}>
                  <SelectValue placeholder={t("organisation.chooseCountry")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="germany">{t("organisation.germany")}</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.country && <p className="text-xs text-destructive mt-1">{t("organisation.fieldRequired")}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

          <div className="flex flex-col justify-end sm:flex-row gap-2 pt-4">
            <Button 
              variant="outline" 
              size="lg" 
              className="sm:w-auto"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {t("organisation.cancel")}
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 sm:w-auto" 
              size="lg"
              onClick={handleSaveBilling}
              disabled={isLoading}
            >
              {isLoading ? t("organisation.saving") : t("organisation.save")}
            </Button>
          </div>
    </div>
    </>
  );
};

export default BillingTab;
