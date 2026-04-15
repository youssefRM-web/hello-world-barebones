import { useState } from "react";
import pizzaImg from "@/assets/pizza-margherita.png";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { AllOrdersModal } from "./AllOrdersModal";

interface Order {
  id: number;
  nameKey: string;
  quantity: number;
  time: string;
  status: "pending" | "completed" | "cancelled";
}

const orders: Order[] = [
  { id: 1, nameKey: "pizzaMargherita", quantity: 2, time: "11.30 AM", status: "pending" },
  { id: 2, nameKey: "pizzaMargherita", quantity: 2, time: "11.30 AM", status: "pending" },
  { id: 3, nameKey: "pizzaMargherita", quantity: 2, time: "11.30 AM", status: "cancelled" },
  { id: 4, nameKey: "pizzaMargherita", quantity: 2, time: "11.30 AM", status: "cancelled" },
  { id: 5, nameKey: "pizzaMargherita", quantity: 2, time: "11.30 AM", status: "completed" },
  { id: 6, nameKey: "pizzaMargherita", quantity: 2, time: "11.30 AM", status: "pending" },
  { id: 7, nameKey: "pizzaMargherita", quantity: 2, time: "11.30 AM", status: "pending" },
];

const statusColors = {
  pending: "bg-warning/10 text-[#E19C34]",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};
const borderColors = {
  pending: " border-[#E19C34]",
  completed: " border-[#3CC34F]",
  cancelled: " border-[#F24040] ",
};

export function OrdersOverview() {
  const { t } = useLanguage();
  const [showAllOrders, setShowAllOrders] = useState(false);

  return (
    <>
      <div className="bg-card rounded-xl p-4 md:p-5 shadow-sm border border-border h-full">
        <div className="flex items-start sm:items-end justify-between mb-4 gap-2 flex-col sm:flex-row">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-foreground">{t("ordersOverview")}</h3>
            <p className="text-xs md:text-sm text-muted-foreground">{t("latestOrders")}</p>
          </div>
          <button
            onClick={() => setShowAllOrders(true)}
            className="text-xs md:text-sm text-[#0A2472] hover:underline whitespace-nowrap"
          >
            {t("viewAllOrders")}
          </button>
        </div>

      <div className="space-y-2 md:space-y-3 max-h-[280px] md:max-h-[320px] overflow-y-auto pr-1 md:pr-2">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center gap-2 md:gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <img
              src={pizzaImg}
              alt={t(order.nameKey)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-semibold text-foreground truncate">
                {t(order.nameKey)} (x{order.quantity})
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                {t("today")} - {order.time}
              </p>
            </div>
            <span
              className={cn(
                "px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs border font-medium whitespace-nowrap",
                statusColors[order.status], borderColors[order.status]
              )}
            >
              {t(order.status)}
            </span>
          </div>
        ))}
      </div>
      </div>
      <AllOrdersModal open={showAllOrders} onOpenChange={setShowAllOrders} />
    </>
  );
}
