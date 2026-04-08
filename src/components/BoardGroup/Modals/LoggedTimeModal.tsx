import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";
import {
  useLoggedTimeQuery,
  useDeleteLoggedTimeMutation,
} from "@/hooks/queries";
import { LoggedTimeDisplay } from "@/types/logged";
import { format } from "date-fns";
import { usePermissions } from "@/contexts/PermissionsContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoggedTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

export function LoggedTimeModal({
  isOpen,
  onClose,
  taskId,
}: LoggedTimeModalProps) {
  const { data: loggedTimes = [], isLoading } = useLoggedTimeQuery(taskId);
  const { mutate: deleteLoggedTime } = useDeleteLoggedTimeMutation();
  const { hasPermission } = usePermissions();
  const { t } = useLanguage();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getInitials = (name: string, lastName: string) => {
    return `${name[0]}${lastName[0]}`.toUpperCase();
  };

  const handleDelete = (loggedTimeId: string) => {
    deleteLoggedTime({ taskId, loggedTimeId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl p-0">
        <DialogHeader className="relative pt-6 pr-6 pl-6 flex justify-between flex-row">
          <DialogTitle className="flex gap-2 text-lg font-semibold">
            <div>
              <h3 className="text-lg font-semibold">{t("board.loggedTimeTitle")}</h3>
              <p className="text-sm text-muted-foreground font-medium">
                {t("board.loggedTimeDescription")}
              </p>
            </div>
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onClose}
            style={{ margin: 0 }}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 p-6 bg-accent/50">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">
              {t("board.loading")}
            </div>
          ) : loggedTimes.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="font-medium">{t("board.noActivitiesYet")}</p>
              <p className="text-sm italic">
                {t("board.startLoggingTime")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {loggedTimes.map((item) => (
                <div
                  key={item._id}
                  className="p-3 border rounded-lg bg-background space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-wrap ">
                      <div className="bg-[#E0F2FE]  text-[#1E75AA] flex items-center gap-1 text-xs font-medium px-4 py-1 rounded">
                        {formatDuration(item.duration)}
                      </div>
                      <div className="bg-[#F2F4F7] text-foreground flex items-center gap-1 text-xs font-medium px-4 py-1 rounded">
                        {format(new Date(item.date), "dd.MM.yyyy")}
                      </div>
                      <div className="bg-[#F2F4F7] text-foreground flex items-center gap-1 text-xs font-medium px-4 py-1 rounded">
                        {item.start_time} - {item.end_time}
                      </div>
                      {/* User */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6 ">
                        {item.user_id?.profile_picture ? (
                          <AvatarImage src={item.user_id.profile_picture} />
                        ) : (
                          <AvatarFallback className="border bg-[#F2F4F7] text-muted-foreground text-xs">
                            {getInitials(item.user_id?.Name, item.user_id?.Last_Name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium text-xs text-foreground first-letter:uppercase">
                          {item.user_id?.Name} {item.user_id?.Last_Name}
                        </p>
                      </div>
                    </div>
                    </div>
                    {hasPermission("board", "editTimeLog") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {item.description && (
                    <div className="text-sm text-muted-foreground pl-1">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
