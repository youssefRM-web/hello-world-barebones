import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { CalendarIcon, User, Upload, X, FileText, Trash2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReferenceData } from "@/contexts/ReferenceDataContext";
import { useCreateLoggedMaterialMutation } from "@/hooks/queries";
import { validateFileSizes, formatFileSize, MAX_FILE_SIZE_MB } from "@/utils/fileValidation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";

interface LogMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
}

const isImageFile = (file: File) => file.type.startsWith("image/");

export function LogMaterialModal({
  isOpen,
  onClose,
  taskId,
}: LogMaterialModalProps) {
  const { users } = useReferenceData();
  const { mutate: createLoggedMaterial, isPending } =
    useCreateLoggedMaterialMutation();
  const { t } = useLanguage();
  const [date, setDate] = useState<Date>(new Date());
  const [amount, setAmount] = useState("0,00");
  const [selectedUser, setSelectedUser] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Generate preview URLs for image files
  const filePreviews = useMemo(() => {
    return uploadedFiles.map((file) => {
      if (isImageFile(file)) {
        return URL.createObjectURL(file);
      }
      return null;
    });
  }, [uploadedFiles]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const validFiles = validateFileSizes(Array.from(files), t);
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
    // Reset input to allow re-selecting same file
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    // Revoke object URL to prevent memory leak
    if (filePreviews[index]) {
      URL.revokeObjectURL(filePreviews[index]!);
    }
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedUser) {
      return;
    }

    const formData = new FormData();
    formData.append("id_user", selectedUser);
    formData.append("log_date", date.toISOString());
    formData.append("amount", amount.replace(",", "."));
    if (description) {
      formData.append("description", description);
    }
    uploadedFiles.forEach((file) => {
      formData.append("attachments", file);
    });

    createLoggedMaterial(
      { taskId, formData },
      {
        onSuccess: () => {
          // Revoke all preview URLs
          filePreviews.forEach((url) => url && URL.revokeObjectURL(url));
          setDate(new Date());
          setAmount("0.00");
          setSelectedUser("");
          setDescription("");
          setUploadedFiles([]);
          onClose();
        },
      }
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 flex flex-col max-h-[90vh]">
        <DialogHeader className="relative flex justify-between flex-row pt-6 pr-6 pl-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="flex gap-2 text-lg font-semibold">
            <div>
              <h3 className="text-base font-semibold">{t("board.logMaterialTitle")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("board.logMaterialDescription")}
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

        <div className="overflow-y-auto flex-1">
          <div className="space-y-4">
            {/* File Upload */}
            <div className="bg-[#F2F4F7] p-6 space-y-3">
              <label className="block border-2 bg-white border-dashed border-muted-foreground/30 rounded-lg py-3 text-center cursor-pointer hover:bg-accent/50 transition-colors">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="flex justify-center items-center gap-1">
                  <p className="text-sm text-primary font-medium">
                    {t("support.browseFiles")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("board.orDragAndDrop")}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("board.maxFileSize") || `File size cannot exceed ${MAX_FILE_SIZE_MB} MB`}
                </p>
              </label>
              
              {/* Display uploaded files with preview */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between p-2 bg-white rounded border">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {filePreviews[index] ? (
                            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={filePreviews[index]!}
                                alt={file.name}
                                className="w-full h-full object-cover"
                                style={{ imageOrientation: 'from-image' }}
                              />
                            </div>
                          ) : (
                            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate max-w-[200px]">
                              {file.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {/* Image preview */}
                      {filePreviews[index] && (
                        <div className="rounded-lg overflow-hidden border bg-muted">
                          <img
                            src={filePreviews[index]!}
                            alt={file.name}
                            className="w-full max-h-40 object-contain bg-black/5"
                            style={{ imageOrientation: 'from-image' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date & Amount */}
            <div className="grid grid-cols-2 gap-4 pl-6 pr-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("board.date")}</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : <span>{t("board.pickADate")}</span>}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">{t("board.amount")}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                    €
                  </span>
                  <Input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            {/* Select user */}
            <div className="space-y-2 pl-6 pr-6">
              <label className="text-sm font-medium">{t("board.selectUser")}</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full relative justify-start gap-2">
                  <User className="h-4 w-4" />
                  <SelectValue placeholder={t("board.selectUser")}>
                    {selectedUser ? (
                      <div className="flex items-center gap-2">
                        <span>
                          {users.find((u) => u._id === selectedUser)?.Name} {" "}
                          {users.find((u) => u._id === selectedUser)?.Last_Name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{t("board.selectUser")}</span>
                      </div>
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
            <div className="space-y-2 pl-6 pr-6">
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
            <div className="flex gap-3 p-6">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
