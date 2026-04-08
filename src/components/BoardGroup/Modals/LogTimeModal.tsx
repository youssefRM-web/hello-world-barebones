import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { format } from "date-fns";
import { CalendarIcon, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useState } from "react";
import { useCreateLoggedTimeMutation } from "@/hooks/queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

interface LogTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

export function LogTimeModal({ isOpen, onClose, taskId }: LogTimeModalProps) {
  const { users } = useReferenceData();
  const { mutate: createLoggedTime, isPending } = useCreateLoggedTimeMutation();
  const { t } = useLanguage();
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [selectedUser, setSelectedUser] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!selectedUser) {
      return;
    }
    createLoggedTime(
      {
        taskId,
        data: {
          date: date.toISOString(),
          start_time: startTime,
          end_time: endTime,
          description,
          id_user: selectedUser,
        },
      },
      {
        onSuccess: () => {
          setDate(new Date());
          setStartTime("09:00");
          setEndTime("10:00");
          setSelectedUser("");
          setDescription("");
          onClose();
        },
      }
    );
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <DialogTitle className="flex gap-2 text-lg font-semibold">
            <div>
              <h3 className="text-lg font-semibold ">{t("board.logTimeTitle")}</h3>
              <p className="text-sm text-muted-foreground mb-4 font-medium">
                {t("board.logTimeDescription")}
              </p>
            </div>
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-6 w-6"
            style={{ margin: 0 }}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 ">
          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("board.date")}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  {date ? format(date, "dd.MM.yy") : <span>{t("board.pickADate")}</span>}
                  <CalendarIcon className=" h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CustomCalendar
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Start Time & End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("board.startTime")}</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("board.endTime")}</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Select User */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("board.selectUser")}</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-full relative justify-start gap-2">
                <User className="h-4 w-4" />
                <SelectValue placeholder={t("board.selectUser")}>
                  {selectedUser ? (
                    <div className="flex items-center gap-2">
                      <span>
                        {users.find((u) => u._id === selectedUser)?.Name}{" "}
                        {users.find((u) => u._id === selectedUser)?.Last_Name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">{t("board.selectUser")}</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                          <div className="flex items-center gap-3 py-1">
                            <Avatar className="h-8 w-8">
                              {user?.profile_picture ? (
                                <AvatarImage
                                  src={user.profile_picture}
                                  alt={user.Name}
                                />
                              ) : (
                                <AvatarFallback className="bg-[#0F4C7BFF] text-white text-xs">
                                  {user.Name?.[0]?.toUpperCase()}
                                  {user.Last_Name?.[0]?.toUpperCase()}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium first-letter:uppercase">
                                {user.Name} {user.Last_Name}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("board.descriptionOptional")}
            </label>
            <Textarea
              placeholder={t("board.enterDescription")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              className="flex-1 bg-[#1759E8FF] hover:bg-blue-700"
              onClick={handleSubmit}
              disabled={!selectedUser || isPending}
            >
              {isPending ? t("board.submitting") : t("board.submit")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
