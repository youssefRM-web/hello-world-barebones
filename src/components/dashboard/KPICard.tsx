import { CircularProgress } from "./CircularProgress";

interface KPICardProps {
  title: string;
  value: number;
  percentage: number;
  color: "blue" | "red" | "green" | "dark";
}

export function KPICard({ title, value, percentage, color }: KPICardProps) {
  return (
    <div className="bg-card rounded-xl p-4 md:p-5 shadow-sm border border-border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs md:text-sm text-[#181522] font-medium truncate">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <CircularProgress value={percentage} color={color} size={44} />
      </div>
    </div>
  );
}