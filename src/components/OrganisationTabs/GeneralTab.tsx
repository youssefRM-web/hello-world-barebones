import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrentUserQuery, useOrganizationQuery } from "@/hooks/queries";
import { useApi } from "@/hooks/useApi";
import { apiService, endpoints } from "@/services/api";
import { useReferenceData } from "@/hooks/useReferenceData";
import { useFormValidation } from "@/hooks/useFormValidation";
import { FormError } from "@/components/ui/form-error";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { isValidEmail } from "@/utils/emailValidation";
import PhoneInput, {
  parsePhoneValue,
  isValidPhoneNumber,
} from "@/components/ui/phone-input";
import CountrySelector from "@/components/country-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const GeneralTab = () => {
  const { t, language } = useLanguage();
  const { data: currentUser } = useCurrentUserQuery();
  const { checkOrganization } = useReferenceData();
  const { hasOrganization, refetch: refetchOrg } = useOrganizationQuery();
  const { executeRequest, isLoading: submitLoading } = useApi();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { errors, validateForm, clearError } = useFormValidation({
    name: { required: true, message: t("organisation.companyNameRequired") },
    email: { required: true, message: t("organisation.emailRequired") },
    address: { required: true, message: t("organisation.addressRequired") },
    zip: { required: true, message: t("organisation.zipRequired") },
    city: { required: true, message: t("organisation.cityRequired") },
    country: { required: true, message: t("organisation.countryRequired") },
  });

  const [phoneCountryCode, setPhoneCountryCode] = useState("+49");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    telephone: "",
    email: "",
    address: "",
    zip: "",
    city: "",
    country: "",
  });

  // Pre-fill form if organization exists
  useEffect(() => {
    const org =
      (hasOrganization &&
        typeof hasOrganization === "object" &&
        hasOrganization) ||
      currentUser?.Organization_id;

    if (org) {
      const tel = (org as any)?.telephone || "";
      const parsed = parsePhoneValue(tel);
      setPhoneCountryCode(parsed.countryCode);
      setPhoneNumber(parsed.number);
      setFormData({
        name: (org as any)?.name || "",
        telephone: tel,
        email: (org as any)?.email || "",
        address: (org as any)?.address || "",
        zip: (org as any)?.zip || "",
        city: (org as any)?.city || "",
        country: (org as any)?.country || "",
      });
    }
  }, [hasOrganization]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCreate = async (data: typeof formData) => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      const response = await executeRequest(() =>
        apiService.post(endpoints.organizations, {
          createOrganizationDto: data,
          userId: currentUser._id,
        }),
      );

      if (response && currentUser) {
        const orgId =
          (response as any)?.organization?._id ||
          (response as any)?.user?.Organization_id ||
          (response as any)?._id ||
          (response as any)?.id;

        if (orgId) {
          const storedUserInfo = localStorage.getItem("userInfo");
          if (storedUserInfo) {
            try {
              const parsed = JSON.parse(storedUserInfo);
              const res = response as { accessToken?: string };

              const updatedUserInfo: any = {
                ...parsed,
                company: orgId,
              };

              if (res.accessToken) {
                updatedUserInfo.accessToken = res.accessToken;
              }

              localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
            } catch (e) {
              // ignore JSON errors
            }
          }
        }

        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }

      toast({
        title: t("pages.organisation"),
        description: t("organisation.orgCreated"),
        variant: "success",
      });

      checkOrganization();
      refetchOrg();
    } catch (error) {
      toast({
        title: t("organisation.creationFailed"),
        description: t("organisation.somethingWentWrong"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (
    organizationId: string,
    data: typeof formData,
  ) => {
    if (!currentUser) return;

    setIsLoading(true);

    try {
      const response = await executeRequest(() =>
        apiService.patch(`${endpoints.organizations}/${organizationId}`, data),
      );

      if (response && currentUser) {
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }

      toast({
        title: t("pages.organisation"),
        description: t("organisation.orgUpdated"),
        variant: "success",
      });

      checkOrganization();
      refetchOrg();
    } catch (error) {
      toast({
        title: t("organisation.updateFailed"),
        description: t("organisation.somethingWentWrong"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    if (!validateForm(formData)) {
      toast({
        title: t("organisation.missingRequiredFields"),
        description: t("organisation.fillAllRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast({
        title: t("organisation.invalidEmail"),
        description: t("organisation.invalidEmailDesc"),
        variant: "destructive",
      });
      return;
    }

    if (!isValidPhoneNumber(phoneCountryCode, phoneNumber)) {
      toast({
        title: t("organisation.telephone"),
        description: t("organisation.invalidPhone"),
        variant: "destructive",
      });
      return;
    }
    // Combine phone for submission
    const submitData = {
      ...formData,
      telephone: `${phoneCountryCode}${phoneNumber.replace(/\s/g, "")}`,
    };

    const organizationId =
      (hasOrganization &&
        typeof hasOrganization === "object" &&
        (hasOrganization as any)?._id) ||
      currentUser?.Organization_id?._id;

    if (organizationId) {
      await handleUpdate(organizationId, submitData);
    } else {
      await handleCreate(submitData);
    }
  };

  return (
    <Card className="border-none px-0 py-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {t("organisation.businessInformation")}
        </CardTitle>
        <div className="text-sm text-gray-600">
          {t("organisation.customerId")}: {currentUser?._id}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 max-w-[700px]">
        <div className="">
          <div className="space-y-2">
            <Label htmlFor="name">{t("organisation.companyName")}</Label>
            <Input
              id="name"
              placeholder={t("organisation.companyName")}
              value={formData.name}
              onChange={(e) => {
                handleChange(e);
                clearError("name");
              }}
            />
            <FormError error={errors.name} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telephone">{t("organisation.telephone")}</Label>
            <PhoneInput
              countryCode={phoneCountryCode}
              phoneNumber={phoneNumber}
              onCountryCodeChange={setPhoneCountryCode}
              onPhoneNumberChange={setPhoneNumber}
              placeholder={t("organisation.telephonePlaceholder")}
              error={errors.telephone}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("organisation.email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t("organisation.companyMail")}
              value={formData.email}
              onChange={(e) => {
                let value = e.target.value;
                value = value.replace(/\s/g, "");
                setFormData((prev) => ({
                  ...prev,
                  email: value,
                }));
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address">{t("organisation.address")}</Label>
            <Input
              id="address"
              placeholder={t("organisation.streetAndNo")}
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zip">{t("organisation.zip")}</Label>
            <Input
              id="zip"
              placeholder={t("organisation.zipCode")}
              value={formData.zip}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">{t("organisation.city")}</Label>
            <Input
              id="city"
              placeholder={t("organisation.cityName")}
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-country">
              {t("organisation.country")} *
            </Label>
            <Select
              value={formData.country}
              onValueChange={(val) => {
                handleSelectChange("country", val);
              }}
            >
              <SelectTrigger className="relative">
                <SelectValue placeholder={t("organisation.chooseCountry")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="germany">
                  {t("organisation.germany")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex w-full justify-end">
          <Button
            className="text-white hover:bg-blue-700"
            size="lg"
            onClick={handleSubmit}
            disabled={submitLoading}
          >
            {hasOrganization
              ? t("organisation.save")
              : t("organisation.create")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralTab;
