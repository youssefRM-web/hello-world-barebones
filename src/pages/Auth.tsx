import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { login as apiLogin, signup as apiSignup } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const toggleMode = () => setIsSignUp(!isSignUp);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      {/* Language Selector */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setLanguage("en")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            language === "en"
              ? "bg-[#0A2472] text-primary-foreground shadow-md"
              : "bg-card hover:bg-muted border border-border"
          }`}
        >
          <span className="text-lg">🇬🇧</span>
          <span className="text-sm font-medium hidden sm:inline">EN</span>
        </button>
        <button
          onClick={() => setLanguage("de")}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
            language === "de"
              ? "bg-[#0A2472] text-primary-foreground shadow-md"
              : "bg-card hover:bg-muted border border-border"
          }`}
        >
          <span className="text-lg">🇩🇪</span>
          <span className="text-sm font-medium hidden sm:inline">DE</span>
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex relative w-full max-w-4xl h-[650px] bg-card rounded-sm shadow-2xl overflow-hidden">
        {/* Animated Blue Panel */}
        <div
          className={`absolute top-0 h-full w-1/2 bg-[#0A2472] z-20 flex flex-col items-center justify-center text-white p-8 transition-transform duration-700 ease-in-out ${
            isSignUp ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="text-center">
            {isSignUp ? (
              <>
                <h2 className="text-3xl font-bold mb-4">{t("welcomeBack")}</h2>
                <div className="mb-6">
                  <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  </svg>
                </div>
                <p className="text-white/80 mb-8">{t("alreadyHaveAccount")}</p>
                <Button variant="outline" onClick={toggleMode} className="border-white text-white bg-transparent hover:text-[#1a237e] transition-colors px-12 rounded-full">
                  {t("signIn")}
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-4">{t("helloThere")}</h2>
                <div className="mb-6">
                  <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <p className="text-white/80 mb-8 max-w-xs">{t("createRestaurantAccount")}</p>
                <Button variant="outline" onClick={toggleMode} className="border-white text-white bg-transparent hover:text-[#1a237e] transition-colors px-12 rounded-full">
                  {t("signUp")}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Sign In Form */}
        <div className={`w-1/2 flex flex-col items-center justify-center p-8 transition-opacity duration-500 ${isSignUp ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
          <SignInForm />
        </div>

        {/* Sign Up Form */}
        <div className={`w-1/2 flex flex-col items-center justify-center p-8 absolute right-0 top-0 h-full transition-opacity duration-500 overflow-y-auto ${isSignUp ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <SignUpForm />
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="md:hidden w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col">
          {!isSignUp ? (
            <div className="p-6 sm:p-8">
              <SignInForm />
              <div className="mt-6 pt-6 border-t border-border text-center">
                <p className="text-muted-foreground mb-3">{t("dontHaveAccount")}</p>
                <Button variant="outline" onClick={toggleMode} className="border-[#1a237e] text-[#1a237e] rounded-full px-8">
                  {t("signUp")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto">
              <SignUpForm />
              <div className="mt-4 pt-4 border-t border-border text-center">
                <p className="text-muted-foreground mb-3">{t("alreadyHaveAccount")}</p>
                <Button variant="outline" onClick={toggleMode} className="border-[#1a237e] text-[#1a237e] rounded-full px-8">
                  {t("signIn")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
