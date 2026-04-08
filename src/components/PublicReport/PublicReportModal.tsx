import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Trash2,
  UploadCloud,
  Play,
  FileText,
  Download,
  AlertCircle,
  Archive,
  ChevronRight,
  HelpCircle,
  Video,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Info,
  ImageOff,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiUrl, apiService, endpoints } from "@/services/api";
import { LanguageSelector } from "@/components/Common/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useLinkedIssuesQuery,
  type LinkedIssue,
} from "@/hooks/queries/useLinkedIssuesQuery";

import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";
import { formatDate } from "@/utils/dateUtils";
import dog from "../../assets/homepage/dog.webp";

const NoImagePlaceholder = ({
  className = "w-10 h-10",
}: {
  className?: string;
}) => (
  <div
    className={`${className} rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center flex-shrink-0`}
  >
    <ImageOff className="w-1/2 h-1/2 text-muted-foreground/50" />
  </div>
);
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface BuildingSettings {
  requireContactDetails?: boolean;
  askForName?: boolean;
  contactType?: string;
  showReportedIssues?: boolean;
}

interface LinkedAttachment {
  _id: string;
  name: string;
  url: string;
  visibility: string;
  createdAt: string;
  expirationDate?: string;
  expired: boolean;
}

// ReportedIssue interface is now imported as LinkedIssue from useLinkedIssuesQuery

