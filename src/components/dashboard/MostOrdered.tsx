import seafoodNoodles from "@/assets/seafood-noodles.png";
import pizzaNapolitana from "@/assets/pizza-napolitana.png";
import spaghettiMeatballs from "@/assets/spaghetti-meatballs.png";
import { useLanguage } from "@/contexts/LanguageContext";

interface MenuItem {
  id: number;
  nameKey: string;
  orders: number;
  image: string;
}

const menuItems: MenuItem[] = [
  { id: 1, nameKey: "spicySeafoodNoodles", orders: 200, image: seafoodNoodles },
  { id: 2, nameKey: "pizzaNapolitaine", orders: 200, image: pizzaNapolitana },
  { id: 3, nameKey: "spaghettiWithMeatballs", orders: 200, image: spaghettiMeatballs },
];

export function MostOrdered() {
  const { t } = useLanguage();

  return (
    <div className="bg-card rounded-xl p-4 md:p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-foreground">{t("mostOrdered")}</h3>
        <button className="px-3 md:px-4 py-1 md:py-1.5 bg-[#0A2472] text-card rounded-full text-xs md:text-sm font-medium hover:opacity-90 transition-opacity">
          {t("today")}
        </button>
      </div>
      
      <div className="flex items-center justify-around gap-2 md:gap-4 flex-wrap sm:flex-nowrap">
        {menuItems.map((item) => (
          <div key={item.id} className="flex flex-col items-center text-center p-2">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden mb-2 md:mb-3 border-2 border-border">
              <img
                src={item.image}
                alt={t(item.nameKey)}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs md:text-sm font-semibold text-foreground mb-0.5 md:mb-1 line-clamp-2">{t(item.nameKey)}</p>
            <p className="text-[10px] md:text-xs text-muted-foreground">{item.orders} {t("dishesOrdered")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
