import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useApi } from "@/hooks/useApi";
import { apiService, endpoints } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { X } from "lucide-react";

interface RestoreBuildingModalProps {
    isOpen: boolean;
    onClose: () => void;
    buildingId: string;
    buildingName: string;
    onSuccess?: () => void;
}

export function RestoreBuildingModal({
    isOpen,
    onClose,
    buildingId,
    buildingName,
    onSuccess,
}: RestoreBuildingModalProps) {
    const { executeRequest } = useApi();
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRestore = async () => {
        setIsSubmitting(true);
        await executeRequest(
            () =>
                apiService.patch(
                    `${endpoints.buildings}/${buildingId}/unarchive`
                ),
            {
                onSuccess: () => {
                    onClose();
                    setIsSubmitting(false);
                    onSuccess?.();
                },
                successMessage: `${buildingName} ${t("buildings.res")}`,
            }
        );
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/80" onClick={onClose} />
            <div className="relative z-50 w-full max-w-lg bg-background p-6 shadow-lg rounded-lg border">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
                    disabled={isSubmitting}
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold">{t("buildings.restoreBuildingTitle")}</h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            {t("buildings.restoreBuildingConfirm")} "{buildingName}"?
                            <br />
                            <br />
                            <strong>{t("buildings.note")}</strong> {t("buildings.restoreBuildingNote")}
                        </p>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                            {t("buildings.cancel")}
                        </Button>
                        <Button
                            onClick={handleRestore}
                            disabled={isSubmitting}
                            className="text-white"
                        >
                            {isSubmitting ? t("buildings.restoring") : t("buildings.restoreBuilding")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
