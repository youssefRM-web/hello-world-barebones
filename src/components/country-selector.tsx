import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, Check } from "lucide-react";

export interface Country {
  code: string;
  flag: string;
  name: string;
  nameDE: string;
}

export const COUNTRIES: Country[] = [
  { code: "AF", flag: "🇦🇫", name: "Afghanistan", nameDE: "Afghanistan" },
  { code: "AL", flag: "🇦🇱", name: "Albania", nameDE: "Albanien" },
  { code: "DZ", flag: "🇩🇿", name: "Algeria", nameDE: "Algerien" },
  { code: "AD", flag: "🇦🇩", name: "Andorra", nameDE: "Andorra" },
  { code: "AO", flag: "🇦🇴", name: "Angola", nameDE: "Angola" },
  { code: "AR", flag: "🇦🇷", name: "Argentina", nameDE: "Argentinien" },
  { code: "AM", flag: "🇦🇲", name: "Armenia", nameDE: "Armenien" },
  { code: "AU", flag: "🇦🇺", name: "Australia", nameDE: "Australien" },
  { code: "AT", flag: "🇦🇹", name: "Austria", nameDE: "Österreich" },
  { code: "AZ", flag: "🇦🇿", name: "Azerbaijan", nameDE: "Aserbaidschan" },
  { code: "BS", flag: "🇧🇸", name: "Bahamas", nameDE: "Bahamas" },
  { code: "BH", flag: "🇧🇭", name: "Bahrain", nameDE: "Bahrain" },
  { code: "BD", flag: "🇧🇩", name: "Bangladesh", nameDE: "Bangladesch" },
  { code: "BY", flag: "🇧🇾", name: "Belarus", nameDE: "Belarus" },
  { code: "BE", flag: "🇧🇪", name: "Belgium", nameDE: "Belgien" },
  { code: "BZ", flag: "🇧🇿", name: "Belize", nameDE: "Belize" },
  { code: "BA", flag: "🇧🇦", name: "Bosnia and Herzegovina", nameDE: "Bosnien und Herzegowina" },
  { code: "BR", flag: "🇧🇷", name: "Brazil", nameDE: "Brasilien" },
  { code: "BN", flag: "🇧🇳", name: "Brunei", nameDE: "Brunei" },
  { code: "BG", flag: "🇧🇬", name: "Bulgaria", nameDE: "Bulgarien" },
  { code: "KH", flag: "🇰🇭", name: "Cambodia", nameDE: "Kambodscha" },
  { code: "CM", flag: "🇨🇲", name: "Cameroon", nameDE: "Kamerun" },
  { code: "CA", flag: "🇨🇦", name: "Canada", nameDE: "Kanada" },
  { code: "CL", flag: "🇨🇱", name: "Chile", nameDE: "Chile" },
  { code: "CN", flag: "🇨🇳", name: "China", nameDE: "China" },
  { code: "CO", flag: "🇨🇴", name: "Colombia", nameDE: "Kolumbien" },
  { code: "CR", flag: "🇨🇷", name: "Costa Rica", nameDE: "Costa Rica" },
  { code: "HR", flag: "🇭🇷", name: "Croatia", nameDE: "Kroatien" },
  { code: "CU", flag: "🇨🇺", name: "Cuba", nameDE: "Kuba" },
  { code: "CY", flag: "🇨🇾", name: "Cyprus", nameDE: "Zypern" },
  { code: "CZ", flag: "🇨🇿", name: "Czech Republic", nameDE: "Tschechien" },
  { code: "DK", flag: "🇩🇰", name: "Denmark", nameDE: "Dänemark" },
  { code: "DO", flag: "🇩🇴", name: "Dominican Republic", nameDE: "Dominikanische Republik" },
  { code: "EC", flag: "🇪🇨", name: "Ecuador", nameDE: "Ecuador" },
  { code: "EG", flag: "🇪🇬", name: "Egypt", nameDE: "Ägypten" },
  { code: "SV", flag: "🇸🇻", name: "El Salvador", nameDE: "El Salvador" },
  { code: "EE", flag: "🇪🇪", name: "Estonia", nameDE: "Estland" },
  { code: "ET", flag: "🇪🇹", name: "Ethiopia", nameDE: "Äthiopien" },
  { code: "FI", flag: "🇫🇮", name: "Finland", nameDE: "Finnland" },
  { code: "FR", flag: "🇫🇷", name: "France", nameDE: "Frankreich" },
  { code: "GE", flag: "🇬🇪", name: "Georgia", nameDE: "Georgien" },
  { code: "DE", flag: "🇩🇪", name: "Germany", nameDE: "Deutschland" },
  { code: "GH", flag: "🇬🇭", name: "Ghana", nameDE: "Ghana" },
  { code: "GR", flag: "🇬🇷", name: "Greece", nameDE: "Griechenland" },
  { code: "GT", flag: "🇬🇹", name: "Guatemala", nameDE: "Guatemala" },
  { code: "HN", flag: "🇭🇳", name: "Honduras", nameDE: "Honduras" },
  { code: "HK", flag: "🇭🇰", name: "Hong Kong", nameDE: "Hongkong" },
  { code: "HU", flag: "🇭🇺", name: "Hungary", nameDE: "Ungarn" },
  { code: "IS", flag: "🇮🇸", name: "Iceland", nameDE: "Island" },
  { code: "IN", flag: "🇮🇳", name: "India", nameDE: "Indien" },
  { code: "ID", flag: "🇮🇩", name: "Indonesia", nameDE: "Indonesien" },
  { code: "IR", flag: "🇮🇷", name: "Iran", nameDE: "Iran" },
  { code: "IQ", flag: "🇮🇶", name: "Iraq", nameDE: "Irak" },
  { code: "IE", flag: "🇮🇪", name: "Ireland", nameDE: "Irland" },
  { code: "IL", flag: "🇮🇱", name: "Israel", nameDE: "Israel" },
  { code: "IT", flag: "🇮🇹", name: "Italy", nameDE: "Italien" },
  { code: "JM", flag: "🇯🇲", name: "Jamaica", nameDE: "Jamaika" },
  { code: "JP", flag: "🇯🇵", name: "Japan", nameDE: "Japan" },
  { code: "JO", flag: "🇯🇴", name: "Jordan", nameDE: "Jordanien" },
  { code: "KZ", flag: "🇰🇿", name: "Kazakhstan", nameDE: "Kasachstan" },
  { code: "KE", flag: "🇰🇪", name: "Kenya", nameDE: "Kenia" },
  { code: "KW", flag: "🇰🇼", name: "Kuwait", nameDE: "Kuwait" },
  { code: "LV", flag: "🇱🇻", name: "Latvia", nameDE: "Lettland" },
  { code: "LB", flag: "🇱🇧", name: "Lebanon", nameDE: "Libanon" },
  { code: "LY", flag: "🇱🇾", name: "Libya", nameDE: "Libyen" },
  { code: "LI", flag: "🇱🇮", name: "Liechtenstein", nameDE: "Liechtenstein" },
  { code: "LT", flag: "🇱🇹", name: "Lithuania", nameDE: "Litauen" },
  { code: "LU", flag: "🇱🇺", name: "Luxembourg", nameDE: "Luxemburg" },
  { code: "MY", flag: "🇲🇾", name: "Malaysia", nameDE: "Malaysia" },
  { code: "MT", flag: "🇲🇹", name: "Malta", nameDE: "Malta" },
  { code: "MX", flag: "🇲🇽", name: "Mexico", nameDE: "Mexiko" },
  { code: "MD", flag: "🇲🇩", name: "Moldova", nameDE: "Moldau" },
  { code: "MC", flag: "🇲🇨", name: "Monaco", nameDE: "Monaco" },
  { code: "MN", flag: "🇲🇳", name: "Mongolia", nameDE: "Mongolei" },
  { code: "ME", flag: "🇲🇪", name: "Montenegro", nameDE: "Montenegro" },
  { code: "MA", flag: "🇲🇦", name: "Morocco", nameDE: "Marokko" },
  { code: "MZ", flag: "🇲🇿", name: "Mozambique", nameDE: "Mosambik" },
  { code: "MM", flag: "🇲🇲", name: "Myanmar", nameDE: "Myanmar" },
  { code: "NP", flag: "🇳🇵", name: "Nepal", nameDE: "Nepal" },
  { code: "NL", flag: "🇳🇱", name: "Netherlands", nameDE: "Niederlande" },
  { code: "NZ", flag: "🇳🇿", name: "New Zealand", nameDE: "Neuseeland" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria", nameDE: "Nigeria" },
  { code: "MK", flag: "🇲🇰", name: "North Macedonia", nameDE: "Nordmazedonien" },
  { code: "NO", flag: "🇳🇴", name: "Norway", nameDE: "Norwegen" },
  { code: "OM", flag: "🇴🇲", name: "Oman", nameDE: "Oman" },
  { code: "PK", flag: "🇵🇰", name: "Pakistan", nameDE: "Pakistan" },
  { code: "PA", flag: "🇵🇦", name: "Panama", nameDE: "Panama" },
  { code: "PY", flag: "🇵🇾", name: "Paraguay", nameDE: "Paraguay" },
  { code: "PE", flag: "🇵🇪", name: "Peru", nameDE: "Peru" },
  { code: "PH", flag: "🇵🇭", name: "Philippines", nameDE: "Philippinen" },
  { code: "PL", flag: "🇵🇱", name: "Poland", nameDE: "Polen" },
  { code: "PT", flag: "🇵🇹", name: "Portugal", nameDE: "Portugal" },
  { code: "QA", flag: "🇶🇦", name: "Qatar", nameDE: "Katar" },
  { code: "RO", flag: "🇷🇴", name: "Romania", nameDE: "Rumänien" },
  { code: "RU", flag: "🇷🇺", name: "Russia", nameDE: "Russland" },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", nameDE: "Saudi-Arabien" },
  { code: "SN", flag: "🇸🇳", name: "Senegal", nameDE: "Senegal" },
  { code: "RS", flag: "🇷🇸", name: "Serbia", nameDE: "Serbien" },
  { code: "SG", flag: "🇸🇬", name: "Singapore", nameDE: "Singapur" },
  { code: "SK", flag: "🇸🇰", name: "Slovakia", nameDE: "Slowakei" },
  { code: "SI", flag: "🇸🇮", name: "Slovenia", nameDE: "Slowenien" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa", nameDE: "Südafrika" },
  { code: "KR", flag: "🇰🇷", name: "South Korea", nameDE: "Südkorea" },
  { code: "ES", flag: "🇪🇸", name: "Spain", nameDE: "Spanien" },
  { code: "LK", flag: "🇱🇰", name: "Sri Lanka", nameDE: "Sri Lanka" },
  { code: "SE", flag: "🇸🇪", name: "Sweden", nameDE: "Schweden" },
  { code: "CH", flag: "🇨🇭", name: "Switzerland", nameDE: "Schweiz" },
  { code: "TW", flag: "🇹🇼", name: "Taiwan", nameDE: "Taiwan" },
  { code: "TZ", flag: "🇹🇿", name: "Tanzania", nameDE: "Tansania" },
  { code: "TH", flag: "🇹🇭", name: "Thailand", nameDE: "Thailand" },
  { code: "TN", flag: "🇹🇳", name: "Tunisia", nameDE: "Tunesien" },
  { code: "TR", flag: "🇹🇷", name: "Turkey", nameDE: "Türkei" },
  { code: "UA", flag: "🇺🇦", name: "Ukraine", nameDE: "Ukraine" },
  { code: "AE", flag: "🇦🇪", name: "UAE", nameDE: "VAE" },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", nameDE: "Vereinigtes Königreich" },
  { code: "US", flag: "🇺🇸", name: "United States", nameDE: "Vereinigte Staaten" },
  { code: "UY", flag: "🇺🇾", name: "Uruguay", nameDE: "Uruguay" },
  { code: "UZ", flag: "🇺🇿", name: "Uzbekistan", nameDE: "Usbekistan" },
  { code: "VE", flag: "🇻🇪", name: "Venezuela", nameDE: "Venezuela" },
  { code: "VN", flag: "🇻🇳", name: "Vietnam", nameDE: "Vietnam" },
].sort((a, b) => a.name.localeCompare(b.name));

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: "en" | "de";
  disabled?: boolean;
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  placeholder = "Select country",
  language = "en",
  disabled,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRIES.find((c) => c.code === value);

  const sortedCountries = [...COUNTRIES].sort((a, b) => {
    const nameA = language === "de" ? a.nameDE : a.name;
    const nameB = language === "de" ? b.nameDE : b.name;
    return nameA.localeCompare(nameB);
  });

  const filtered = search
    ? sortedCountries.filter((c) => {
        const s = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(s) ||
          c.nameDE.toLowerCase().includes(s) ||
          c.code.toLowerCase().includes(s)
        );
      })
    : sortedCountries;

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = selected
    ? `${selected.flag} ${language === "de" ? selected.nameDE : selected.name}`
    : null;

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
        className={cn(
          "flex items-center justify-between w-full h-11 px-3 rounded-md border border-input bg-background text-sm ring-offset-background transition-colors",
          "hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="truncate">{displayName || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
      </button>

      {open && (
        <div className=" top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-64 flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={language === "de" ? "Suchen..." : "Search..."}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="overflow-y-auto">
            {filtered.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                  c.code === value && "bg-accent/50"
                )}
              >
                <span>{c.flag}</span>
                <span className="text-foreground flex-1">
                  {language === "de" ? c.nameDE : c.name}
                </span>
                {c.code === value && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                {language === "de" ? "Keine Ergebnisse" : "No results"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
