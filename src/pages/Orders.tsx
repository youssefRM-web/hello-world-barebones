import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { OrderDetails } from "@/components/orders/OrderDetails";
import { useOrders, useOrder, useUpdateOrder } from "@/hooks/useOrders";
import type { ApiOrder } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending_payment: "bg-warning/10 text-[#E19C34]",
  confirmed: "bg-success/10 text-success",
  preparing: "bg-blue-100 text-blue-600",
  ready: "bg-emerald-100 text-emerald-600",
  on_the_way: "bg-purple-100 text-purple-600",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const borderColors: Record<string, string> = {
  pending_payment: "border-[#E19C34]",
  confirmed: "border-[#3CC34F]",
  preparing: "border-blue-400",
  ready: "border-emerald-400",
  on_the_way: "border-purple-400",
  delivered: "border-[#3CC34F]",
  cancelled: "border-[#F24040]",
};

function getCustomerName(order: ApiOrder): string {
  return order.customer_name || order.customer?.name || "Unknown";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

const Orders = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { data: orders, isLoading, error } = useOrders();
  const { data: selectedOrder, isLoading: isLoadingDetail } = useOrder(selectedOrderId || "");
  const updateOrder = useUpdateOrder();

  const handleOrderClick = (order: ApiOrder) => {
    setSelectedOrderId(order._id);
  };

  const handleGoBack = () => {
    setSelectedOrderId(null);
  };

  const handleUpdateStatus = (orderId: string, status: string) => {
    updateOrder.mutate(
      { id: orderId, data: { status } },
      {
        onSuccess: () => {
          toast({ title: t("orderUpdated"), description: `${t("status")}: ${status}` });
        },
        onError: (err: any) => {
          toast({ title: t("error"), description: err.message, variant: "destructive" });
        },
      }
    );
  };

  // Show order details view
  if (selectedOrderId) {
    if (isLoadingDetail) {
      return (
        <DashboardLayout>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </DashboardLayout>
      );
    }

    if (selectedOrder) {
      const items = (selectedOrder.items || []).map((item) => ({
        name: item.item_name || t("item"),
        quantity: item.quantity,
        priceEach: item.price,
        total: item.total ?? item.price * item.quantity,
      }));

      const totalPrice = selectedOrder.total_price ?? selectedOrder.total_amount ?? items.reduce((s, i) => s + i.total, 0);

      return (
        <DashboardLayout>
          <OrderDetails
            order={{
              id: selectedOrder._id,
              orderNumber: selectedOrder.order_number || `#${selectedOrder._id.slice(-6)}`,
              customerName: getCustomerName(selectedOrder),
              orderDate: formatDate(selectedOrder.created_at || selectedOrder.createdAt),
              items,
              subtotal: selectedOrder.subtotal ?? totalPrice,
              serviceFee: selectedOrder.service_fee ?? 0,
              totalAmount: totalPrice,
              status: selectedOrder.status,
              currency: selectedOrder.currency || "USD",
              source: selectedOrder.source,
            }}
            onGoBack={handleGoBack}
          />
        </DashboardLayout>
      );
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">{t("ordersManagement")}</h1>
        <p className="text-sm md:text-base text-muted-foreground">{t("ordersDescription")}</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-center">
          {(error as Error).message}
        </div>
      )}

      {!isLoading && !error && orders && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">{t("noOrders")}</div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">{t("customer")}</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">{t("menu")}</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">{t("date")}</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">{t("price")}</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">{t("status")}</th>
                      <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="border-b text-center border-border last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleOrderClick(order)}
                      >
                        <td className="py-4 px-6 text-sm font-semibold text-foreground">{getCustomerName(order)}</td>
                        <td className="py-4 px-6 text-sm text-foreground font-semibold">{order.menu_name || "-"}</td>
                        <td className="py-4 px-6 text-sm text-foreground font-semibold">{formatDate(order.created_at || order.createdAt)}</td>
                        <td className="py-4 px-6 text-sm text-foreground font-semibold">
                          {(order.currency || "$")}{(order.total_price ?? order.total_amount ?? 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={cn(
                              "px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs border font-medium whitespace-nowrap",
                              statusColors[order.status] || "bg-muted text-muted-foreground",
                              borderColors[order.status] || "border-border"
                            )}
                          >
                            {order.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" className="bg-[#0A2472] text-primary-foreground rounded-full hover:bg-[#0A2472]/90">
                                {t("accept")}
                                <ChevronDown className="w-4 h-4 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, "confirmed")}>
                                {t("accept")}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, "cancelled")}>
                                {t("decline")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="p-4 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground">{getCustomerName(order)}</p>
                        <p className="text-sm text-muted-foreground">{order.menu_name || "-"}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-normal",
                          statusColors[order.status] || "bg-muted text-muted-foreground",
                          borderColors[order.status] || "border-border"
                        )}
                      >
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{formatDate(order.created_at || order.createdAt)}</span>
                      <span className="font-medium text-foreground">
                        {(order.currency || "$")}{(order.total_price ?? order.total_amount ?? 0).toFixed(2)}
                      </span>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                            {t("accept")}
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-full">
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, "confirmed")}>
                            {t("accept")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, "cancelled")}>
                            {t("decline")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Orders;
