import { Circle, CheckCircle, Clock, Loader2 } from "lucide-react";

type StatusConfig = {
  classes: string;
  icon: JSX.Element;
  label: string;
  translationKey: string;
};

export const getTicketStatusConfig = (status: string): StatusConfig => {
  switch (status) {
    case "open":
      return {
        classes: "text-[#379AE6FF] bg-[#F1F8FDFF]",
        icon: <Circle className="w-3 h-3 text-[#379AE6FF] fill-[#379AE6FF]" />,
        label: "Open",
        translationKey: "support.open",
      };
    case "in_progress":
      return {
        classes: "text-[#EA916EFF] bg-[#FDF5F1FF]",
        icon: <Loader2 className="w-3 h-3 text-[#EA916EFF]" />,
        label: "In Progress",
        translationKey: "support.inProgress",
      };
    case "closed":
      return {
        classes: "text-[#6E7787FF] bg-[#F2F3F5FF]",
        icon: <CheckCircle className="w-3 h-3 text-[#6E7787FF]" />,
        label: "Closed",
        translationKey: "support.closed",
      };
    case "resolved":
      return {
        classes: "text-[#17A948FF] bg-[#F0FAF3FF]",
        icon: <CheckCircle className="w-3 h-3 text-[#17A948FF]" />,
        label: "Resolved",
        translationKey: "support.resolved",
      };
    case "awaiting":
      return {
        classes: "text-[#E5A00DFF] bg-[#FDF8EEFF]",
        icon: <Clock className="w-3 h-3 text-[#E5A00DFF]" />,
        label: "Awaiting",
        translationKey: "support.awaitingSupport",
      };
    case "pending":
      return {
        classes: "text-[#E5A00DFF] bg-[#FDF8EEFF]",
        icon: <Clock className="w-3 h-3 text-[#E5A00DFF]" />,
        label: "Pending",
        translationKey: "support.pending",
      };
    default:
      return {
        classes: "text-[#6E7787FF] bg-[#F2F3F5FF]",
        icon: <Circle className="w-3 h-3 text-[#6E7787FF]" />,
        label: status,
        translationKey: "",
      };
  }
};
