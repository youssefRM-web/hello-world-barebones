import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { login as apiLogin } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const SignInForm = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await apiLogin({ email, password });
      login(response.access_token, response.restaurant as any);
      toast({ title: t("welcomeBack"), description: t("loginSuccess") });
      navigate("/dashboard");
    } catch (error: any) {
      toast({ title: t("error"), description: error.message || t("loginFailed"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold text-foreground mb-2 text-center">{t("welcomeBack")}</h2>
      <p className="text-muted-foreground text-center mb-8">{t("signInToAccount")}</p>
      <form className="space-y-5" onSubmit={handleSignIn}>
        <div className="space-y-2">
          <Label htmlFor="signin-email">{t("email")}</Label>
          <Input id="signin-email" type="email" placeholder={t("enterYourEmail")} className="h-12" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signin-password">{t("password")}</Label>
          <Input id="signin-password" type="password" placeholder={t("enterYourPassword")} className="h-12" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div className="flex items-center justify-end">
          <a href="#" className="text-sm text-primary hover:underline">{t("forgotPassword")}</a>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full h-12 bg-[#0A2472] hover:bg-[#0A2472]/90 text-white rounded-full font-medium transition-all duration-300">
          {isLoading ? "..." : t("signIn")}
        </Button>
      </form>
    </div>
  );
};

export default SignInForm;
