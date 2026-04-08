import * as React from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { Locale } from "date-fns";
import { de, enAU } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CustomCalendarProps {
  selected?: Date;
  onSelect?: (date?: Date) => void;
  className?: string;
  initialMonth?: Date;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showOutsideDays?: boolean;
  disablePastDates?: boolean;
  minDate?: Date;
}

export function CustomCalendar({
  selected,
  onSelect,
  className,
  initialMonth,
  locale = enAU, // Match screenshot (German month names like "Mai")
  weekStartsOn = 1, // Monday
  showOutsideDays = true,
  disablePastDates = false,
  minDate,
}: CustomCalendarProps) {
  const [visibleMonth, setVisibleMonth] = React.useState<Date>(
    selected || initialMonth || new Date()
  );

  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn });

  const days: Date[] = [];
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) {
    days.push(day);
  }

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const handlePrev = () => setVisibleMonth(addMonths(visibleMonth, -1));
  const handleNext = () => setVisibleMonth(addMonths(visibleMonth, 1));

  return (
    <div className={cn("p-6 pointer-events-auto", className)}>
      {/* Caption with navigation */}
      <div className="flex items-center gap-3 mb-6 ">
        <div className="flex gap-1 justify-between w-full">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handlePrev}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center">
            <span className="text-base font-semibold text-foreground">
              {format(visibleMonth, "LLLL yyyy", { locale })}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleNext}
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="flex w-full">
        {Array.from({ length: 7 }).map((_, i) => {
          const day = addDays(startOfWeek(visibleMonth, { weekStartsOn }), i);
          return (
            <div
              key={i}
              className="text-foreground/60 w-10 font-medium text-xs flex items-center justify-center flex-1"
            >
              {format(day, "EEEEE", { locale })}
            </div>
          );
        })}
      </div>

      {/* Weeks */}
      <div className="mt-2 space-y-0">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex w-full mt-2 first:mt-2">
            {week.map((day, di) => {
              const outside = !isSameMonth(day, monthStart);
              const isSelected = selected ? isSameDay(day, selected) : false;
              const today = isToday(day);
              const isPast = disablePastDates && day < new Date(new Date().setHours(0, 0, 0, 0));
              const minDateStart = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null;
              const isBeforeMinDate = minDateStart && day < minDateStart;
              const isDisabled = isPast || isBeforeMinDate;
              
              return (
                <button
                  key={di}
                  type="button"
                  disabled={isDisabled}
                  className={cn(
                    "flex-1 h-10 text-center text-sm p-0 relative",
                    "inline-flex items-center justify-center",
                    "rounded-md transition-colors",
                    "h-10 w-10",
                    isDisabled && "cursor-not-allowed opacity-30 text-muted-foreground",
                    !isDisabled && "cursor-pointer",
                    isSelected &&
                      "bg-[#2E69E8FF] text-primary-foreground hover:bg-primary",
                    !isSelected && !isDisabled &&
                      "hover:bg-primary/10 hover:text-accent-foreground",
                    outside &&
                      showOutsideDays &&
                      "text-muted-foreground/40 opacity-50",
                    today && !isSelected && !isDisabled && "font-semibold text-foreground"
                  )}
                  onClick={() => !isDisabled && onSelect?.(day)}
                  aria-label={format(day, "PPPP", { locale })}
                >
                  {format(day, "d", { locale })}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

CustomCalendar.displayName = "CustomCalendar";

export default CustomCalendar;