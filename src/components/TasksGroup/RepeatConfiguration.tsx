import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dispatch, SetStateAction } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface RecurrenceConfigFrontend {
  type: "daily" | "mofr" | "weekly" | "monthly" | "yearly";
  interval: number;
  weekDays?: string[];
  monthDay?: number;
  monthPosition?: string;
  monthWeekDay?: string;
  yearMonth?: number;
  yearDay?: number;
  yearPosition?: string;
  yearWeekDay?: string;
  yearMonthName?: number;
}

interface RepeatConfigurationProps {
  value: RecurrenceConfigFrontend;
  onChange: (config: RecurrenceConfigFrontend) => void;
}

export function RepeatConfiguration({
  value,
  onChange,
}: RepeatConfigurationProps) {
  const { t } = useLanguage();

  const DAYS_OF_WEEK = [
    { value: "monday", label: t("tasks.monday") },
    { value: "tuesday", label: t("tasks.tuesday") },
    { value: "wednesday", label: t("tasks.wednesday") },
    { value: "thursday", label: t("tasks.thursday") },
    { value: "friday", label: t("tasks.friday") },
    { value: "saturday", label: t("tasks.saturday") },
    { value: "sunday", label: t("tasks.sunday") },
  ];

  const WEEK_POSITIONS = [
    { value: "first", label: t("tasks.first") },
    { value: "second", label: t("tasks.second") },
    { value: "third", label: t("tasks.third") },
    { value: "fourth", label: t("tasks.fourth") },
    { value: "last", label: t("tasks.last") },
  ];

  const MONTHS = [
    { value: 1, label: t("tasks.january") },
    { value: 2, label: t("tasks.february") },
    { value: 3, label: t("tasks.march") },
    { value: 4, label: t("tasks.april") },
    { value: 5, label: t("tasks.may") },
    { value: 6, label: t("tasks.june") },
    { value: 7, label: t("tasks.july") },
    { value: 8, label: t("tasks.august") },
    { value: 9, label: t("tasks.september") },
    { value: 10, label: t("tasks.october") },
    { value: 11, label: t("tasks.november") },
    { value: 12, label: t("tasks.december") },
  ];

  const handleTypeChange = (type: RecurrenceConfigFrontend["type"]) => {
    const newConfig: RecurrenceConfigFrontend = { type, interval: 1 };

    if (type === "weekly") newConfig.weekDays = ["monday"];
    else if (type === "monthly") newConfig.monthDay = 1;
    else if (type === "yearly") {
      newConfig.yearMonth = 1;
      newConfig.yearDay = 1;
    }

    onChange(newConfig);
  };

  const handleIntervalChange = (interval: number) => {
    onChange({ ...value, interval });
  };

  const handleWeeklyDayChange = (day: string, checked: boolean) => {
    const weekDays = checked
      ? [...(value.weekDays || []), day]
      : (value.weekDays || []).filter((d) => d !== day);
    onChange({ ...value, weekDays });
  };

  const handleMonthlyDayChange = (day: number) => {
    onChange({ ...value, monthDay: day });
  };

  const handleMonthlyPositionChange = (position: string, dayOfWeek?: string) => {
    onChange({ ...value, monthPosition: position, monthWeekDay: dayOfWeek });
  };

  const handleYearlyDateChange = (month: number, day: number) => {
    onChange({ ...value, yearMonth: month, yearDay: day });
  };

  const handleYearlyWeekdayChange = (position: string, dayOfWeek: string, month: number) => {
    onChange({
      ...value,
      yearPosition: position,
      yearWeekDay: dayOfWeek,
      yearMonthName: month,
    });
  };

  return (
    <div className="space-y-4">
      {/* Type */}
      <div>
        <Label className="text-sm font-medium text-foreground">{t("tasks.repeat")} <span className="text-destructive">*</span></Label>
        <div className="w-[250px]">
          <Select value={value.type} onValueChange={handleTypeChange}>
            <SelectTrigger className="mt-1 relative">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">{t("tasks.byDay")}</SelectItem>
              <SelectItem value="mofr">{t("tasks.moFr")}</SelectItem>
              <SelectItem value="weekly">{t("tasks.byWeek")}</SelectItem>
              <SelectItem value="monthly">{t("tasks.byMonth")}</SelectItem>
              <SelectItem value="yearly">{t("tasks.byYear")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interval - Show for daily only */}
      {value.type === "daily" && (
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium text-foreground">{t("tasks.every")}</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="number"
              min="1"
              value={value.interval}
              onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <span className="text-sm text-foreground">{t("tasks.days")}</span>
          </div>
        </div>
      )}

      {/* Interval - Show for weekly, monthly, yearly */}
      {(value.type === "weekly" || value.type === "monthly" || value.type === "yearly") && (
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium text-foreground">{t("tasks.every")}</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="number"
              min="1"
              value={value.interval}
              onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <span className="text-sm text-foreground">
              {value.type === "weekly" && t("tasks.weeks")}
              {value.type === "monthly" && t("tasks.months")}
              {value.type === "yearly" && t("tasks.years")}
            </span>
          </div>
        </div>
      )}

      {/* Weekly */}
      {value.type === "weekly" && (
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium text-foreground">{t("tasks.on")}</Label>
          <div className=" space-y-2">
            <Select
              value={value.weekDays?.[0] || "monday"}
              onValueChange={(newDay) => onChange({ ...value, weekDays: [newDay] })}
            >
              <SelectTrigger className="mt-1 relative w-[220px]">
                <SelectValue placeholder={t("tasks.on")} />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Monthly */}
      {value.type === "monthly" && (
        <div className="space-y-3">
          <RadioGroup
            value={value.monthPosition ? "weekday" : "day"}
            onValueChange={(type) => {
              if (type === "day")
                onChange({ ...value, monthDay: 1, monthPosition: undefined, monthWeekDay: undefined });
              else
                onChange({ ...value, monthDay: undefined, monthPosition: "first", monthWeekDay: "monday" });
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="day" id="monthly-day" />
              <Label htmlFor="monthly-day" className="text-sm">{t("tasks.onDay")}</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={value.monthDay || 1}
                onChange={(e) => handleMonthlyDayChange(parseInt(e.target.value) || 1)}
                className="w-16"
                disabled={!!value.monthPosition}
              />
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekday" id="monthly-weekday" />
              <Label htmlFor="monthly-weekday" className="text-sm">{t("tasks.onThe")}</Label>
              <Select
                value={value.monthPosition || "first"}
                onValueChange={(pos) => handleMonthlyPositionChange(pos, value.monthWeekDay)}
                disabled={!value.monthPosition}
              >
                <SelectTrigger className="w-24 relative"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WEEK_POSITIONS.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={value.monthWeekDay || "monday"}
                onValueChange={(day) => handleMonthlyPositionChange(value.monthPosition!, day)}
                disabled={!value.monthPosition}
              >
                <SelectTrigger className="w-32 relative"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Yearly */}
      {value.type === "yearly" && (
        <div className="space-y-3">
          <RadioGroup
            value={value.yearPosition ? "weekday" : "date"}
            onValueChange={(type) => {
              if (type === "date")
                onChange({ ...value, yearMonth: 1, yearDay: 1, yearPosition: undefined, yearWeekDay: undefined, yearMonthName: undefined });
              else
                onChange({ ...value, yearPosition: "first", yearWeekDay: "monday", yearMonthName: 1, yearMonth: undefined, yearDay: undefined });
            }}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="date" id="yearly-date" />
              <Label htmlFor="yearly-date" className="text-sm">{t("tasks.on")}</Label>
              <Select
                value={String(value.yearMonth || 1)}
                onValueChange={(month) => handleYearlyDateChange(Number(month), value.yearDay || 1)}
                disabled={!!value.yearPosition}
              >
                <SelectTrigger className="w-32 relative"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                max={31}
                value={value.yearDay || 1}
                onChange={(e) => handleYearlyDateChange(value.yearMonth || 1, parseInt(e.target.value) || 1)}
                className="w-16"
                disabled={!!value.yearPosition}
              />
            </div>

            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekday" id="yearly-weekday" />
              <Label htmlFor="yearly-weekday" className="text-sm">{t("tasks.onThe")}</Label>
              <Select
                value={value.yearPosition || "first"}
                onValueChange={(pos) => handleYearlyWeekdayChange(pos, value.yearWeekDay || "monday", value.yearMonthName || 1)}
                disabled={!value.yearPosition}
              >
                <SelectTrigger className="w-24 relative"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {WEEK_POSITIONS.map((pos) => (
                    <SelectItem key={pos.value} value={pos.value}>{pos.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={value.yearWeekDay || "monday"}
                onValueChange={(day) => handleYearlyWeekdayChange(value.yearPosition!, day, value.yearMonthName || 1)}
                disabled={!value.yearPosition}
              >
                <SelectTrigger className="w-32 relative"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value}>{day.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-gray-600">{t("tasks.of")}</span>
              <Select
                value={String(value.yearMonthName || 1)}
                onValueChange={(month) => handleYearlyWeekdayChange(value.yearPosition!, value.yearWeekDay || "monday", Number(month))}
                disabled={!value.yearPosition}
              >
                <SelectTrigger className="w-32 relative"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
}
