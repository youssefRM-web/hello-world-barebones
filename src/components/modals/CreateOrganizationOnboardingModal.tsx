import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PhoneInput, { isValidPhoneNumber } from "@/components/ui/phone-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApi } from "@/hooks/useApi";
import { apiService, endpoints } from "@/services/api";
import { toast } from "@/hooks/use-toast";
import { isValidEmail } from "@/utils/emailValidation";
import {
  Building2,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";

// REPLACE THIS WITH YOUR ACTUAL LOGO
import Logo from "../media/Mendigo_Logo.png";
import { useCurrentUserQuery, useOrganizationQuery } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import CountrySelector from "../country-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// If you don't have it in assets yet, use a placeholder:
// const Logo = "https://your-domain.com/logo.png";

interface CreateOrganizationOnboardingModalProps {
  open: boolean;
  userId: string;
}

const steps = [
  { id: 0, title: "Company", icon: Building2 },
  { id: 1, title: "Contact", icon: Briefcase },
  { id: 2, title: "Location", icon: MapPin },
];

const CreateOrganizationOnboardingModal: React.FC<
  CreateOrganizationOnboardingModalProps
> = ({ open, userId }) => {
  const { t, language } = useLanguage();
  const { executeRequest, isLoading } = useApi();
  const [currentStep, setCurrentStep] = useState(0);
  const { data: currentUser } = useCurrentUserQuery();
  const { hasOrganization, refetch: refetchOrg } = useOrganizationQuery();
  const queryClient = useQueryClient();

  const [phoneCountryCode, setPhoneCountryCode] = useState("+49");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    // business_type: "",
    telephone: "",
    email: currentUser?.Email || "",
    address: "",
    zip: "",
    city: "",
    country: "germany",
  });

  const totalSteps = steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const CurrentStepIcon = steps[currentStep].icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep((prev) => prev + 1);
    else handleSubmit();
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const validateStep = (): any => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== "";
      // && formData.business_type !== "";
      case 1:
        return (
          phoneNumber.trim() !== "" &&
          isValidPhoneNumber(phoneCountryCode, phoneNumber) &&
          formData.email.trim() !== "" &&
          isValidEmail(formData.email)
        );
      case 2:
        return (
          formData.address && formData.zip && formData.city && formData.country
        );
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        telephone: `${phoneCountryCode}${phoneNumber.replace(/\s/g, "")}`,
      };
      const response = await executeRequest(() =>
        apiService.post(endpoints.organizations, {
          createOrganizationDto: submitData,
          userId,
        }),
      );

      // Update localStorage userInfo with company ID from created/updated organization
      if (response && currentUser) {
        const orgId =
          (response as any)?.organization?._id ||
          (response as any)?.user?.Organization_id ||
          (response as any)?._id ||
          (response as any)?.id ||
          ((hasOrganization as any)?._id ?? null);

        if (orgId) {
          const storedUserInfo = localStorage.getItem("userInfo");
          if (storedUserInfo) {
            try {
              const parsed = JSON.parse(storedUserInfo);

              // Cast response so TS knows it *may* contain accessToken
              const res = response as {
                accessToken?: string;
                organization?: any;
                user?: any;
              };

              const updatedUserInfo: any = {
                ...parsed,
                company: orgId,
              };

              // Update the token ONLY if backend returned it
              if (res.accessToken) {
                updatedUserInfo.accessToken = res.accessToken;
              }

              localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
            } catch (e) {
              // ignore JSON errors
            }
          }
        }

        // Invalidate and refetch the current user query
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      }

      toast({
        title: t("onboarding.welcomeTitle"),
        description: t("onboarding.welcomeDesc"),
        variant: "success",
      });

      // Navigate to getting started page after reload
      localStorage.setItem("mendigo_start_tutorial", "true");
      setTimeout(() => {
        window.location.href = "/dashboard/getting-started";
      });
    } catch {
      toast({
        title: t("onboarding.errorTitle"),
        description: t("onboarding.errorDesc"),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="p-0 rounded-2xl shadow-2xl border-0 max-h-[95vh] overflow-visible"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Logo + Header */}
        <div className="bg-gradient-to-br from-primary/6 flex flex-col items-center via-primary/4 to-background px-6 pt-8 pb-6 text-center">
          {/* LOGO */}
          <div className="w-40 h-12 flex items-center justify-center">
            <img
              src={Logo}
              alt="Mendigo Logo"
              className="object-cover drop-shadow-sm"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("onboarding.letsSetup")}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 -mt-3">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-center ${
                  i < steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    i <= currentStep
                      ? "bg-[#1759E8FF] text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon && <step.icon className="w-5 h-5" />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 transition-all ${
                      i < currentStep ? "bg-[#1759E8FF]" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          {/* <Progress value={progress} className="h-1.5" /> */}
        </div>

        {/* Step Content */}
        <div className="px-6 pb-6 max-h-[65vh]">
          {/* Step 1 */}
          {currentStep === 0 && (
            <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {t("onboarding.companyDetails")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("onboarding.tellUsAbout")}
                </p>
              </div>
              <div className="space-y-5 max-w-md mx-auto">
                <div className="space-y-2 ">
                  <Label>
                    {t("onboarding.companyName")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder={t("onboarding.acme")}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="h-11"
                  />
                </div>
                {/*  <div className="space-y-2">
                  <Label>
                    Business Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.business_type}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, business_type: v }))
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corporation">Corporation</SelectItem>
                      <SelectItem value="llc">LLC</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="sole-proprietorship">
                        Sole Proprietorship
                      </SelectItem>
                      <SelectItem value="non-profit">Non-Profit</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 1 && (
            <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {t("onboarding.contactInfo")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("onboarding.howCanWeReach")}
                </p>
              </div>
              <div className="space-y-5 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {t("onboarding.phone")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <PhoneInput
                    countryCode={phoneCountryCode}
                    phoneNumber={phoneNumber}
                    onCountryCodeChange={setPhoneCountryCode}
                    onPhoneNumberChange={setPhoneNumber}
                    placeholder={t("organisation.telephonePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t("onboarding.email")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="hello@company.com"
                    value={formData.email}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        email: value,
                      }));
                    }}
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 2 && (
            <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center">
                <h3 className="text-lg font-semibold">
                  {t("onboarding.yourLocation")}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("onboarding.setsTimezone")}
                </p>
              </div>
              <div className="space-y-5 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label>
                    {t("onboarding.streetAddress")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder={t("onboarding.address")}
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {t("onboarding.zipCode")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="80331"
                      value={formData.zip}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          zip: e.target.value,
                        }))
                      }
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t("onboarding.city")}{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder={t("onboarding.countryPlaceholder")}
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    {t("organisation.country")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    onValueChange={(val) => {
                      setFormData((prev) => ({ ...prev, country: val }));
                    }}
                  >
                    <SelectTrigger className="relative">
                      <SelectValue
                        placeholder={t("organisation.chooseCountry")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="germany">
                        {t("organisation.germany")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-5 bg-muted/30 border-t">
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("onboarding.back")}
          </Button>

          <Button
            size="lg"
            onClick={handleNext}
            disabled={!validateStep() || isLoading}
            className="px-8 font-medium shadow-lg"
          >
            {isLoading ? (
              t("onboarding.creating")
            ) : currentStep === totalSteps - 1 ? (
              <>
                {t("onboarding.completeSetup")}
                <CheckCircle2 className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                {t("onboarding.continue")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrganizationOnboardingModal;
