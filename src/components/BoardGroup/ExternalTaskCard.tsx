import { Issue } from "@/types";
import { MapPin, User, Calendar, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Map, Marker } from "pigeon-maps";

interface ExternalTaskCardProps {
  issue: Issue;
  onClick: () => void;
}

export function ExternalTaskCard({ issue, onClick }: ExternalTaskCardProps) {
  const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return utcDate.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

  const attachments = issue.attachements || [];
  const isPending = issue.isAccepted === null;

  return (
    <div
      onClick={onClick}
      className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer hover:border-primary/50"
    >
      {/* Header with status */}
      <div className="flex items-center justify-between mb-3">
        <Badge 
          variant="outline" 
          className={`text-xs ${
            isPending 
              ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
              : issue.isAccepted 
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {isPending ? "Pending" : issue.isAccepted ? "Accepted" : "Declined"}
        </Badge>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(issue.createdAt)}
        </span>
      </div>

      {/* Issue Summary */}
      <h4 className="font-semibold text-sm mb-2 line-clamp-2">{issue.issue_summary}</h4>
      
      {issue.additional_info && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{issue.additional_info}</p>
      )}

      {/* Mini Map */}
      {issue.location_coordinates && (
        <div className="mb-3 rounded-md overflow-hidden border h-20">
          <Map
            center={[issue.location_coordinates.lat, issue.location_coordinates.lng]}
            zoom={13}
            height={80}
            attribution={false}
          >
            <Marker
              width={20}
              anchor={[issue.location_coordinates.lat, issue.location_coordinates.lng]}
              color="hsl(var(--primary))"
            />
          </Map>
        </div>
      )}

      {/* Location Name */}
      {(issue.location_name || issue.location_coordinates) && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">
            {issue.location_name || 
              `${issue.location_coordinates?.lat.toFixed(4)}, ${issue.location_coordinates?.lng.toFixed(4)}`}
          </span>
        </div>
      )}

      {/* Footer - Reporter & Attachments */}
      <div className="flex items-center justify-between pt-2 border-t">
        {issue.reporter?.name ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[100px]">{issue.reporter.name}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Anonymous</span>
        )}

        {attachments.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Image className="w-3.5 h-3.5" />
            <span>{attachments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}