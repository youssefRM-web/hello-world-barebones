import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu } from "@/hooks/useMenu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Loader2, Calendar, DollarSign, Tag, Utensils, Flame, Scale, ChefHat } from "lucide-react";

export function MenuItemsTable() {
  const { t } = useLanguage();
  const { restaurant } = useAuth();

  // menus may be string[] or object[] with _id
  const rawMenus = restaurant?.menus ?? [];
  const menuId = typeof rawMenus[0] === "string" ? rawMenus[0] : (rawMenus[0] as any)?._id;
  const { data: menuData, isLoading, error } = useMenu(menuId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-center">
        {(error as Error).message}
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
        {t("noMenuItems")}
      </div>
    );
  }

  const currency = menuData.currency === "TND" ? "TND " : menuData.currency === "EUR" ? "€" : "$";
  const categories = menuData.menus ?? [];
  const createdDate = menuData.created_at ? new Date(menuData.created_at).toLocaleDateString() : "-";

  return (
    <div className="space-y-6">
      {/* Menu Header Card */}
      <div className="bg-card rounded-xl border border-border p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              {menuData.menu_name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {t("currency")}: <span className="font-medium text-foreground">{menuData.currency}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t("createdAt")}: <span className="font-medium text-foreground">{createdDate}</span>
              </span>
              <span className="flex items-center gap-1">
                <Utensils className="w-4 h-4" />
                {categories.length} {t("categoriesCount")}
              </span>
            </div>
          </div>

          {/* Offer badge */}
          {menuData.offer?.active && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 md:max-w-xs">
              <div className="flex items-center gap-2 mb-1">
                <Tag className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm text-primary">{menuData.offer.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{menuData.offer.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Categories as Tabs */}
      {categories.length > 0 ? (
        <Tabs defaultValue={categories[0]?.category_name} className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.category_name}
                value={cat.category_name}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat.category_name}
                <Badge variant="secondary" className="ml-2 text-xs">{cat.items.length}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.category_name} value={cat.category_name}>
              {/* Desktop Table */}
              <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("itemName")}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("description")}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("ingredients")}</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">{t("calories")}</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">{t("portionSize")}</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">{t("price")}</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">{t("availability")}</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">{t("actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-semibold text-foreground">{item.item_name || "-"}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-[200px] truncate">
                          {item.description || "-"}
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground max-w-[150px] truncate">
                          {Array.isArray(item.ingredients) ? item.ingredients.join(", ") : item.ingredients || "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.calories ? (
                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                              <Flame className="w-3 h-3" />{item.calories}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.portion_size ? (
                            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                              <Scale className="w-3 h-3" />{item.portion_size}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-semibold text-foreground">
                          {currency}{(item.price ?? 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Checkbox
                            checked={item.available !== false}
                            className="border-primary data-[state=checked]:bg-primary"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="bg-primary/10 hover:bg-primary/20 text-primary rounded-lg p-2 h-auto"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {cat.items.map((item, idx) => (
                  <div key={idx} className="bg-card rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground">{item.item_name || "-"}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.description || "-"}</p>
                      </div>
                      <span className="text-base font-bold text-primary ml-3 whitespace-nowrap">
                        {currency}{(item.price ?? 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {item.ingredients && (
                        <span className="bg-muted rounded-md px-2 py-1">
                          {Array.isArray(item.ingredients) ? item.ingredients.join(", ") : item.ingredients}
                        </span>
                      )}
                      {item.calories && (
                        <span className="bg-muted rounded-md px-2 py-1 flex items-center gap-1">
                          <Flame className="w-3 h-3" />{item.calories} cal
                        </span>
                      )}
                      {item.portion_size && (
                        <span className="bg-muted rounded-md px-2 py-1 flex items-center gap-1">
                          <Scale className="w-3 h-3" />{item.portion_size}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={item.available !== false} className="border-primary data-[state=checked]:bg-primary" />
                        <span className="text-sm text-muted-foreground">{t("available")}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="bg-primary/10 hover:bg-primary/20 text-primary rounded-lg p-2 h-auto">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground">
          {t("noMenuItems")}
        </div>
      )}

      {/* Supplements Section */}
      {menuData.Supplements && (menuData.Supplements as any[]).length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold text-foreground mb-3">{t("supplements")}</h3>
          <div className="text-sm text-muted-foreground">
            {(menuData.Supplements as any[]).map((sup: any, idx: number) => (
              <div key={idx} className="py-1">{sup.name || JSON.stringify(sup)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
