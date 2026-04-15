import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { signup as apiSignup } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const SignUpForm = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [foodType, setFoodType] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const foodTypes = foodType.split(",").map((f) => f.trim()).filter(Boolean);
      const response = await apiSignup({
        name,
        address: {
          line1: addressLine1,
          lat: parseFloat(lat) || 0,
          lng: parseFloat(lng) || 0,
        },
        phone,
        email,
        password,
        foodType: foodTypes,
      });
      login(response.access_token, response.restaurant as any);
      toast({ title: t("signupSuccess") });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: t("error"), description: error.message || t("signupFailed"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-foreground mb-2 text-center">{t("helloThere")}</h2>
      <p className="text-muted-foreground text-center mb-6">{t("createYourAccount")}</p>
      <form className="space-y-3" onSubmit={handleSignUp}>
        <div className="space-y-1.5">
          <Label htmlFor="signup-name">{t("restaurantName")}</Label>
          <Input id="signup-name" type="text" placeholder={t("restaurantName")} className="h-11" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-address">{t("address")}</Label>
          <Input id="signup-address" type="text" placeholder={t("address")} className="h-11" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="signup-lat">{t("latitude")}</Label>
            <Input id="signup-lat" type="number" step="any" placeholder="41.9028" className="h-11" value={lat} onChange={(e) => setLat(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-lng">{t("longitude")}</Label>
            <Input id="signup-lng" type="number" step="any" placeholder="12.4964" className="h-11" value={lng} onChange={(e) => setLng(e.target.value)} required />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-phone">{t("phone")}</Label>
          <Input id="signup-phone" type="tel" placeholder={t("enterPhone")} className="h-11" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-email">{t("contactEmail")}</Label>
          <Input id="signup-email" type="email" placeholder={t("contactEmail")} className="h-11" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-password">{t("password")}</Label>
          <Input id="signup-password" type="password" placeholder={t("password")} className="h-11" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="signup-foodtype">{t("foodType")}</Label>
          <Input id="signup-foodtype" type="text" placeholder={t("foodTypePlaceholder")} className="h-11" value={foodType} onChange={(e) => setFoodType(e.target.value)} required />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full h-12 bg-[#0A2472] hover:bg-[#0A2472]/90 text-white rounded-full font-medium transition-all duration-300 mt-2">
          {isLoading ? "..." : t("signUp")}
        </Button>
      </form>
    </div>
  );
};

export default SignUpForm;
