import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  X,
  Paperclip,
  Send,
  FileText,
  FileImage,
  File,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCreateTicketMutation } from "@/hooks/queries";
import { pdfIcon } from "../ui/toaster";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateTicketModal = ({ isOpen, onClose }: CreateTicketModalProps) => {
  const { t } = useLanguage();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createTicketMutation = useCreateTicketMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !description.trim()) return;

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("content", description);

    attachments.forEach((file) => {
      formData.append("attachments", file); // matches FilesInterceptor('attachments')
    });

    try {
      await createTicketMutation.mutateAsync(formData);
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };
  const handleClose = () => {
    setSubject("");
    setDescription("");
    setAttachments([]);
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type;
    if (fileType.startsWith("image/")) {
      return <FileImage className="w-4 h-4 text-blue-500" />;
    } else if (fileType === "application/pdf") {
      return pdfIcon;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const getFilePreview = (file: File) => {
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] p-0 flex flex-col rounded-2xl overflow-hidden shadow-2xl">
        {/* HEADER */}
        <DialogHeader className="p-8 pb-6 border-b bg-background shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold tracking-tight">
              {t("support.createTicket")}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-9 w-9 rounded-full hover:bg-accent/80 transition-colors"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {t("support.createTicketDescription")}
          </p>
        </DialogHeader>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-8 ">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Subject */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("support.subject")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder={t("support.enterSubject")}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="h-11 text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("support.describeYourProblem")}{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder={t("support.enterYourProblem")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-40 resize-none text-sm"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                {t("support.attachments")}{" "}
                <span className="text-muted-foreground text-sm">
                  ({t("support.attachmentsOptional")})
                </span>
              </Label>
              <p className="text-sm text-muted-foreground">
                {t("support.attachmentsHint")}
              </p>

              {/* Uploaded Files */}
              {attachments.length > 0 && (
                <div className="space-y-3">
                  {attachments.map((file, index) => {
                    const preview = getFilePreview(file);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-background border rounded-lg shadow-sm hover:shadow transition-shadow group"
                      >
                        <div className="w-14 h-14 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {preview ? (
                            <img
                              src={preview}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getFileIcon(file)
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        {createTicketMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeAttachment(index)}
                            className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-4.5 w-4.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload Area */}
              <label
                htmlFor="ticket-file-upload-input"
                className="block w-full rounded-2xl bg-[#F2F2FD80] border-2 border-dashed border-[#636AE8FF] p-10 cursor-pointer hover:bg-[#636AE8FF]/10 transition-colors"
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <UploadCloud size={54} color="#636AE8FF" />
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("ticket-file-upload-input")?.click();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg shadow-md"
                  >
                    {t("support.browseFiles")}
                  </Button>
                </div>
              </label>

              {/* Hidden actual file input */}
              <input
                id="ticket-file-upload-input"
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8 py-6">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleClose}
              disabled={createTicketMutation.isPending}
              className="min-w-32"
            >
              {t("support.cancel")}
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={
                !subject.trim() ||
                !description.trim() ||
                createTicketMutation.isPending
              }
              size="lg"
              className="min-w-48 font-medium"
            >
              {createTicketMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("support.submitting")}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  {t("support.submit")}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTicketModal;
