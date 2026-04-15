import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { OrdersOverview } from "@/components/dashboard/OrdersOverview";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { MostOrdered } from "@/components/dashboard/MostOrdered";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";

const Index = () => {
  const { t } = useLanguage();
  const { restaurant } = useAuth();
  const { data: orders } = useOrders();

  const totalOrders = orders?.length ?? 0;
  const pendingOrders = orders?.filter(o => ["pending_payment", "confirmed", "preparing"].includes(o.status)).length ?? 0;
  const completedOrders = orders?.filter(o => o.status === "delivered").length ?? 0;

  const kpiData = [
    { titleKey: "menusToday", value: restaurant?.menus?.length ?? 0, percentage: 100, color: "blue" as const },
    { titleKey: "ordersPending", value: pendingOrders, percentage: totalOrders ? Math.round((pendingOrders / totalOrders) * 100) : 0, color: "red" as const },
    { titleKey: "ordersCompleted", value: completedOrders, percentage: totalOrders ? Math.round((completedOrders / totalOrders) * 100) : 0, color: "green" as const },
    { titleKey: "totalOrders", value: totalOrders, percentage: 100, color: "dark" as const },
  ];

  return (
    <DashboardLayout>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">{t("dashboard")}</h1>
        <p className="text-sm md:text-base text-[#181522]">
          {t("welcomeBack")} {restaurant?.name || ""}
        </p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        {kpiData.map((kpi) => (
          <KPICard
            key={kpi.titleKey}
            title={t(kpi.titleKey)}
            value={kpi.value}
            percentage={kpi.percentage}
            color={kpi.color}
          />
        ))}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <OrdersOverview />
        <RevenueChart />
      </div>
      
      {/* Most Ordered */}
      <MostOrdered />
    </DashboardLayout>
  );
};

export default Index;
