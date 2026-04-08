import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Mail, ArrowLeft, UserPlus, Users } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import {
  PasswordStrengthIndicator,
  isPasswordValid,
} from "@/components/ui/PasswordStrengthIndicator";
import { isValidEmail } from "@/utils/emailValidation";
import { AuroraBackground } from "@/components/ui/aurora-background";
import axios from "axios";
import { apiUrl } from "@/services/api";
import { motion } from "framer-motion";
import logo from "../assets/homepage/Mendigo_Logo.png";

const Signup = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const inviteEmail = searchParams.get("email");
  const isInviteFlow = !!token;
  const navigate = useNavigate();
  const { toast } = useToast();

  const { t, setLanguage } = useLanguage();
  // Auto-detect system language on mount (like PublicReportPage)
  useEffect(() => {
    const browserShort = (navigator.language || "en")
      .split("-")[0]
      .toLowerCase();
    const detected = browserShort === "de" ? "de" : "en";
    setLanguage(detected);
  }, []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: inviteEmail ? decodeURIComponent(inviteEmail) : "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [emailConfirmationMessage, setEmailConfirmationMessage] = useState("");

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const lng = localStorage.getItem("language");

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      toast({
        title: t("signup.signupFailed"),
        description: t("signup.fillAllFields"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast({
        title: t("signup.signupFailed"),
        description: t("signup.invalidEmail"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid(formData.password)) {
      toast({
        title: t("signup.signupFailed"),
        description: t("signup.passwordRequirements"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t("signup.signupFailed"),
        description: t("signup.passwordsDoNotMatch"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: t("signup.signupFailed"),
        description: t("signup.acceptTermsRequired"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      let response;

      if (token) {
        response = await axios.post(`${apiUrl}/invite/accept`, {
          token,
          Name: formData.firstName,
          Last_Name: formData.lastName,
          password: formData.password,
          Phone_Number: "",
          profile_picture: "",
          language: lng,
        });
        toast({
          title: t("signup.signupSuccessful"),
          description: t("signup.inviteAccepted"),
          variant: "success"
        });
      } else {
        response = await axios.post(`${apiUrl}/auth/signup`, {
          Name: formData.firstName,
          Last_Name: formData.lastName,
          Email: formData.email,
          password: formData.password,
          language: lng,
        });
        setEmailConfirmationMessage(response.data.message);
        setShowEmailConfirmation(true);
      }

      if (response.data.accessToken) {
        localStorage.setItem("userInfo", JSON.stringify(response.data));
        window.location.href = "/";
      } else if (!showEmailConfirmation) {
        navigate("/");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || t("signup.accountCreationError");
      toast({
        title: t("signup.signupFailed"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background">
      {/* Aurora animated background */}
      <AuroraBackground className="z-0" />

      {/* Back to home link */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {/* <ArrowLeft className="h-4 w-4" /> */}
        {t("signup.backToHomepage")}
      </Link>

      <div className="relative z-10 w-full max-w-lg px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Logo & heading */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-3 mb-6"
              style={{ maxWidth: "200px" }}
            >
              <img src={logo} alt="Mendigo" className="" />
            </Link>
            <div className="flex items-center justify-center gap-2 mb-3">
              {isInviteFlow ? (
                <Users className="h-6 w-6 text-primary" />
              ) : (
                <UserPlus className="h-6 w-6 text-primary" />
              )}
              <h1 className="text-3xl font-bold text-foreground">
                {isInviteFlow
                  ? t("signup.acceptInvitation")
                  : t("signup.createAccount")}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {isInviteFlow
                ? t("signup.completeInvitation")
                : t("signup.enterDetails")}
            </p>
          </div>

          {/* Signup form card */}
          <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    {t("signup.firstName")}
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder={t("signup.enterFirstName")}
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    {t("signup.lastName")}
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder={t("signup.enterLastName")}
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t("signup.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("signup.enterEmail")}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!!inviteEmail}
                  className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors disabled:opacity-70"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t("signup.password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("signup.enterPassword")}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                <PasswordStrengthIndicator password={formData.password} />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  {t("signup.confirmPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("signup.confirmPasswordPlaceholder")}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 transition-colors pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start space-x-3 pt-1">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) =>
                    setAcceptedTerms(checked === true)
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm leading-relaxed cursor-pointer text-muted-foreground"
                >
                  {t("signup.agreeToThe")}{" "}
                  <Link
                    to="/agb"
                    target="_blank"
                    className="text-primary hover:text-primary/80 underline underline-offset-2"
                  >
                    {t("signup.termsAndConditions")}
                  </Link>{" "}
                  {t("signup.and")}{" "}
                  <Link
                    to="/datenschutz"
                    target="_blank"
                    className="text-primary hover:text-primary/80 underline underline-offset-2"
                  >
                    {t("signup.privacyPolicy")}
                  </Link>
                  {t("signup.zu")}
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                disabled={isLoading}
              >
                {isLoading
                  ? t("signup.creatingAccount")
                  : isInviteFlow
                    ? t("signup.acceptAndCreate")
                    : t("signup.createAccount")}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/30 text-center text-sm">
              <span className="text-muted-foreground">
                {t("signup.alreadyHaveAccount")}{" "}
              </span>
              <Link
                to="/"
                className="text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                {t("signup.signIn")}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Email Confirmation Dialog */}
      <Dialog
        open={showEmailConfirmation}
        onOpenChange={setShowEmailConfirmation}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">
              {t("signup.checkEmail")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {emailConfirmationMessage || t("signup.emailConfirmationSent")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => {
                setShowEmailConfirmation(false);
                navigate("/");
              }}
              className="text-primary-foreground"
            >
              {t("signup.backToLogin")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Signup;
