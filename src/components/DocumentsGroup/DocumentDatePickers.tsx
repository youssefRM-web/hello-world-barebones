import React from "react";
import { Calendar, X } from "lucide-react";
import { TaskDatePicker } from "../TasksGroup/TaskDatePicker";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface DocumentDatePickersProps {
  expirationDate: Date | undefined;
  notificationDate: Date | undefined;
  onExpirationDateChange: (date: Date | undefined) => void;
  onNotificationDateChange: (date: Date | undefined) => void;
  errors?: Record<string, string>;
  clearError?: (field: string) => void;
}

export function DocumentDatePickers({
  expirationDate,
  notificationDate,
  onExpirationDateChange,
  onNotificationDateChange,
  errors = {},
  clearError,
}: DocumentDatePickersProps) {
  const { t } = useLanguage();

  return (
    <>
      {/* Expiration date - Optional */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{t("documents.expirationDateLabel")}</label>
          {expirationDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onExpirationDateChange(undefined);
                onNotificationDateChange(undefined);
              }}
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              {t("documents.clear")}
            </Button>
          )}
        </div>
        <TaskDatePicker
          label=""
          value={expirationDate}
          onChange={(date) => {
            onExpirationDateChange(date);
            if (!date) {
              onNotificationDateChange(undefined);
            }
            clearError?.("expirationDate");
          }}
          placeholder={t("documents.pickExpirationDate")}
          disablePastDates={true}
        />
      </div>

      {/* Notification date */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">{t("documents.notificationDateLabel")}</label>
          {notificationDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNotificationDateChange(undefined)}
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              {t("documents.clear")}
            </Button>
          )}
        </div>
        <TaskDatePicker
          label=""
          value={notificationDate}
          onChange={(date) => {
            onNotificationDateChange(date);
            clearError?.("notificationDate");
          }}
          placeholder={
            expirationDate
              ? t("documents.pickNotificationDate")
              : t("documents.setExpirationFirst")
          }
          disablePastDates={false}
          disabled={!expirationDate}
          minDate={new Date()}
           maxDate={expirationDate ? new Date(expirationDate.getTime() - 86400000) : undefined}
        />
        <p className="text-xs text-gray-500">
          {expirationDate
            ? t("documents.notificationReminder")
            : t("documents.notificationAvailableWhenExpiration")}
        </p>
      </div>
    </>
  );
}
