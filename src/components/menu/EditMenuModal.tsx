import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUpdateMenu } from "@/hooks/useMenu";
import type { MenuData, UpdateMenuPayload } from "@/lib/api";
import { toast } from "sonner";

interface CategoryItem {
  item_name: string;
  description: string;
  ingredients: string;
  price: string;
  calories: string;
  portion_size: string;
  available: boolean;
}

interface Category {
  category_name: string;
  items: CategoryItem[];
}

interface EditMenuModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menuData: MenuData | null;
}

const emptyItem = (): CategoryItem => ({
  item_name: "", description: "", ingredients: "", price: "", calories: "", portion_size: "", available: true,
});

const emptyCategory = (): Category => ({ category_name: "", items: [emptyItem()] });

function toEditItem(item: any): CategoryItem {
  return {
    item_name: item.item_name || "",
    description: item.description || "",
    ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(", ") : item.ingredients || "",
    price: String(item.price ?? ""),
    calories: String(item.calories ?? ""),
    portion_size: item.portion_size || "",
    available: item.available !== false,
  };
}

export function EditMenuModal({ open, onOpenChange, menuData }: EditMenuModalProps) {
  const { t } = useLanguage();
  const updateMenu = useUpdateMenu();

  const [currency, setCurrency] = useState("");
  const [menuName, setMenuName] = useState("");
  const [categories, setCategories] = useState<Category[]>([emptyCategory()]);
  const [supplements, setSupplements] = useState<Category[]>([]);
  const [offerTitle, setOfferTitle] = useState("");
  const [offerDescription, setOfferDescription] = useState("");
  const [offerActive, setOfferActive] = useState(false);

  useEffect(() => {
    if (menuData && open) {
      setCurrency(menuData.currency || "");
      setMenuName(menuData.menu_name || "");
      setCategories(
        menuData.menus?.length
          ? menuData.menus.map(c => ({ category_name: c.category_name, items: c.items.map(toEditItem) }))
          : [emptyCategory()]
      );
      const sups = (menuData.Supplements as any[]) || [];
      setSupplements(sups.map((s: any) => ({ category_name: s.category_name || "", items: (s.items || []).map(toEditItem) })));
      setOfferTitle(menuData.offer?.title || "");
      setOfferDescription(menuData.offer?.description || "");
      setOfferActive(menuData.offer?.active || false);
    }
  }, [menuData, open]);

  const addCategory = () => setCategories(p => [...p, emptyCategory()]);
  const removeCategory = (ci: number) => setCategories(p => p.filter((_, i) => i !== ci));
  const updateCategoryName = (ci: number, v: string) =>
    setCategories(p => p.map((c, i) => i === ci ? { ...c, category_name: v } : c));
  const addItem = (ci: number) =>
    setCategories(p => p.map((c, i) => i === ci ? { ...c, items: [...c.items, emptyItem()] } : c));
  const removeItem = (ci: number, ii: number) =>
    setCategories(p => p.map((c, i) => i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c));
  const updateItem = (ci: number, ii: number, field: keyof CategoryItem, value: string | boolean) =>
    setCategories(p => p.map((c, i) =>
      i === ci ? { ...c, items: c.items.map((it, j) => j === ii ? { ...it, [field]: value } : it) } : c
    ));

  const addSupCategory = () => setSupplements(p => [...p, { category_name: "", items: [emptyItem()] }]);
  const removeSupCategory = (si: number) => setSupplements(p => p.filter((_, i) => i !== si));
  const updateSupCategoryName = (si: number, v: string) =>
    setSupplements(p => p.map((s, i) => i === si ? { ...s, category_name: v } : s));
  const addSupItem = (si: number) =>
    setSupplements(p => p.map((s, i) => i === si ? { ...s, items: [...s.items, emptyItem()] } : s));
  const removeSupItem = (si: number, ii: number) =>
    setSupplements(p => p.map((s, i) => i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : s));
  const updateSupItem = (si: number, ii: number, field: keyof CategoryItem, value: string | boolean) =>
    setSupplements(p => p.map((s, i) =>
      i === si ? { ...s, items: s.items.map((it, j) => j === ii ? { ...it, [field]: value } : it) } : s
    ));

  const handleSave = () => {
    if (!menuData) return;
    const payload: UpdateMenuPayload = {
      menu_name: menuName,
      currency,
      menus: categories.map(c => ({
        category_name: c.category_name,
        items: c.items.map(it => ({
          item_name: it.item_name,
          description: it.description,
          ingredients: it.ingredients,
          price: parseFloat(it.price) || 0,
          available: it.available,
          calories: parseInt(it.calories) || 0,
          portion_size: it.portion_size,
        })),
      })),
      Supplements: supplements.map(s => ({
        category_name: s.category_name,
        items: s.items.map(it => ({
          item_name: it.item_name,
          description: it.description,
          ingredients: it.ingredients,
          price: parseFloat(it.price) || 0,
          available: it.available,
          calories: parseInt(it.calories) || 0,
          portion_size: it.portion_size,
        })),
      })),
      offer: { title: offerTitle, description: offerDescription, active: offerActive },
    };

    updateMenu.mutate({ id: menuData._id, data: payload }, {
      onSuccess: () => {
        toast.success(t("menuUpdatedSuccess"));
        onOpenChange(false);
      },
      onError: (err) => toast.error((err as Error).message),
    });
  };

  const renderItemFields = (
    item: CategoryItem,
    updateFn: (field: keyof CategoryItem, value: string | boolean) => void,
    removeFn: () => void,
    canRemove: boolean
  ) => (
    <div className="relative space-y-3 mb-3 p-3 bg-muted/30 rounded-lg">
      {canRemove && (
        <Button type="button" variant="ghost" size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={removeFn}>
          <X className="w-4 h-4" />
        </Button>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">{t("itemName")}</Label>
          <Input value={item.item_name} onChange={e => updateFn("item_name", e.target.value)} className="mt-1 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t("description")}</Label>
          <Input value={item.description} onChange={e => updateFn("description", e.target.value)} className="mt-1 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">{t("ingredients")}</Label>
          <Input value={item.ingredients} onChange={e => updateFn("ingredients", e.target.value)} className="mt-1 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t("priceLabel")}</Label>
          <Input type="number" value={item.price} onChange={e => updateFn("price", e.target.value)} className="mt-1 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">{t("calories")}</Label>
          <Input type="number" value={item.calories} onChange={e => updateFn("calories", e.target.value)} className="mt-1 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">{t("portionSize")}</Label>
          <Input value={item.portion_size} onChange={e => updateFn("portion_size", e.target.value)} className="mt-1 text-sm" />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <Label className="text-xs text-muted-foreground">{t("available")}</Label>
          <Switch checked={item.available} onCheckedChange={c => updateFn("available", c)}
            className="data-[state=checked]:bg-[#0A2472]" />
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-border shrink-0">
          <DialogTitle className="text-lg font-bold text-foreground">{t("editMenu")}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t("generalMenuInfo")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">{t("currency")}</Label>
                <Input value={currency} onChange={e => setCurrency(e.target.value)} className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("menuNameLabel")}</Label>
                <Input value={menuName} onChange={e => setMenuName(e.target.value)} className="mt-1 text-sm" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t("menuCategoriesItems")}</h3>
            {categories.map((cat, ci) => (
              <div key={ci} className="mb-4 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">{t("categoryName")}</Label>
                    <Input value={cat.category_name} onChange={e => updateCategoryName(ci, e.target.value)} className="mt-1 text-sm" />
                  </div>
                  {categories.length > 1 && (
                    <Button type="button" variant="ghost" size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 mt-4"
                      onClick={() => removeCategory(ci)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {cat.items.map((item, ii) => (
                  <div key={ii}>
                    {renderItemFields(item, (f, v) => updateItem(ci, ii, f, v), () => removeItem(ci, ii), cat.items.length > 1)}
                  </div>
                ))}
                <Button type="button" size="sm" className="bg-[#0A2472] rounded-full hover:bg-[#0A2472]/90 text-white text-xs" onClick={() => addItem(ci)}>
                  <Plus className="w-3 h-3 mr-1" />{t("addItem")}
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" className="rounded-full border-[#0A2472] text-[#0A2472] hover:bg-[#0A2472]/10 text-xs" onClick={addCategory}>
              <Plus className="w-3 h-3 mr-1" />{t("addCategory")}
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{t("supplements")}</h3>
              <Button type="button" size="sm" variant="outline" className="rounded-full border-[#0A2472] text-[#0A2472] hover:bg-[#0A2472]/10 text-xs" onClick={addSupCategory}>
                <Plus className="w-3 h-3 mr-1" />{t("addSupplementCategory")}
              </Button>
            </div>
            {supplements.length === 0 && <p className="text-xs text-muted-foreground italic">{t("noSupplementsAdded")}</p>}
            {supplements.map((sup, si) => (
              <div key={si} className="mb-4 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">{t("supplementCategoryName")}</Label>
                    <Input value={sup.category_name} onChange={e => updateSupCategoryName(si, e.target.value)} className="mt-1 text-sm" />
                  </div>
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 mt-4" onClick={() => removeSupCategory(si)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                {sup.items.map((item, ii) => (
                  <div key={ii}>
                    {renderItemFields(item, (f, v) => updateSupItem(si, ii, f, v), () => removeSupItem(si, ii), sup.items.length > 1)}
                  </div>
                ))}
                <Button type="button" size="sm" className="bg-[#0A2472] rounded-full hover:bg-[#0A2472]/90 text-white text-xs" onClick={() => addSupItem(si)}>
                  <Plus className="w-3 h-3 mr-1" />{t("addSupplementItem")}
                </Button>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">{t("offersPromotions")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">{t("offerTitle")}</Label>
                <Input value={offerTitle} onChange={e => setOfferTitle(e.target.value)} className="mt-1 text-sm" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">{t("offerDescription")}</Label>
                <Input value={offerDescription} onChange={e => setOfferDescription(e.target.value)} className="mt-1 text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Label className="text-xs text-muted-foreground">{t("active")}</Label>
              <Switch checked={offerActive} onCheckedChange={setOfferActive} className="data-[state=checked]:bg-[#0A2472]" />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 pt-4 border-t border-border shrink-0 bg-background">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 bg-[#0A2472] rounded-full hover:bg-[#0A2472]/90 text-white text-sm"
              onClick={handleSave} disabled={updateMenu.isPending}>
              {updateMenu.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t("save")}
            </Button>
            <Button variant="outline" className="flex-1 border-[#0A2472] rounded-full text-[#0A2472] hover:bg-[#0A2472]/10 text-sm"
              onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
