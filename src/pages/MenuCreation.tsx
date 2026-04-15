import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Pencil, ScanLine, ArrowLeft, Plus, ChefHat, DollarSign, Calendar, Utensils, Tag, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { AddMenuItemModal } from "@/components/menu/AddMenuItemModal";
import { EditMenuModal } from "@/components/menu/EditMenuModal";
import { DeleteMenuDialog } from "@/components/menu/DeleteMenuDialog";
import { MenuUploadView } from "@/components/menu/MenuUploadView";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/hooks/useMenu";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import type { MenuData } from "@/lib/api";

const MenuCreation = () => {
  const { t } = useLanguage();
  const { restaurant } = useAuth();
  const navigate = useNavigate();
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMenu, setEditMenu] = useState<MenuData | null>(null);
  const [deleteMenu, setDeleteMenu] = useState<{ id: string; name: string } | null>(null);

  const rawMenus = restaurant?.menus ?? [];
  const menuId = typeof rawMenus[0] === "string" ? rawMenus[0] : (rawMenus[0] as any)?._id;
  const { data: menuData, isLoading: menuLoading } = useMenu(menuId);

  if (showUploadMenu) {
    return (
      <DashboardLayout>
        <MenuUploadView onGoBack={() => setShowUploadMenu(false)} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("createYourMenu")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("chooseBestOption")}</p>
          </div>
          <Button
            className="bg-[#0A2472] rounded-full hover:bg-[#0A2472]/90 text-white text-xs sm:text-sm w-fit"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{t("createNewMenu")}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-full mb-8">
        <div className="bg-card rounded-xl border border-border p-6 sm:p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0A2472] flex items-center justify-center mb-4 sm:mb-6">
            <Pencil className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">{t("manualEntry")}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-xs">{t("manualEntryDesc")}</p>
          <Button className="w-full rounded-full max-w-[200px] bg-[#0A2472] hover:bg-[#0A2472]/90 text-primary-foreground text-sm" onClick={() => setShowAddModal(true)}>
            {t("startManualEntry")}
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 sm:p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0A2472] flex items-center justify-center mb-4 sm:mb-6">
            <ScanLine className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3">{t("aiMenuScan")}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 max-w-xs">{t("aiMenuScanDesc")}</p>
          <Button className="w-full rounded-full max-w-[200px] bg-[#0A2472] hover:bg-[#0A2472]/90 text-primary-foreground text-sm" onClick={() => setShowUploadMenu(true)}>
            {t("uploadMenu")}
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">{t("existingMenus")}</h2>

        {menuLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!menuLoading && !menuData && (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
            {t("noMenusYet")}
          </div>
        )}

        {!menuLoading && menuData && (
          <div className="space-y-4">
            <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-primary" />
                    {menuData.menu_name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{menuData.currency}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{menuData.created_at ? new Date(menuData.created_at).toLocaleDateString() : "-"}</span>
                    <span className="flex items-center gap-1"><Utensils className="w-4 h-4" />{menuData.menus?.length || 0} {t("categoriesCount")}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {menuData.menus?.map((cat, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {cat.category_name} ({cat.items.length} {t("items")})
                      </Badge>
                    ))}
                  </div>
                  {menuData.offer?.active && (
                    <div className="flex items-center gap-2 mt-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary font-medium">{menuData.offer.title}</span>
                      <span className="text-xs text-muted-foreground">– {menuData.offer.description}</span>
                    </div>
                  )}
                  {menuData.Supplements && (menuData.Supplements as any[]).length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {(menuData.Supplements as any[]).length} {t("supplements")}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="border-[#0A2472] text-[#0A2472] hover:bg-[#0A2472]/10 rounded-full text-sm" onClick={() => navigate("/menu-editing")}>
                    <Eye className="w-4 h-4 mr-2" />{t("viewDetails")}
                  </Button>
                  <Button variant="outline" className="border-[#0A2472] text-[#0A2472] hover:bg-[#0A2472]/10 rounded-full text-sm" onClick={() => setEditMenu(menuData)}>
                    <Pencil className="w-4 h-4 mr-2" />{t("editMenu")}
                  </Button>
                  <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 rounded-full text-sm" onClick={() => setDeleteMenu({ id: menuData._id, name: menuData.menu_name })}>
                    <Trash2 className="w-4 h-4 mr-2" />{t("delete")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddMenuItemModal open={showAddModal} onOpenChange={setShowAddModal} />
      <EditMenuModal open={!!editMenu} onOpenChange={(o) => !o && setEditMenu(null)} menuData={editMenu} />
      <DeleteMenuDialog
        open={!!deleteMenu}
        onOpenChange={(o) => !o && setDeleteMenu(null)}
        menuId={deleteMenu?.id ?? null}
        menuName={deleteMenu?.name ?? ""}
      />
    </DashboardLayout>
  );
};

export default MenuCreation;
