import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/hooks/useApi";
import { apiService, endpoints } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

interface AddTaskToChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  onTaskAdded?: () => void;
}

interface ChecklistTask {
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  assignee?: string;
}

export function AddTaskToChecklistModal({
  isOpen,
  onClose,
  taskId,
  onTaskAdded,
}: AddTaskToChecklistModalProps) {
  const { executeRequest, isLoading } = useApi();
  const { t } = useLanguage();
  const [formData, setFormData] = useState<ChecklistTask>({
    title: "",
    description: "",
    priority: "Medium",
    assignee: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    await executeRequest(
      () =>
        apiService.post(`${endpoints.acceptedTasks}/${taskId}/checklist`, {
          ...formData,
          status: "TO_DO",
        }),
      {
        onSuccess: () => {
          onTaskAdded?.();
          onClose();
          setFormData({
            title: "",
            description: "",
            priority: "Medium",
            assignee: "",
          });
        },
        successMessage: t("board.taskAddedSuccess"),
      }
    );
  };

  const handleInputChange = (field: keyof ChecklistTask, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("board.addTaskToChecklist")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              {t("board.taskTitle")} *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder={t("board.enterTaskTitle")}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t("board.description")}
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder={t("board.enterTaskDescription")}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-medium">
              {t("board.priority")}
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value: "Low" | "Medium" | "High") =>
                handleInputChange("priority", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">{t("board.low")}</SelectItem>
                <SelectItem value="Medium">{t("board.medium")}</SelectItem>
                <SelectItem value="High">{t("board.high")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee" className="text-sm font-medium">
              {t("board.assigneeOptional")}
            </Label>
            <Input
              id="assignee"
              value={formData.assignee}
              onChange={(e) => handleInputChange("assignee", e.target.value)}
              placeholder={t("board.enterAssigneeName")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {t("board.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
            >
              {isLoading ? t("board.adding") : t("board.addTask")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