export function PublicReportPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, setLanguage } = useLanguage();
  // Auto-detect system language on mount
  useEffect(() => {
    const browserShort = (navigator.language || "en")
      .split("-")[0]
      .toLowerCase();
    const detected = browserShort === "de" ? "de" : "en"; // fallback to en
    setLanguage(detected);
  }, []);

  const type = searchParams.get("type") as "space" | "asset" | null;
  const id = searchParams.get("id");
  const org = searchParams.get("org");
  const building = searchParams.get("building");
  const name = decodeURIComponent(searchParams.get("name") || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [buildingSettings, setBuildingSettings] =
    useState<BuildingSettings | null>(null);
  const [activeTab, setActiveTab] = useState("reported");
  const { refreshIssues } = useReferenceData();
  const [isOrgExpired, setIsOrgExpired] = useState(false);

  // New states for validation
  const [isValidating, setIsValidating] = useState(true);
  const [validationStatus, setValidationStatus] = useState<
    "loading" | "valid" | "archived" | "not_found"
  >("loading");
  const [itemName, setItemName] = useState(name);

  const [formData, setFormData] = useState({
    issue_summary: "",
    additional_info: "",
    reporter_name: "",
    reporter_email: "",
    reporter_phone: "",
    organizationId: org || "",
  });

  const [attachments, setAttachments] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [linkedAttachments, setLinkedAttachments] = useState<
    LinkedAttachment[]
  >([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<LinkedIssue | null>(null);
  const [issueDetailTab, setIssueDetailTab] = useState<"updates" | "pictures">(
    "updates",
  );

  // Use real-time linked issues query with WebSocket support
  const { data: allReportedIssues = [], isLoading: loadingIssues } =
    useLinkedIssuesQuery({
      linkedToId: id,
      organizationId: org,
      enableWebSocket: true,
    });

    // Check organization subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!org) return;
      try {
        const response = await apiService.get(`/organization/${org}/check-subscription`);
        const data = response.data as { status: string };
        if (data.status === "expired") {
          setIsOrgExpired(true);
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };
    checkSubscription();
  }, [org]);


  // Filter to only show accepted issues that are not done
  const reportedIssues = allReportedIssues.filter((issue) => {
    // Rule #1: Once doneOnce = true → ALWAYS hide, no matter the status
    if (issue.doneOnce === true) {
      return false;
    }

    // Rule #2: Show accepted tasks that are NOT yet Done
    if (issue.isAccepted === true && issue.status !== "Done") {
      return true;
    }

    // Rule #3: Show pending acceptance
    if (issue.isAccepted === null) {
      return true;
    }

    // Rule #4: Show tasks that are currently Done, but never done before
    if (issue.status === "Done" && issue.doneOnce === false) {
      return true;
    }

    // Hide everything else
    return false;
  });

  // Validate space/asset exists and check archived status
  useEffect(() => {
    const validateItem = async () => {
      if (!id || !type) {
        setValidationStatus("not_found");
        setIsValidating(false);
        return;
      }

      try {
        const endpoint =
          type === "space"
            ? `${endpoints.spaces}/${id}`
            : `${endpoints.assets}/${id}`;

        const response = await apiService.get(endpoint);
        const data = response.data as { archived?: boolean; name?: string };

        if (!data) {
          setValidationStatus("not_found");
        } else if (data.archived) {
          setValidationStatus("archived");
          if (data.name) setItemName(data.name);
        } else {
          setValidationStatus("valid");
          if (data.name) setItemName(data.name);
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          setValidationStatus("not_found");
        } else {
          setValidationStatus("not_found");
        }
      } finally {
        setIsValidating(false);
      }
    };
    validateItem();
  }, [id, type]);

  // Fetch building settings for contact requirements
  useEffect(() => {
    const fetchBuildingSettings = async () => {
      if (!building) return;
      try {
        const response = await apiService.get(
          `${endpoints.buildings}/${building}`,
        );
        const buildingData = response.data as BuildingSettings;
        setBuildingSettings({
          requireContactDetails: buildingData.requireContactDetails ?? false,
          askForName: buildingData.askForName ?? false,
          contactType: buildingData.contactType ?? "email",
          showReportedIssues: (buildingData as any).showReportedIssues ?? true,
        });
      } catch (error) {
        console.error("Error fetching building settings:", error);
      }
    };

    if (building) {
      fetchBuildingSettings();
    }
  }, [building]);

  // Switch default tab when reported issues are hidden
  useEffect(() => {
    if (buildingSettings?.showReportedIssues === false) {
      setActiveTab("documents");
    }
  }, [buildingSettings?.showReportedIssues]);

  // Fetch linked attachments for the space or asset
  useEffect(() => {
    const fetchLinkedAttachments = async () => {
      if (!id || !type || !org) return;

      setLoadingAttachments(true);
      try {
        const endpoint =
          type === "space"
            ? `${endpoints.spaces}/${id}?org=${org}`
            : `${endpoints.assets}/${id}?org=${org}`;

        const response = await apiService.get(endpoint);
        const data = response.data as { attachments?: LinkedAttachment[] };

        // Filter only public attachments
        const publicAttachments = (data.attachments || []).filter(
          (attachment) =>
            attachment.visibility === "public" && !attachment.expired,
        );
        setLinkedAttachments(publicAttachments);
      } catch (error) {
        console.error("Error fetching linked attachments:", error);
        setLinkedAttachments([]);
      } finally {
        setLoadingAttachments(false);
      }
    };
    if (id && type) {
      fetchLinkedAttachments();
    }
  }, [id, type, org]);
  

  // Reported issues are now fetched via useLinkedIssuesQuery hook with WebSocket support

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

    if (files) {
      const newFiles = Array.from(files);

      newFiles.forEach((file) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast({
            title: t("common.error"),
            description: `"${file.name}" ${t("publicReport.fileTooLarge")} ${MAX_FILE_SIZE_MB}MB.`,
            variant: "destructive",
          });
          return;
        }

        setAttachments((prev) => [...prev, file]);

        if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
          const url = URL.createObjectURL(file);
          setPreviewUrls((prev) => [...prev, url]);
        } else {
          setPreviewUrls((prev) => [...prev, ""]);
        }
      });
    }
    event.target.value = "";
  };

  const removeAttachment = (index: number) => {
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.issue_summary.trim()) {
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

    if (buildingSettings?.requireContactDetails) {
      const contactType = buildingSettings.contactType;
      if (
        (contactType === "email" || contactType === "email-and-phone") &&
        !formData.reporter_email.trim()
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
        !formData.reporter_phone.trim()
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

    /* if (buildingSettings?.askForName && !formData.reporter_name.trim()) {
      toast({
        title: t("common.error"),
        description:
          t("publicReport.yourName") + " " + t("common.required").toLowerCase(),
        variant: "destructive",
      });
      return;
    } */

    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      formPayload.append("issue_summary", formData.issue_summary);
      formPayload.append("additional_info", formData.additional_info);
      formPayload.append("Linked_To", id || "");
      formPayload.append(
        "Linked_To_Model",
        type === "space" ? "Space" : "Asset",
      );

      if (formData.reporter_name) {
        formPayload.append("reporter_name", formData.reporter_name);
      }
      if (formData.reporter_email) {
        formPayload.append("reporter_email", formData.reporter_email);
      }
      if (formData.reporter_phone) {
        formPayload.append("phone", formData.reporter_phone);
      }
      if (formData.organizationId) {
        formPayload.append("organization", formData.organizationId);
      }

      attachments.forEach((file) => {
        formPayload.append("attachments", file);
      });

      const lang = localStorage.getItem("language") || "en";

      const buildingParam = building ? `&building=${building}` : "";
      const response = await fetch(
        `${apiUrl}/issue/public-report?org=${org}${buildingParam}`,
        {
          method: "POST",
          body: formPayload,
          headers: {
            "Accept-Language": lang,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t("messages.error.somethingWentWrong"));
      }

      setShowSuccess(true);
      setShowReportForm(false);
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: t("common.error"),
        description: error.message || t("messages.error.somethingWentWrong"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportAnother = () => {
    setFormData({
      issue_summary: "",
      additional_info: "",
      reporter_name: "",
      reporter_email: "",
      reporter_phone: "",
      organizationId: org || "",
    });
    setAttachments([]);
    setPreviewUrls([]);
    setShowSuccess(false);
    setShowReportForm(false);
  };
  
  const getStatusLabel = (status: string, taskStatus?: string) => {
    if (status === "accepted" && taskStatus) {
      switch (taskStatus) {
        case "TO_DO":
          return t("publicReport.statusToDo");
        case "IN_PROGRESS":
          return t("publicReport.statusInProgress");
        case "DONE":
        case "CLOSED":
          return t("publicReport.statusDone");
        default:
          return t("publicReport.statusToDo");
      }
    }
    switch (status) {
      case "Pending":
        return t("publicReport.statusReported");
      case "accepted":
        return t("publicReport.statusToDo");
      case "declined":
        return t("publicReport.statusDeclined");
      case "To Do":
        return t("publicReport.statusToDo");
      case "In Progress":
        return t("publicReport.statusInProgress");
      case "Done":
        return t("publicReport.statusDone");
      default:
        return status;
    }
  };

  const getStatusColor = (status: string, taskStatus?: string) => {
    // If issue is accepted and has a task status
    if (status === "accepted" && taskStatus) {
      switch (taskStatus) {
        case "TO_DO":
          return "text-blue-600 bg-blue-50";
        case "IN_PROGRESS":
          return "text-yellow-600 bg-yellow-50";
        case "DONE":
        case "CLOSED":
          return "text-green-600 bg-green-50";
        default:
          return "text-blue-600 bg-blue-50";
      }
    }
    // Issue status colors
    switch (status) {
      case "pending":
        return "text-orange-600 bg-orange-50";
      case "accepted":
      case "To Do":
        return "text-blue-600 bg-blue-50";
      case "In Progress":
        return "text-yellow-600 bg-yellow-50";
      case "Done":
        return "text-green-600 bg-green-50";
      case "declined":
        return "text-red-600 bg-red-50";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const formatDateSimple = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getIssueTimeline = (issue: LinkedIssue) => {
    const timeline: {
      date: string;
      message: string;
      icon: "info" | "check" | "clock";
    }[] = [];
    timeline.push({
      date: issue.createdAt,
      message: t("publicReport.timelineReported"),
      icon: "info",
    });

    if (issue.status === "To Do") {
      timeline.push({
        date: issue.updatedAt,
        message: t("publicReport.timelineAccepted"),
        icon: "check",
      });
    } else if (issue.status == "In Progress") {
      timeline.push({
        date: issue.updatedAt,
        message: t("publicReport.timelineInProgress"),
        icon: "clock",
      });
    } else if (issue.status === "Done") {
      timeline.push({
        date: issue.updatedAt,
        message: t("publicReport.timelineDone"),
        icon: "check",
      });
    }

    if (issue.status === "declined") {
      timeline.push({
        date: issue.updatedAt,
        message: t("publicReport.timelineDeclined"),
        icon: "info",
      });
    }

    return timeline.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  };

  const renderMarkdownBold = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <span key={i} className="font-semibold">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const CountBadge = ({
    count,
    isActive,
  }: {
    count: number;
    isActive: boolean;
  }) => (
    <span
      style={{ marginLeft: 0 }}
      className={`ml-1.5 px-1.5 min-w-[20px] h-5 text-xs font-medium rounded-full inline-flex items-center justify-center ${
        isActive
          ? "bg-primary/15 text-primary border border-primary/30"
          : "bg-muted text-muted-foreground border border-border"
      }`}
    >
      {count}
    </span>
  );

  const getAttachmentIcon = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return (
          <img src={pdfIcon} className="w-8 h-8 object-contain" alt="PDF" />
        );
      case "doc":
      case "docx":
        return (
          <img src={docxIcon} className="w-8 h-8 object-contain" alt="DOCX" />
        );
      case "xls":
      case "xlsx":
        return (
          <img src={xlsxIcon} className="w-8 h-8 object-contain" alt="Excel" />
        );
      case "mp4":
        return <Video className="w-8 h-8 text-primary" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return url ? (
          <img
            src={url}
            alt="Attachment 2"
            className="w-10 h-10 object-cover [image-orientation:from-image]"
          />
        ) : (
          <NoImagePlaceholder />
        );
      case "txt":
        return <FileText className="w-8 h-8 text-gray-600" />;
      default:
        return <FileText className="w-8 h-8 text-muted-foreground" />;
    }
  };

  // Invalid parameters check
  if (!type || !id || !org) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* <AuroraBackground className="z-0" /> */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center p-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl"
        >
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {t("publicReport.invalidQRCode")}
          </h1>
          <p className="text-muted-foreground mb-4">
            {t("publicReport.invalidQRCodeMessage")}
          </p>
          <Button onClick={() => navigate("/")}>
            {t("publicReport.goToHome")}
          </Button>
        </motion.div>
      </div>
    );
  }

  // Loading state while validating
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* <AuroraBackground className="z-0" /> */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center p-8"
        >
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t("publicReport.validatingQRCode")}
          </p>
        </motion.div>
      </div>
    );
  }

  // Item no longer exists
  if (validationStatus === "not_found") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* <AuroraBackground className="z-0" /> */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center p-8 max-w-md rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl"
        >
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {type === "space"
              ? t("publicReport.spaceNotFound")
              : t("publicReport.assetNotFound")}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t("publicReport.notFoundDesc").replace(
              "{type}",
              type === "space"
                ? t("publicReport.spaceLabel").toLowerCase()
                : t("publicReport.assetLabel").toLowerCase(),
            )}
          </p>
          <Button onClick={() => navigate("/")}>
            {t("publicReport.goToHome")}
          </Button>
        </motion.div>
      </div>
    );
  }

  // Item is archived
  if (validationStatus === "archived") {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* <AuroraBackground className="z-0" /> */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center p-8 max-w-md rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl"
        >
          <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {t("publicReport.temporarilyUnavailable")}
          </h1>
          <p className="text-muted-foreground mb-2">
            {itemName && <span className="font-medium">"{itemName}"</span>}
          </p>
          <p className="text-muted-foreground mb-6">
            {t("publicReport.archivedDesc").replace(
              "{type}",
              type === "space"
                ? t("publicReport.spaceLabel").toLowerCase()
                : t("publicReport.assetLabel").toLowerCase(),
            )}{" "}
            {t("publicReport.archivedContactMessage")}
          </p>
          <Button onClick={() => navigate("/")}>
            {t("publicReport.goToHome")}
          </Button>
        </motion.div>
      </div>
    );
  }

  // Organization subscription expired
  if (isOrgExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 text-center p-8 max-w-md rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {t("publicReport.subscriptionExpiredTitle")}
          </h1>
          <p className="text-muted-foreground mb-2">
            {t("publicReport.subscriptionExpiredMessage")}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {t("publicReport.subscriptionExpiredContact")}
          </p>
          <Button onClick={() => navigate("/")}>
            {t("publicReport.goToHome")}
          </Button>
        </motion.div>
      </div>
    );
  }
  
  if (showSuccess) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* <AuroraBackground className="z-0" /> */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-lg mx-auto px-4 py-8"
        >
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 h-24 w-24 rounded-full  flex items-center justify-center mx-auto">
              <img src={dog} />
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
        </motion.div>
      </div>
    );
  }

  // Report form view
  if (showReportForm) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* <AuroraBackground className="z-0" /> */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-lg mx-auto px-4 py-8 w-full"
        >
          <div className="">
            {/* Header with back button */}
            <div className="border-b pb-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReportForm(false)}
                className="mb-2 -ml-2"
              >
                ← {t("publicReport.back")}
              </Button>
              <h1 className="text-xl sm:text-2xl font-semibold first-letter:uppercase">
                {t("publicReport.title")} {itemName && `(${itemName})`}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("publicReport.subtitleQR")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Issue Summary */}
              <div>
                <Label htmlFor="issue_summary" className="text-sm font-medium">
                  {t("publicReport.issueSummary")}
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="issue_summary"
                  placeholder={t("publicReport.describeIssueBriefly")}
                  value={formData.issue_summary}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      issue_summary: e.target.value,
                    }))
                  }
                  className="mt-1 min-h-[80px]"
                  required
                />
              </div>

              {/* Reporter Name */}
              {buildingSettings?.askForName && (
                <div>
                  <Label
                    htmlFor="reporter_name"
                    className="text-sm font-medium"
                  >
                    {t("publicReport.yourName")}
                    <span className="text-muted-foreground text-sm first-letter:uppercase">
                      {" "}
                      ({t("publicReport.optional")})
                    </span>
                  </Label>
                  <Input
                    id="reporter_name"
                    placeholder={t("publicReport.enterYourName")}
                    value={formData.reporter_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reporter_name: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              )}

              {/* Reporter Email */}
              {(buildingSettings?.contactType === "email" ||
                buildingSettings?.contactType === "email-and-phone") && (
                <div>
                  <Label
                    htmlFor="reporter_email"
                    className="text-sm font-medium"
                  >
                    {t("publicReport.yourEmail")}
                    {buildingSettings?.requireContactDetails && (
                      <span className="text-destructive">*</span>
                    )}
                    {!buildingSettings?.requireContactDetails && (
                      <span className="text-muted-foreground text-sm first-letter:uppercase">
                        {" "}
                        ({t("publicReport.optional")})
                      </span>
                    )}
                  </Label>
                  <Input
                    id="reporter_email"
                    type="email"
                    placeholder={t("publicReport.enterYourEmail")}
                    value={formData.reporter_email}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        reporter_email: e.target.value,
                      }))
                    }
                    className="mt-1"
                  />
                  <span className="text-xs text-muted-foreground">
                    {t("publicReport.emailInfoMessage")}
                  </span>
                </div>
              )}

              {/* Reporter Phone */}
              {(buildingSettings?.contactType === "phone" ||
                buildingSettings?.contactType === "email-and-phone") && (
                <div>
                  <Label
                    htmlFor="reporter_phone"
                    className="text-sm font-medium"
                  >
                    {t("publicReport.yourPhone")}
                    {buildingSettings?.requireContactDetails && (
                      <span className="text-destructive">*</span>
                    )}
                    {!buildingSettings?.requireContactDetails && (
                      <span className="text-muted-foreground text-sm first-letter:uppercase">
                        {" "}
                        ({t("publicReport.optional")})
                      </span>
                    )}
                  </Label>
                  <Input
                    id="reporter_phone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={t("publicReport.enterYourPhone")}
                    value={formData.reporter_phone}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      setFormData((prev) => ({
                        ...prev,
                        reporter_phone: onlyNumbers,
                      }));
                    }}
                    className="mt-1"
                  />
                </div>
              )}

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

                {/* Preview Grid */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                    {attachments.map((file, index) => {
                      const isVideo = file.type.startsWith("video/");
                      return (
                        <div
                          key={index}
                          className="relative group rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <div className="aspect-square bg-muted/20">
                            {isVideo ? (
                              <div className="w-full h-full flex items-center justify-center bg-muted relative">
                                <video
                                  src={previewUrls[index]}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <Play className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            ) : previewUrls[index] ? (
                              <img
                                src={previewUrls[index]}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {getAttachmentIcon(file.name)}
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={() => removeAttachment(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-xs text-white truncate">
                              {file.name}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Upload Area */}
                <label
                  htmlFor="file-upload-input"
                  className="block w-full rounded-2xl bg-primary/5 border-2 border-dashed border-primary p-10 cursor-pointer hover:bg-primary/10 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <UploadCloud size={54} className="text-primary" />
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("file-upload-input")?.click();
                      }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-3 rounded-lg shadow-md"
                    >
                      {t("publicReport.browseFiles")}
                    </Button>
                  </div>
                </label>

                <input
                  id="file-upload-input"
                  type="file"
                  multiple
                  accept="image/*,video/*, .pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Terms and Privacy */}
              <p className="text-xs text-muted-foreground text-start">
                {t("publicReport.termsAgreement")}{" "}
                <a
                  href="/agb"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                >
                  {t("publicReport.termsOfService")}
                </a>{" "}
                {t("publicReport.and")}{" "}
                <a
                  href="/datenschutz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                >
                  {t("publicReport.privacyPolicy")}
                </a>
                <span> {t("publicReport.zu")}.</span>
              </p>

              <LanguageSelector className="w-32" />

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[50px] text-primary-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("publicReport.submitting")}
                    </>
                  ) : (
                    t("publicReport.submitReport")
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Issue detail view
  if (selectedIssue) {
    const timeline = getIssueTimeline(selectedIssue);
    const issueImages = selectedIssue.attachements || [];

    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* <AuroraBackground className="z-0" /> */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-lg mx-auto px-4 py-8 w-full"
        >
          <div className="">
            {/* Header with back button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIssue(null)}
                className="mb-4 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("publicReport.back")}
              </Button>

             <h1 className="text-xl sm:text-2xl font-semibold text-left mb-4 leading-tight break-words">
                {selectedIssue.issue_summary}
              </h1>
              <div className="flex justify-center">
                <span
                  className={`text-sm px-3 py-1 rounded-full ${getStatusColor(
                    selectedIssue.status,
                    selectedIssue.taskStatus,
                  )}`}
                >
                  {getStatusLabel(
                    selectedIssue.status,
                    selectedIssue.taskStatus,
                  )}
                </span>
              </div>
            </div>

            {/* Detail Tabs */}
            <Tabs
              value={issueDetailTab}
              onValueChange={(v) =>
                setIssueDetailTab(v as "updates" | "pictures")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="updates"
                  className="flex items-center gap-2"
                >
                  {t("publicReport.updates")}
                </TabsTrigger>
                <TabsTrigger
                  value="pictures"
                  className="flex items-center gap-2"
                >
                  {t("publicReport.pictures")}
                  <CountBadge
                    count={issueImages.length}
                    isActive={issueDetailTab === "pictures"}
                  />
                </TabsTrigger>
              </TabsList>

              {/* Updates Tab - Timeline */}
              <TabsContent value="updates" className="space-y-4">
                <div className="relative">
                  {timeline.map((event, index) => {
                    const dateLabel = isToday(event.date)
                      ? t("publicReport.today")
                      : formatDateSimple(event.date);

                    return (
                      <div key={index} className="relative pb-6 last:pb-0">
                        {/* Date label */}
                        <p className="text-sm font-medium text-foreground mb-3">
                          {dateLabel}
                        </p>

                        {/* Timeline item */}
                        <div className="flex gap-3 pl-2">
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            {event.icon === "check" ? (
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              </div>
                            ) : event.icon === "clock" ? (
                              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Clock className="w-4 h-4 text-yellow-600" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                <Info className="w-4 h-4 text-blue-600" />
                              </div>
                            )}
                          </div>

                          {/* Message */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {renderMarkdownBold(event.message)}
                            </p>
                          </div>

                          {/* User avatar (optional, for accepted issues) */}
                          {/* {event.icon === "clock" && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                              {selectedIssue.issue_summary
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          </div>
                        )} */}
                        </div>

                        {/* Connector line */}
                        {index < timeline.length - 1 && (
                          <div className="absolute left-[18px] top-[52px] bottom-0 w-px bg-border" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Pictures Tab */}
              <TabsContent value="pictures" className="space-y-4">
                {issueImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {issueImages.map((imageUrl, index) => (
                      <a
                        key={index}
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-lg overflow-hidden border hover:border-primary/50 transition-colors"
                      >
                        <img
                          src={imageUrl}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-full object-cover [image-orientation:from-image]"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      {t("publicReport.noPictures")}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Report New Problem Button */}
            <div className="mt-8">
              <Button
                onClick={() => {
                  setSelectedIssue(null);
                  setShowReportForm(true);
                }}
                className="w-full h-[50px] text-primary-foreground"
              >
                {t("publicReport.reportNewProblem")}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main landing view with tabs
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* <AuroraBackground className="z-0" /> */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-lg mx-auto px-4 py-8 flex flex-col flex-1 w-full"
      >
        <div className="">
          {/* Header - Fixed */}
          <div className="text-center mb-6 flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-semibold first-letter:uppercase">
              {itemName || name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 text-left first-letter:uppercase">
              {t("publicReport.alreadyRep")}
            </p>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex flex-col min-h-0 border rounded-md p-3"
          >
            <TabsList
              className={`grid w-full ${buildingSettings?.showReportedIssues !== false ? "grid-cols-2" : "grid-cols-1"} mb-4 flex-shrink-0 bg-transparent rounded-none p-0 h-auto`}
            >
              {buildingSettings?.showReportedIssues !== false && (
                <TabsTrigger
                  value="reported"
                  className="text-muted-foreground font-medium hover:text-foreground hover:bg-accent/50"
                >
                  {t("publicReport.alreadyRepName")}
                  <CountBadge
                    count={reportedIssues.length}
                    isActive={activeTab === "reported"}
                  />
                </TabsTrigger>
              )}
              <TabsTrigger
                value="documents"
                className="text-muted-foreground font-medium hover:text-foreground hover:bg-accent/50"
              >
                {t("documents.title")}
                <CountBadge
                  count={linkedAttachments.length}
                  isActive={activeTab === "documents"}
                />
              </TabsTrigger>
            </TabsList>

            {/* Already Reported Tab - Scrollable */}
            <TabsContent
              value="reported"
              className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden"
            >
              {loadingIssues ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : reportedIssues.length > 0 ? (
              <div className="overflow-y-auto max-h-[calc(100vh-480px)] space-y-0 divide-y divide-border">
  {reportedIssues?.map((issue) => (
    <div
      key={issue._id}
      onClick={() => setSelectedIssue(issue)}
      className="flex flex-col gap-3 py-4 px-1 hover:bg-muted/50 transition-colors cursor-pointer group"
    >
      {/* Date */}
      <div className="text-sm text-muted-foreground">
        {formatDateSimple(issue.createdAt)}
      </div>

      {/* Content Row */}
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {issue.attachements?.[0] ? (
            getAttachmentIcon(issue.attachements?.[0])
          ) : (
            <NoImagePlaceholder className="w-12 h-12" />
          )}
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          {/* Hover Tooltip for full title */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-sm text-foreground line-clamp-2 leading-snug mb-1.5 first-letter:uppercase break-words ">
                  {issue.issue_summary}
                </p>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs text-left mb-4 leading-tight break-words">
                <p className="text-sm">{issue.issue_summary}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Status Badge */}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(
              issue.status,
              issue.taskStatus,
            )}`}
          >
            {getStatusLabel(issue.status, issue.taskStatus)}
          </span>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 self-center">
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </div>
  ))}
</div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    {t("publicReport.noAlreadyRep")}
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent
              value="documents"
              className="flex-1 overflow-hidden mt-0 data-[state=inactive]:hidden"
            >
              {loadingAttachments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : linkedAttachments.length > 0 ? (
                <div className="overflow-y-auto max-h-[calc(100vh-380px)] space-y-3">
                  {linkedAttachments.map((attachment) => {
                    return (
                      <div
                        key={attachment._id}
                        className="flex items-center gap-3 p-3 bg-card rounded-lg border hover:border-primary/50 transition-colors"
                      >
                        {getAttachmentIcon(attachment?.url)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate first-letter:uppercase">
                            {attachment.name}
                          </p>
                          {attachment.expirationDate && (
                            <p className="text-xs text-muted-foreground">
                              {t("publicReport.expiryDate")} :{" "}
                              {formatDate(attachment.expirationDate)}
                            </p>
                          )}
                        </div>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-muted rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    {t("publicReport.noDocuments")}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Report New Problem Button - Fixed at bottom */}
          <div className="mt-6 flex-shrink-0">
            <Button
              onClick={() => {
                setShowReportForm(true);
                refreshIssues();
              }}
              className="w-full h-[50px] text-primary-foreground"
            >
              {t("publicReport.reportNewProblem")}
            </Button>
          </div>

          <LanguageSelector className="w-32 mx-auto mt-4 flex-shrink-0" />
        </div>
      </motion.div>
    </div>
  );
}
