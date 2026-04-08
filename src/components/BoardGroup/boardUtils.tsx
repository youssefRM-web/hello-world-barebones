import { InfoIcon, ChevronsDown } from "lucide-react";

type PriorityConfig = {
  classes: string;
  icon: JSX.Element;
};

export const getPriorityConfig = (priority: string): PriorityConfig => {
  switch (priority) {
    case "High":
      return {
        classes: "text-[#DE3B40FF] bg-[#FDF2F2FF] first-letter:uppercase",
        icon: <InfoIcon className="w-3 h-3 text-[#DE3B40FF]" />,
      };
    case "Medium":
      return {
        classes: "text-[#EA916EFF] bg-[#FDF5F1FF] first-letter:uppercase",
        icon: (
          <svg
            className="w-3 h-3"
            fill="#EA916EFF"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
          >
            <g>
              <rect fill="none" height="20" width="20" />
            </g>
            <g>
              <g>
                <rect height="2" width="18" x="3" y="3" />
                <rect height="2" width="18" x="3" y="19" />
                <rect height="2" width="18" x="3" y="11" />
              </g>
            </g>
          </svg>
        ),
      };
    case "Low":
      return {
        classes: "text-[#379AE6FF] bg-[#F1F8FDFF] first-letter:uppercase ",
        icon: <ChevronsDown className="w-3 h-3 text-[#379AE6FF]" />,
      };
    default:
      return {
        classes: "text-gray-600 bg-gray-50 border-gray-200 first-letter:uppercase",
        icon: <ChevronsDown className="w-3 h-3 text-blue-600" />,
      };
  }
};

export const statusColumns = [
  { id: "TO_DO", title: "TO DO" },
  { id: "IN_PROGRESS", title: "IN PROGRESS" },
  { id: "DONE", title: "DONE" },
];
