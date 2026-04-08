import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Download, X, FileText } from "lucide-react";
import {
  useLoggedMaterialQuery,
  useDeleteLoggedMaterialMutation,
} from "@/hooks/queries";
import { format } from "date-fns";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoggedMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

export function LoggedMaterialsModal({
  isOpen,
  onClose,
  taskId,
}: LoggedMaterialsModalProps) {
  const { data: loggedMaterials = [], isLoading } =
    useLoggedMaterialQuery(taskId);
  const { mutate: deleteLoggedMaterial } = useDeleteLoggedMaterialMutation();
  const { users } = useReferenceData();
  const { t } = useLanguage();


  const getInitials = (name: string, lastName: string) => {
    return `${name[0]}${lastName[0]}`?.toUpperCase();
  };

  const handleDelete = (loggedMaterialId: string) => {
    deleteLoggedMaterial({ taskId, loggedMaterialId });
  };

  const { hasPermission } = usePermissions();

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = url.split("/").pop() || "file";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="relative flex justify-between flex-row pt-6 pr-6 pl-6">
          <DialogTitle className="flex gap-2 text-lg font-semibold">
            <div>
              <h3 className="text-base font-semibold">{t("board.loggedMaterialsTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("board.loggedMaterialsDescription")}
              </p>
            </div>
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 "
            onClick={onClose}
            style={{ margin: 0 }}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3 p-6 bg-[#F2F4F7]">
            {isLoading ? (
              <div className="text-center text-muted-foreground py-8">
                {t("board.loading")}
              </div>
            ) : loggedMaterials.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="font-medium">{t("board.noActivitiesYet")}</p>
                <p className="text-sm italic">
                  {t("board.startLoggingMaterials")}
                </p>
              </div>
            ) : (
              loggedMaterials?.map((item) => {
                return (
                  <div
                    key={item._id}
                    className="p-3 border rounded-lg bg-background space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#E0F2FE] text-[#1E75AA] flex items-center gap-1 text-xs font-medium px-4 py-1 rounded">
                          € {item.amount?.toFixed(2)}
                        </div>
                        <div className="bg-[#F2F4F7] text-foreground flex items-center gap-1 text-xs font-medium px-4 py-1 rounded">
                          {format(new Date(item?.log_date), "dd.MM.yy")}
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-6 w-6 ring-2 ring-background">
                            {item?.id_user?.profile_picture ? (
                              <AvatarImage src={item?.id_user?.profile_picture} />
                            ) : (
                               <AvatarFallback className="border bg-[#F2F4F7] text-muted-foreground text-xs">
                                {getInitials(item?.id_user?.Name, item?.id_user?.Last_Name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium text-xs text-foreground first-letter:uppercase">
                              {item?.id_user?.Name} {item?.id_user?.Last_Name}
                            </p>
                          </div>
                        </div>
                      </div>
                      {hasPermission("board", "editMaterialLog") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(item?._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {item.description && (
                      <div className="text-sm font-medium">
                        {item.description}
                      </div>
                    )}

                    {item.attachements &&
                      item.attachements.length > 0 &&
                       item.attachements.map((attachment, idx) => {
                        const fileUrl = typeof attachment === "string" ? attachment : attachment?.url || "";
                        const fileName = fileUrl.split("/").pop() || "file";
                         if (!fileUrl) return null;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-[#F2F4F7] rounded"
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-[#1759E8FF]" />
                              <div>
                                <div className="text-sm font-medium">
                                  {fileName}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownload(fileUrl)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
