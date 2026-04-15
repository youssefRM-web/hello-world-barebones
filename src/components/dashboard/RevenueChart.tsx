import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

const data = [
  { month: "Jan", current: 10000, previous: 8000 },
  { month: "Feb", current: 12000, previous: 10000 },
  { month: "Mar", current: 11000, previous: 9000 },
  { month: "Apr", current: 14000, previous: 11000 },
  { month: "May", current: 18000, previous: 14000 },
  { month: "Jun", current: 28000, previous: 20000 },
  { month: "Jul", current: 38700, previous: 26000 },
  { month: "Aug", current: 32000, previous: 28000 },
  { month: "Sept", current: 15457, previous: 18000 },
  { month: "Oct", current: 18000, previous: 15000 },
  { month: "Nov", current: 22000, previous: 18000 },
  { month: "Dec", current: 28000, previous: 22000 },
];

export function RevenueChart() {
  const { t } = useLanguage();

  return (
    <div className="bg-card rounded-xl p-4 md:p-5 shadow-sm border border-border h-full">
      <div className="flex items-start sm:items-center justify-between mb-4 md:mb-6 flex-col sm:flex-row gap-2">
        <h3 className="text-base md:text-lg font-semibold text-foreground">{t("totalRevenue")}</h3>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-chart-blue" />
            <span className="text-[10px] md:text-xs text-muted-foreground">2024</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-chart-dark" />
            <span className="text-[10px] md:text-xs text-muted-foreground">2025</span>
          </div>
        </div>
      </div>
      
      <div className="h-[200px] md:h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              tickFormatter={(value) => `$${value / 1000}k`}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <ReferenceLine
              x="Jul"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              label={{
                value: "$38,700.00",
                position: "top",
                fill: "hsl(var(--foreground))",
                fontSize: 10,
                fontWeight: 600,
              }}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#0A2472"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: "#0A2472" }}
            />
            <Line
              type="monotone"
              dataKey="previous"
              stroke="hsl(var(--chart-dark))"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, fill: "hsl(var(--chart-dark))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
