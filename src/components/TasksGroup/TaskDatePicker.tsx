import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";

interface TaskDatePickerProps {
  label: string;
  value: Date | undefined | null;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disablePastDates?: boolean;
  disabled?: boolean;
  minDate?: Date;
   maxDate?: Date;
}

export function TaskDatePicker({
  label,
  value,
  onChange,
  placeholder,
  disablePastDates = false,
  disabled = false,
  minDate,
  maxDate,
}: TaskDatePickerProps) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  const defaultPlaceholder = placeholder || t("tasks.pickADate");

  const handleDateSelect = (date: Date | undefined) => {
    onChange(date);
    setOpen(false);
  };

  return (
    <div>
      {label && <Label className="text-sm font-medium text-foreground">{label}</Label>}
      <div className="">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal mt-1",
                !value && "text-muted-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, "dd.MM.yyyy") : <span>{defaultPlaceholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="bg-background rounded-lg shadow-lg">
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t("tasks.setDueDate")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-accent"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CustomCalendar 
                selected={value || undefined} 
                onSelect={handleDateSelect}
                disablePastDates={disablePastDates}
                minDate={minDate}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
