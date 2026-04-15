import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  color: "blue" | "red" | "green" | "dark";
  size?: number;
}

const colorClasses = {
  blue: "stroke-[#0A2472]",
  red: "stroke-[#F24040]",
  green: "stroke-[#3CC34F]",
  dark: "stroke-[#0E0E0E]",
};

const textColorClasses = {
  blue: "text-[#0A2472]",
  red: "text-[#F24040]",
  green: "text-[#3CC34F]",
  dark: "text-[#0E0E0E]",
};

export function CircularProgress({ value, color, size = 48 }: CircularProgressProps) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
        viewBox="0 0 48 48"
      >
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-muted"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className={cn(colorClasses[color], "transition-all duration-1000 ease-out")}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(textColorClasses[color],"text-[10px] font-semibold")}>{value}%</span>
      </div>
    </div>
  );
}