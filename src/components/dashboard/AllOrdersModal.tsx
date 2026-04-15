import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import pizzaImg from "@/assets/pizza-margherita.png";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface Order {
  id: number;
  nameKey: string;
  quantity: number;
  time: string;
  status: "pending" | "completed" | "cancelled";
}

const allOrders: Order[] = [
  { id: 1, nameKey: "pizzaMargherita", quantity: 2, time: "11.30 AM", status: "pending" },
  { id: 2, nameKey: "pizzaMargherita", quantity: 3, time: "11.45 AM", status: "pending" },
  { id: 3, nameKey: "pizzaMargherita", quantity: 1, time: "12.00 PM", status: "cancelled" },
  { id: 4, nameKey: "pizzaMargherita", quantity: 2, time: "12.15 PM", status: "cancelled" },
  { id: 5, nameKey: "pizzaMargherita", quantity: 4, time: "12.30 PM", status: "completed" },
  { id: 6, nameKey: "pizzaMargherita", quantity: 2, time: "12.45 PM", status: "pending" },
  { id: 7, nameKey: "pizzaMargherita", quantity: 1, time: "01.00 PM", status: "pending" },
  { id: 8, nameKey: "pizzaMargherita", quantity: 3, time: "01.15 PM", status: "completed" },
  { id: 9, nameKey: "pizzaMargherita", quantity: 2, time: "01.30 PM", status: "completed" },
  { id: 10, nameKey: "pizzaMargherita", quantity: 1, time: "01.45 PM", status: "pending" },
];

const statusColors = {
  pending: "bg-warning/10 text-[#E19C34]",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const borderColors = {
  pending: "border-[#E19C34]",
  completed: "border-[#3CC34F]",
  cancelled: "border-[#F24040]",
};

interface AllOrdersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AllOrdersModal({ open, onOpenChange }: AllOrdersModalProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t("allOrders")}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {allOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border"
            >
              <img
                src={pizzaImg}
                alt={t(order.nameKey)}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {t(order.nameKey)} (x{order.quantity})
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("today")} - {order.time}
                </p>
              </div>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs border font-medium whitespace-nowrap",
                  statusColors[order.status],
                  borderColors[order.status]
                )}
              >
                {t(order.status)}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
