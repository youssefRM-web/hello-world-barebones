import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useCurrentUserQuery } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ClipboardList,
  Mail,
  Ban,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface UserActivityHoverCardProps {
  userId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  profilePicture?: string;
  boardTasks?: any;
  buildings?: any;
  acceptedBy?: string;
  accessBlocked?: boolean;
  inviteId?: any;
}

const UserActivityHoverCard = ({
  userId,
  firstName,
  lastName,
  email,
  profilePicture,
  boardTasks,
  buildings,
  acceptedBy,
  accessBlocked: initialAccessBlocked,
  inviteId,
}: UserActivityHoverCardProps) => {
  const { t } = useLanguage();
  const { acceptedTasks } = useReferenceData();
  const { isAdmin } = usePermissions();
  const { data: currentUser } = useCurrentUserQuery();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [accessBlocked, setAccessBlocked] = useState(
    initialAccessBlocked || false,
  );
  const isSelf = currentUser?._id === userId || currentUser?._id === acceptedBy;

  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : t("common.unknownUser") || "Unknown User";

  const initials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";

  const assignedTaskCount = userId
    ? acceptedTasks.filter((task) => {
        const assignee = task.Assigned_to?.[0];
        const assigneeId =
          typeof assignee === "object" ? assignee?._id : assignee;
        return assigneeId === userId && !task.archived;
      }).length
    : 0;

  const handleAction = async (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId && !acceptedBy) return;
    try {
      setIsLoading(true);
      switch (action) {
        case "revoke-access":
          await userService.revokeAccess(acceptedBy || userId!);
          setAccessBlocked(true);
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["organization", currentUser?.Organization_id?._id],
            }),
            queryClient.invalidateQueries({ queryKey: ["tasks"] }),
            queryClient.invalidateQueries({ queryKey: ["reference-data"] }),
            queryClient.invalidateQueries({ queryKey: ["issues"] }),
          ]);
          toast({
            title: t("organisation.success"),
            description: t("organisation.accessBlocked"),
            variant: "success",
          });
          break;
        case "restore-access":
          await userService.restoreAccess(acceptedBy || userId!);
          setAccessBlocked(false);
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ["organization", currentUser?.Organization_id?._id],
            }),
            queryClient.invalidateQueries({ queryKey: ["tasks"] }),
            queryClient.invalidateQueries({ queryKey: ["reference-data"] }),
            queryClient.invalidateQueries({ queryKey: ["issues"] }),
          ]);
          toast({
            title: t("organisation.success"),
            description: t("organisation.accessRestored"),
            variant: "success",
          });
          break;
        case "delete-user":
          if (confirm(t("organisation.deleteUserConfirm"))) {
            await userService.deleteUser(inviteId!);
            await Promise.all([
              queryClient.invalidateQueries({
                queryKey: ["organization", currentUser?.Organization_id?._id],
              }),
              queryClient.invalidateQueries({ queryKey: ["tasks"] }),
              queryClient.invalidateQueries({ queryKey: ["reference-data"] }),
              queryClient.invalidateQueries({ queryKey: ["issues"] }),
            ]);
            toast({
              title: t("organisation.success"),
              description: t("organisation.userDeleted"),
              variant: "success",
            });
          }
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
      toast({
        title: t("organisation.error"),
        description: `Failed to ${action.replace("-", " ")}.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <span className="text-primary text-sm font-medium cursor-pointer hover:underline transition-all">
          {fullName}
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 p-4" side="bottom" align="start">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12 shrink-0">
            {profilePicture ? (
              <AvatarImage src={profilePicture} alt={fullName} />
            ) : null}
            <AvatarFallback className="bg-[#0F4C7BFF] text-primary-foreground text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground truncate capitalize">
              {fullName}
            </p>
            {email && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <Mail className="h-3.5 w-3.5" />
                <span>{email}</span>
              </div>
            )}
            {boardTasks && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <ClipboardList className="h-3.5 w-3.5" />
                <span>
                  {boardTasks.length}{" "}
                  {boardTasks.length === 1
                    ? t("board.boardTask")
                    : t("board.boardTask")}
                </span>
              </div>
            )}
            {buildings && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>
                  {buildings.length}{" "}
                  {buildings.length === 1
                    ? t("board.boardBuilding")
                    : t("board.boardBuilding")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/*  {isAdmin && !isSelf && (
          <>
            <Separator className="my-3" />
            <div className="space-y-1">
              {accessBlocked ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-8 text-foreground hover:bg-accent"
                  onClick={(e) => handleAction("restore-access", e)}
                  disabled={isLoading || (!acceptedBy && !userId)}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  {t("organisation.restoreAccess")}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-8 text-destructive hover:bg-accent"
                  onClick={(e) => handleAction("revoke-access", e)}
                  disabled={isLoading || (!acceptedBy && !userId)}
                >
                  <Ban className="h-3.5 w-3.5 mr-2" />
                  {t("organisation.revokeAccess")}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8 text-destructive hover:bg-accent"
                onClick={(e) => handleAction("delete-user", e)}
                disabled={isLoading}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                {t("organisation.deleteUser")}
              </Button>
            </div>
          </>
        )} */}
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserActivityHoverCard;
