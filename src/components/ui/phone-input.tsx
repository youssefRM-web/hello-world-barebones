import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+49", country: "DE", flag: "🇩🇪", name: "Germany" },
  { code: "+43", country: "AT", flag: "🇦🇹", name: "Austria" },
  { code: "+41", country: "CH", flag: "🇨🇭", name: "Switzerland" },
  { code: "+1", country: "US", flag: "🇺🇸", name: "United States" },
  { code: "+44", country: "GB", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+33", country: "FR", flag: "🇫🇷", name: "France" },
  { code: "+39", country: "IT", flag: "🇮🇹", name: "Italy" },
  { code: "+34", country: "ES", flag: "🇪🇸", name: "Spain" },
  { code: "+31", country: "NL", flag: "🇳🇱", name: "Netherlands" },
  { code: "+32", country: "BE", flag: "🇧🇪", name: "Belgium" },
  { code: "+45", country: "DK", flag: "🇩🇰", name: "Denmark" },
  { code: "+46", country: "SE", flag: "🇸🇪", name: "Sweden" },
  { code: "+47", country: "NO", flag: "🇳🇴", name: "Norway" },
  { code: "+358", country: "FI", flag: "🇫🇮", name: "Finland" },
  { code: "+48", country: "PL", flag: "🇵🇱", name: "Poland" },
  { code: "+420", country: "CZ", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+36", country: "HU", flag: "🇭🇺", name: "Hungary" },
  { code: "+40", country: "RO", flag: "🇷🇴", name: "Romania" },
  { code: "+30", country: "GR", flag: "🇬🇷", name: "Greece" },
  { code: "+351", country: "PT", flag: "🇵🇹", name: "Portugal" },
  { code: "+353", country: "IE", flag: "🇮🇪", name: "Ireland" },
  { code: "+352", country: "LU", flag: "🇱🇺", name: "Luxembourg" },
  { code: "+385", country: "HR", flag: "🇭🇷", name: "Croatia" },
  { code: "+386", country: "SI", flag: "🇸🇮", name: "Slovenia" },
  { code: "+421", country: "SK", flag: "🇸🇰", name: "Slovakia" },
  { code: "+359", country: "BG", flag: "🇧🇬", name: "Bulgaria" },
  { code: "+370", country: "LT", flag: "🇱🇹", name: "Lithuania" },
  { code: "+371", country: "LV", flag: "🇱🇻", name: "Latvia" },
  { code: "+372", country: "EE", flag: "🇪🇪", name: "Estonia" },
  { code: "+356", country: "MT", flag: "🇲🇹", name: "Malta" },
  { code: "+357", country: "CY", flag: "🇨🇾", name: "Cyprus" },
  { code: "+354", country: "IS", flag: "🇮🇸", name: "Iceland" },
  { code: "+7", country: "RU", flag: "🇷🇺", name: "Russia" },
  { code: "+380", country: "UA", flag: "🇺🇦", name: "Ukraine" },
  { code: "+90", country: "TR", flag: "🇹🇷", name: "Turkey" },
  { code: "+81", country: "JP", flag: "🇯🇵", name: "Japan" },
  { code: "+82", country: "KR", flag: "🇰🇷", name: "South Korea" },
  { code: "+86", country: "CN", flag: "🇨🇳", name: "China" },
  { code: "+91", country: "IN", flag: "🇮🇳", name: "India" },
  { code: "+61", country: "AU", flag: "🇦🇺", name: "Australia" },
  { code: "+64", country: "NZ", flag: "🇳🇿", name: "New Zealand" },
  { code: "+55", country: "BR", flag: "🇧🇷", name: "Brazil" },
  { code: "+52", country: "MX", flag: "🇲🇽", name: "Mexico" },
  { code: "+54", country: "AR", flag: "🇦🇷", name: "Argentina" },
  { code: "+56", country: "CL", flag: "🇨🇱", name: "Chile" },
  { code: "+57", country: "CO", flag: "🇨🇴", name: "Colombia" },
  { code: "+20", country: "EG", flag: "🇪🇬", name: "Egypt" },
  { code: "+27", country: "ZA", flag: "🇿🇦", name: "South Africa" },
  { code: "+234", country: "NG", flag: "🇳🇬", name: "Nigeria" },
  { code: "+254", country: "KE", flag: "🇰🇪", name: "Kenya" },
  { code: "+212", country: "MA", flag: "🇲🇦", name: "Morocco" },
  { code: "+216", country: "TN", flag: "🇹🇳", name: "Tunisia" },
  { code: "+213", country: "DZ", flag: "🇩🇿", name: "Algeria" },
  { code: "+966", country: "SA", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", country: "AE", flag: "🇦🇪", name: "UAE" },
  { code: "+972", country: "IL", flag: "🇮🇱", name: "Israel" },
  { code: "+60", country: "MY", flag: "🇲🇾", name: "Malaysia" },
  { code: "+65", country: "SG", flag: "🇸🇬", name: "Singapore" },
  { code: "+66", country: "TH", flag: "🇹🇭", name: "Thailand" },
  { code: "+63", country: "PH", flag: "🇵🇭", name: "Philippines" },
  { code: "+62", country: "ID", flag: "🇮🇩", name: "Indonesia" },
  { code: "+84", country: "VN", flag: "🇻🇳", name: "Vietnam" },
  { code: "+92", country: "PK", flag: "🇵🇰", name: "Pakistan" },
  { code: "+880", country: "BD", flag: "🇧🇩", name: "Bangladesh" },
  { code: "+94", country: "LK", flag: "🇱🇰", name: "Sri Lanka" },
].sort((a, b) => a.name.localeCompare(b.name));

export function parsePhoneValue(fullPhone: string): { countryCode: string; number: string } {
  if (!fullPhone || !fullPhone.startsWith("+")) {
    return { countryCode: "+49", number: fullPhone || "" };
  }
  // Try longest code first
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (fullPhone.startsWith(c.code)) {
      return { countryCode: c.code, number: fullPhone.slice(c.code.length).trim() };
    }
  }
  return { countryCode: "+49", number: fullPhone.replace(/^\+\d+\s*/, "") };
}

// Min digits per country code for basic validation
const MIN_DIGITS: Record<string, number> = {};
const MAX_DIGITS: Record<string, number> = {};
// Default: 6-15 digits (ITU-T E.164)
const DEFAULT_MIN = 6;
const DEFAULT_MAX = 15;

export function isValidPhoneNumber(countryCode: string, number: string): boolean {
  const digits = number.replace(/\D/g, "");
  const min = MIN_DIGITS[countryCode] || DEFAULT_MIN;
  const max = MAX_DIGITS[countryCode] || DEFAULT_MAX;
  return digits.length >= min && digits.length <= max;
}

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  placeholder,
  error,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  const filtered = search
    ? COUNTRY_CODES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.includes(search) ||
          c.country.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRY_CODES;

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

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "flex h-10 w-full rounded-md border bg-background text-sm ring-offset-background",
          error ? "border-destructive" : "border-input",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Country code selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => { setOpen(!open); setSearch(""); }}
            className="flex items-center gap-1 h-full px-2 border-r border-input hover:bg-muted/50 rounded-l-md transition-colors min-w-[90px]"
          >
            <span className="text-base">{selected.flag}</span>
            <span className="text-sm text-foreground">{selected.code}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground ml-auto" />
          </button>

          {open && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-md shadow-lg z-50 max-h-64 flex flex-col">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="overflow-y-auto">
                {filtered.map((c) => (
                  <button
                    key={c.country}
                    type="button"
                    onClick={() => {
                      onCountryCodeChange(c.code);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent transition-colors text-left",
                      c.code === countryCode && "bg-accent/50"
                    )}
                  >
                    <span>{c.flag}</span>
                    <span className="text-foreground flex-1">{c.name}</span>
                    <span className="text-muted-foreground">{c.code}</span>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                    No results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone number input */}
        <input
          type="tel"
          inputMode="tel"
          disabled={disabled}
          value={phoneNumber}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\d\s]/g, "");
            onPhoneNumberChange(val);
          }}
          placeholder={placeholder || "123456789"}
          className="flex-1 h-full px-3 bg-transparent outline-none placeholder:text-placeholder text-sm"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default PhoneInput;
