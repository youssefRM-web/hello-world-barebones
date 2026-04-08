import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RecurringTaskHelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecurringTaskHelpModal({
  open,
  onOpenChange,
}: RecurringTaskHelpModalProps) {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Recurring Tasks",
      description:
        "Recurring tasks allow you to create activities that automatically reappear on the board at fixed intervals, for example for maintenance, checks, or regular inspections. You specify once:",
      items: [
        "when the task starts,",
        "how often it is repeated (e.g., daily, weekly, monthly, or annually),",
        "and when it should end.",
      ],
      continuation:
        "At each scheduled time, a new, independent task is automatically created on the board, which can be edited, commented on, and completed as normal.",
      conclusion:
        "This ensures that no regular tasks are forgotten and that all recurring work remains clearly documented.",
    },
    de: {
      title: "Wiederkehrende Aufgaben",
      description:
        "Mit wiederkehrenden Aufgaben können Sie Tätigkeiten erstellen, die automatisch in festen Abständen neu im Board erscheinen, zum Beispiel für Wartungen, Kontrollen oder regelmäßige Prüfungen. Sie legen einmal fest:",
      items: [
        "wann die Aufgabe startet,",
        "wie oft sie wiederholt wird (z. B. täglich, wöchentlich, monatlich oder jährlich),",
        "bis wann sie laufen soll.",
      ],
      continuation:
        "Zu jedem geplanten Zeitpunkt wird dann automatisch eine neue, eigenständige Aufgabe im Board erstellt, die ganz normal bearbeitet, kommentiert und abgeschlossen werden kann.",
      conclusion:
        "So stellen Sie sicher, dass keine regelmäßige Aufgabe vergessen wird und alle wiederkehrenden Arbeiten übersichtlich dokumentiert bleiben.",
    },
  };

  const t = content[language as keyof typeof content] || content.en;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{t.title}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground">
          <p>{t.description}</p>
          <ul className="list-disc pl-5 space-y-1">
            {t.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p>{t.continuation}</p>
          <p>{t.conclusion}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
