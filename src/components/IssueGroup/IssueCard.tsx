import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Issue } from "@/types";
import {
  Check,
  X,
  Home,
  User,
  Mail,
  MapPin,
  Phone,
  Video,
  FileText,
} from "lucide-react";
import { ImageViewerModal } from "@/components/Common/ImageViewerModal";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatLocationChain } from "@/lib/utils";
import { Map, Marker } from "pigeon-maps";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

import pdfIcon from "@/components/DocumentsGroup/assets/pdfIcon.png";
import docxIcon from "@/components/DocumentsGroup/assets/docxIcon.png";
import imageIcon from "@/components/DocumentsGroup/assets/imgIcon.png";
import xlsxIcon from "@/components/DocumentsGroup/assets/xlsx.png";
import { formatDateOnly } from "@/utils/dateUtils";

interface IssueCardProps {
  title: string;
  additional_info: string;
  locationChain: string;
  timestamp: string;
  images: string[];
  issue: Issue;
  Linked_To: string;
  buildingId: string;
  activeTab: "pending" | "accepted" | "declined";
  onAccept: () => void;
  onDecline: () => void;
  onReAccept: () => void;
}

export function IssueCard({
  title,
  additional_info,
  timestamp,
  locationChain,
  issue,
  activeTab,
  buildingId,
  images,
  Linked_To,
  onAccept,
  onDecline,
  onReAccept,
}: IssueCardProps) {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { hasPermission } = usePermissions();
  const { t } = useLanguage();

  const formatedLocation = formatLocationChain(locationChain as any);

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageViewerOpen(true);
  };

  const attachments = issue.attachements || [];
  const hasAttachments = attachments.length > 0;

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
        return (
          <img
            src={url}
            alt="Attachment"
            className="w-full h-full object-cover [image-orientation:from-image]"
            style={{ imageOrientation: "from-image" }}
          />
        );
      case "txt":
        return <FileText className="w-8 h-8 text-gray-600" />;
      default:
        return <FileText className="w-8 h-8 text-muted-foreground" />;
    }
  };
  const issueTime = new Date(issue.createdAt);
  
  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:shadow-lg transition-all max-w-[900px]">
      <div className="flex items-start justify-between gap-4">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          {/* Location Chain */}
          {formatedLocation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 capitalize">
              <Home className="w-4 h-4 shrink-0" />
              <span className="truncate">{formatedLocation}</span>
            </div>
          )}

          {/* Description */}
          <h2 className="text-lg font-semibold text-foreground break-words flex-1 first-letter:uppercase">
            {title}
          </h2>
          {/* <p className="text-sm text-foreground leading-relaxed mb-4 first-letter:uppercase">
            {additional_info || title}
          </p> */}

          {/* Reporter info */}
          {issue.reporter && (
            <div className="bg-muted/50 rounded-md p-3 mb-4 space-y-2">
              {issue.reporter.name && (
                <div className="flex items-center gap-2 text-sm first-letter:uppercase">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-foreground">{issue.reporter.name}</span>
                </div>
              )}
              {issue.reporter.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground break-all">
                    {issue.reporter.email}
                  </span>
                </div>
              )}
              {issue.reporter.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground break-all">
                    {issue.reporter.phone}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Location info with hoverable map */}
          {issue.location_coordinates && (
            <HoverCard openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-3 mb-4 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-blue-700 dark:text-blue-300 truncate">
                      {issue.location_name ||
                        `${issue.location_coordinates.lat.toFixed(
                          4,
                        )}, ${issue.location_coordinates.lng.toFixed(4)}`}
                    </span>
                  </div>
                  {/* Mini map preview */}
                  <div className="mt-2 h-16 rounded overflow-hidden border border-blue-200 dark:border-blue-800">
                    <Map
                      center={[
                        issue.location_coordinates.lat,
                        issue.location_coordinates.lng,
                      ]}
                      zoom={14}
                      height={64}
                      attribution={false}
                    >
                      <Marker
                        width={24}
                        anchor={[
                          issue.location_coordinates.lat,
                          issue.location_coordinates.lng,
                        ]}
                        color="hsl(var(--primary))"
                      />
                    </Map>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-2" side="right" align="start">
                <div className="p-3 border-b">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{t("issues.reportedLocation")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {issue.location_name ||
                      `${issue.location_coordinates.lat.toFixed(
                        6,
                      )}, ${issue.location_coordinates.lng.toFixed(6)}`}
                  </p>
                </div>
                <div className="h-48 ">
                  <Map
                    center={[
                      issue.location_coordinates.lat,
                      issue.location_coordinates.lng,
                    ]}
                    zoom={15}
                    height={192}
                  >
                    <Marker
                      width={40}
                      anchor={[
                        issue.location_coordinates.lat,
                        issue.location_coordinates.lng,
                      ]}
                      color="hsl(var(--primary))"
                    />
                  </Map>
                </div>
              </HoverCardContent>
            </HoverCard>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-6">
            {activeTab === "pending" &&
              hasPermission("issues", "acceptDeclineNewIssues") && (
                <>
                  <Button
                    onClick={onAccept}
                    size="sm"
                    className="bg-green-100 text-green-700 hover:bg-green-200 border-0 px-6"
                  >
                    {t("issues.accept")}
                  </Button>
                  <Button
                    onClick={onDecline}
                    size="sm"
                    variant="ghost"
                    className="text-red-600 bg-red-50 hover:bg-red-600 hover:text-white px-6"
                  >
                    {t("issues.decline")}
                  </Button>
                </>
              )}
            {activeTab === "declined" && (
              <>
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <X className="w-4 h-4" />
                  <span>{t("issues.declined")}</span>
                </div>
                {hasPermission("issues", "acceptDeclineNewIssues") && (
                  <Button
                    onClick={onReAccept}
                    size="sm"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0"
                  >
                    {t("issues.reAccept")}
                  </Button>
                )}
              </>
            )}
            {activeTab === "accepted" && (
              <div className="flex items-center gap-1 text-green-700 text-sm">
                <Check className="w-4 h-4" />
                <span>{t("issues.accepted")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Content - Date & Images */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {/* Timestamp */}
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDateOnly(issue.createdAt)}{" "}
            {t("taskDetail.at")}{" "}
            {issueTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: false
            })}
          </span>

          {/* Images */}
          {hasAttachments && (
            <div className="flex items-center gap-2">
              {/* First image */}
              <button
                onClick={() => handleImageClick(0)}
                className="relative w-14 h-14 rounded-md border justify-center items-center flex border-border overflow-hidden hover:border-primary transition-colors cursor-pointer"
              >
                {getAttachmentIcon(attachments[0])}
              </button>

              {/* Second image with overlay if more than 2 */}
              {attachments.length >= 2 && (
                <button
                  onClick={() => handleImageClick(1)}
                  className="relative w-14 h-14 rounded-md border border-border overflow-hidden hover:border-primary transition-colors cursor-pointer"
                >
                  {getAttachmentIcon(attachments[1])}
                  {attachments.length > 2 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        +{attachments.length - 1}
                      </span>
                    </div>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ImageViewerModal
        open={isImageViewerOpen}
        onOpenChange={setIsImageViewerOpen}
        images={hasAttachments ? attachments : images}
        initialIndex={selectedImageIndex}
      />
    </div>
  );
}
