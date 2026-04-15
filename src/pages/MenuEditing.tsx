import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { MenuItemsTable } from "@/components/menu/MenuItemsTable";

const MenuEditing = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">{t("reviewEditData")}</h1>
        <p className="text-sm md:text-base text-muted-foreground">{t("reviewEditDataDesc")}</p>
      </div>
      
      <MenuItemsTable />
    </DashboardLayout>
  );
};

export default MenuEditing;
