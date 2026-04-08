import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Loader2, Trash2, UploadCloud, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, endpoints } from "@/services/api";
import { Map, Marker } from "pigeon-maps";
import { LanguageSelector } from "@/components/Common/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";

export function PublicReportLocationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const organizationId = searchParams.get("org") || "";
  const { t } = useLanguage();
  const { toast } = useToast();

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orgSettings, setOrgSettings] = useState<any>(null);
  const [address, setAddress] = useState(t("common.loading"));

  const [formData, setFormData] = useState({
    summary: "",
    description: "",
    name: "",
    email: "",
    phone: "",
    attachments: [] as {
      id: string;
      name: string;
      url: string;
      type: string;
    }[],
  });

  // Request location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError(error.message);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  }, []);

  // Fetch organization settings
  useEffect(() => {
    const fetchOrgSettings = async () => {
      try {
        const response = await apiService.get(
          `${endpoints.organizations}/${organizationId}`
        );
        setOrgSettings(response.data);
      } catch (error) {
        console.error("Error fetching organization settings:", error);
      }
    };

    if (organizationId) {
      fetchOrgSettings();
    }
  }, [organizationId]);

  // Reverse geocode location to address
  useEffect(() => {
    const getAddress = async () => {
      if (!location) return;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
        );
        const data = await response.json();
        setAddress(data.display_name || `${location.lat}, ${location.lng}`);
      } catch (error) {
        setAddress(`${location.lat}, ${location.lng}`);
      }
    };

    if (location) {
      getAddress();
    }
  }, [location]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (files) {
      Array.from(files).forEach((file) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast({
            title: t("common.error"),
            description: `"${file.name}" exceeds the maximum file size of ${MAX_FILE_SIZE_MB}MB.`,
            variant: "destructive",
          });
          return;
        }

        const newAttachment = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
        };
        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, newAttachment],
        }));
      });
    }
    event.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== id),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.summary.trim()) {
      toast({
        title: t("common.error"),
        description:
          t("publicReport.issueSummary") +
          " " +
          t("common.required").toLowerCase(),
        variant: "destructive",
      });
      return;
    }

    if (orgSettings?.requireContactDetails) {
      const contactType = orgSettings.contactType;
      if (
        (contactType === "email" || contactType === "email-and-phone") &&
        !formData.email.trim()
      ) {
        toast({
          title: t("common.error"),
          description:
            t("publicReport.yourEmail") +
            " " +
            t("common.required").toLowerCase(),
          variant: "destructive",
        });
        return;
      }
      if (
        (contactType === "phone" || contactType === "email-and-phone") &&
        !formData.phone.trim()
      ) {
        toast({
          title: t("common.error"),
          description:
            t("publicReport.yourPhone") +
            " " +
            t("common.required").toLowerCase(),
          variant: "destructive",
        });
        return;
      }
    }

    if (orgSettings?.askForName && !formData.name.trim()) {
      toast({
        title: t("common.error"),
        description:
          t("publicReport.yourName") + " " + t("common.required").toLowerCase(),
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: t("common.error"),
        description: "Location is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        issue_summary: formData.summary,
        additional_info: formData.description,
        organization: organizationId,
        reporter: {
          name: formData.name,
          email: formData.email,
        },
        location_name: address,
        location_coordinates: {
          lat: location.lat,
          lng: location.lng,
        },
        isAccepted: orgSettings?.autoAccept ? true : null,
        attachements: formData.attachments.map((att) => att.url),
      };

      await apiService.post(`${endpoints.issues}/public-report`, payload);
      setShowSuccess(true);
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description:
          error.response?.data?.message ||
          t("messages.error.somethingWentWrong"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportAnother = () => {
    setFormData({
      summary: "",
      description: "",
      name: "",
      email: "",
      phone: "",
      attachments: [],
    });
    setShowSuccess(false);
  };

  // Invalid org check
  if (!organizationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Invalid Link
          </h1>
          <p className="text-muted-foreground mb-4">
            This reporting link is not valid or is missing required parameters.
          </p>
          <Button onClick={() => navigate("/")}>Go to Home</Button>
        </div>
      </div>
    );
  }

  // Location error
  if (locationError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Location Access Required
          </h1>
          <p className="text-muted-foreground mb-4">{locationError}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Please enable location access in your browser settings to report
            issues.
          </p>
          <Button onClick={() => navigate("/")}>Go to Home</Button>
        </div>
      </div>
    );
  }

  // Loading location
  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Requesting Location...
          </h1>
          <p className="text-sm text-muted-foreground">
            Please allow location access to continue
          </p>
        </div>
      </div>
    );
  }

  // Loading org settings
  if (!orgSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Public reporting disabled
  if (!orgSettings.publicReportingEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {t("publicReport.publicReportingDisabled")}
          </h1>
          <p className="text-muted-foreground mb-4">
            {t("publicReport.publicReportingDisabledMessage")}
          </p>
          <Button onClick={() => navigate("/")}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 py-8">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 h-32 w-32">
              <img
                src="https://i.postimg.cc/2y8Hw12m/76e1253d-8c55-4b88-801b-e9ba18eae11e.png"
                className="object-cover"
                alt="Success"
              />
            </div>
            <h2 className="text-2xl font-semibold mb-3">
              {t("publicReport.thankYou")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              {t("publicReport.thankYouMessage")}
            </p>
            <Button
              variant="outline"
              onClick={handleReportAnother}
              className="w-full max-w-xs text-primary border-primary/30 hover:bg-primary/5"
            >
              {t("publicReport.reportAnother")}
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b pb-4 mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-semibold">
                  {t("publicReport.title")}
                </h1>
                <LanguageSelector className="w-32" />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {t("publicReport.subtitle")}
              </p>
            </div>

            <div className="space-y-6">
              {/* Location Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {t("publicReport.yourLocation")}
                </Label>
                <div className="w-full rounded-xl border border-border overflow-hidden shadow-sm">
                  <Map
                    center={[location.lat, location.lng]}
                    zoom={15}
                    height={280}
                  >
                    <Marker
                      width={50}
                      anchor={[location.lat, location.lng]}
                      color="hsl(var(--primary))"
                    />
                  </Map>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-foreground">{address}</p>
                  <p className="text-muted-foreground">
                    {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("publicReport.yourName")}{" "}
                  {orgSettings.askForName && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                <Input
                  id="name"
                  placeholder={t("publicReport.enterYourName")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="h-11 text-sm"
                />
              </div>

              {/* Contact Details */}
              {(orgSettings.contactType === "email" ||
                orgSettings.contactType === "email-and-phone") && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("publicReport.yourEmail")}{" "}
                    {orgSettings.requireContactDetails && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("publicReport.enterYourEmail")}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="h-11 text-sm"
                  />
                </div>
              )}

              {(orgSettings.contactType === "phone" ||
                orgSettings.contactType === "email-and-phone") && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {t("publicReport.yourPhone")}{" "}
                    {orgSettings.requireContactDetails && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={t("publicReport.enterYourPhone")}
                    value={formData.phone}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({ ...prev, phone: onlyNumbers }));
                    }}
                    className="h-11 text-sm"
                  />
                </div>
              )}

              {/* Issue Summary */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  {t("publicReport.issueSummary")}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="summary"
                  placeholder={t("publicReport.describeIssueBriefly")}
                  value={formData.summary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      summary: e.target.value,
                    }))
                  }
                  className="min-h-32 resize-none text-sm"
                />
              </div>

              {/* Attachments */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t("publicReport.attachments")}{" "}
                  <span className="text-muted-foreground text-sm">
                    ({t("common.optional")})
                  </span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t("publicReport.addPhotos")}
                </p>

                <label
                  htmlFor="file-upload-input"
                  className="block w-full rounded-2xl bg-[#F2F2FD80] border-2 border-dashed border-[#636AE8FF] p-10 cursor-pointer hover:bg-[#636AE8FF]/10 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <UploadCloud size={54} color="#636AE8FF" />
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("file-upload-input")?.click();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-md"
                    >
                      {t("publicReport.browseFiles")}
                    </Button>
                  </div>
                </label>

                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  accept="image/*, video/mp4"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Preview Grid */}
                {formData.attachments.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {formData.attachments.map((att) => {
                      const isVideo = att.type?.startsWith("video/");
                      return (
                        <div
                          key={att.id}
                          className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <div className="aspect-square bg-muted/20">
                            {isVideo ? (
                              <div className="w-full h-full flex items-center justify-center bg-muted relative">
                                <video
                                  src={att.url}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Play className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            ) : (
                              <img
                                src={att.url}
                                alt={att.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={() => removeAttachment(att.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-xs text-white truncate">
                              {att.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full font-medium"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t("publicReport.submitting")}
                    </>
                  ) : (
                    t("publicReport.submitReport")
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
