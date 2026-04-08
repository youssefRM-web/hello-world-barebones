import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Mail } from "lucide-react";
import axios from "axios";
import { apiUrl } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContactOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    isExpired?: boolean;
}

export const ContactOrganizationModal = ({
    isOpen,
    onClose,
    isExpired = false
}: ContactOrganizationModalProps) => {
    const { t } = useLanguage();

    const handleLogout = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
            const token = user?.accessToken;

            if (token) {
                await axios.post(
                    `${apiUrl}/auth/logout`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            ["userInfo", "selectedBuilding", "selectedBuildingId"].forEach((key) =>
                localStorage.removeItem(key)
            );

            window.location.href = "/";
        } catch (error) {
            console.error("Error during logout:", error);

            ["userInfo", "selectedBuilding", "selectedBuildingId"].forEach((key) =>
                localStorage.removeItem(key)
            );
            window.location.href = "/";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={isExpired ? undefined : onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
                            <AlertCircle className="w-8 h-8 text-warning" />
                        </div>
                        <DialogTitle className="text-xl">
                            {isExpired
                                ? t("contactOrg.trialExpiredTitle")
                                : t("contactOrg.subscriptionRequiredTitle")}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="text-center space-y-4 py-4">
                    <p className="text-muted-foreground">
                        {isExpired
                            ? t("contactOrg.trialExpiredMessage")
                            : t("contactOrg.subscriptionRequiredMessage")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {t("contactOrg.contactManager")}
                    </p>

                    <div className="flex items-center justify-center gap-2 p-4 bg-muted rounded-lg">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm">
                            {t("contactOrg.reachOut")}
                        </span>
                    </div>
                </div>

                {!isExpired && (
                    <div className="flex justify-center pt-2">
                        <Button variant="outline" onClick={onClose}>
                            {t("contactOrg.close")}
                        </Button>
                    </div>
                )}
                <Button
                    onClick={handleLogout}
                    size="lg"
                    className="min-w-40 font-medium"
                >
                    {t("contactOrg.logout")}
                </Button>
            </DialogContent>
        </Dialog>
    );
};
