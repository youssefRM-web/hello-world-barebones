import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Building, Eye, EyeOff, ArrowLeft, X, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios";
import { apiUrl } from "@/services/api";
import { useSearchParams } from "react-router-dom";
import {
  PasswordStrengthIndicator,
  isPasswordValid,
} from "@/components/ui/PasswordStrengthIndicator";
import { Checkbox } from "@/components/ui/checkbox";
import { isValidEmail } from "@/utils/emailValidation";

type AuthModalType =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | null;

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  initialModal?: AuthModalType;
}

export const AuthModals = ({
  isOpen,
  onClose,
  initialModal = "login",
}: AuthModalsProps) => {
  const [currentModal, setCurrentModal] = useState<AuthModalType>(null);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const inviteEmail = searchParams.get("email");
  const isInviteFlow = !!token && !!inviteEmail;

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: inviteEmail ? decodeURIComponent(inviteEmail) : "",
    password: "",
    confirmPassword: "",
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetPasswordData, setResetPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [emailConfirmationMessage, setEmailConfirmationMessage] = useState("");

  // Sync currentModal with initialModal BEFORE render to avoid visual flicker
  useEffect(() => {
    if (isOpen && initialModal) {
      setCurrentModal(initialModal);
    }
  }, [isOpen, initialModal]);

  // Reset form fields when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLoginData({ email: "", password: "" });
      setRegisterData({
        firstName: "",
        lastName: "",
        email: inviteEmail ? decodeURIComponent(inviteEmail) : "",
        password: "",
        confirmPassword: "",
      });
      setForgotPasswordEmail("");
      setResetPasswordData({
        password: "",
        confirmPassword: "",
      });
      setAcceptedTerms(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      // Reset currentModal to null when closed
      setCurrentModal(null);
    }
  }, [isOpen, inviteEmail]);

  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/auth`, loginData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      localStorage.setItem("userInfo", JSON.stringify(response.data));

      // Sync current language to user entity
      const currentLang = localStorage.getItem("language") || "de";
      const userId = response.data?.id;
      if (userId) {
        axios
          .patch(
            `${apiUrl}/user/${userId}/update`,
            { language: currentLang },
            {
              headers: { Authorization: `Bearer ${response.data.accessToken}` },
            },
          )
          .catch(() => {});
      }

      /* toast({
        title: t("login.loginSuccessful"),
        description: t("login.welcomeMessage"),
      }); */

      if (response.data.role[0] === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      if (err.response) {
        toast({
          title: t("login.loginFailed"),
          description:
            t("login.invalid") ,
          variant: "destructive",
        });
      } else if (err.request) {
        toast({
          title: t("login.loginFailed"),
          description: t("login.noServerResponse"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("login.loginFailed"),
          description: err.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const lng = localStorage.getItem("language");
    if (
      !registerData.firstName ||
      !registerData.lastName ||
      !registerData.email ||
      !registerData.password
    ) {
      toast({
        title: t("signup.signupFailed"),
        description: t("signup.fillAllFields"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!isValidEmail(registerData.email)) {
      toast({
        title: t("signup.signupFailed"),
        description: t("signup.invalidEmail"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!isPasswordValid(registerData.password)) {
      toast({
        title: t("signup.signupFailed"),
        description: t("signup.passwordRequirements"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
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
        // Accept invite with token
        response = await axios.post(`${apiUrl}/invite/accept`, {
          token,
          Name: registerData.firstName,
          Last_Name: registerData.lastName,
          password: registerData.password,
          Phone_Number: "",
          profile_picture: "",
          language : lng
        });
        toast({
          title: t("signup.signupSuccessful"),
          description:
            t("signup.inviteAccepted") || "Invitation accepted successfully!",
            variant: "success"
        });
      } else {
        // Normal signup
        response = await axios.post(`${apiUrl}/auth/signup`, {
          Name: registerData.firstName,
          Last_Name: registerData.lastName,
          Email: registerData.email,
          password: registerData.password,
          language : lng
        });

        // Show email confirmation popup instead of toast
        setEmailConfirmationMessage(response.data.message);
        setShowEmailConfirmation(true);
      }

      // Auto-login after successful registration
      if (response.data.accessToken) {
        localStorage.setItem("userInfo", JSON.stringify(response.data));

        // Clear form
        setRegisterData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setAcceptedTerms(false);

        onClose();
        window.location.href = "/dashboard";
      } else {
        // If no token returned, switch to login
        setRegisterData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setAcceptedTerms(false);
        setCurrentModal("login");
      }
    } catch (error: any) {
      const message = error.response?.data?.message;
      toast({
        title: t("signup.signupFailed"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const lng = localStorage.getItem("language");

    if (!forgotPasswordEmail) {
      toast({
        title: t("forgotPassword.error"),
        description: t("forgotPassword.enterEmail"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${apiUrl}/auth/forget-password`, {
        email: forgotPasswordEmail,
        language : lng
      });

      toast({
        title: t("forgotPassword.success"),
        description: t("forgotPassword.emailSent"),
        variant: "success"
      });

      setTimeout(() => {
        setCurrentModal("login");
      }, 2000);
    } catch (error: any) {
      const message =
        error.response?.data?.message || t("forgotPassword.requestFailed");
      toast({
        title: t("forgotPassword.success"),
        description: message,
        variant: "success",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!resetPasswordData.password || !resetPasswordData.confirmPassword) {
      toast({
        title: t("resetPassword.error"),
        description: t("resetPassword.enterBothPasswords"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      toast({
        title: t("resetPassword.error"),
        description: t("resetPassword.passwordsDoNotMatch"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!token) {
      toast({
        title: t("resetPassword.error"),
        description: t("resetPassword.invalidToken"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await axios.post(`${apiUrl}/auth/reset-password`, {
        token,
        newPassword: resetPasswordData.password,
      });

      toast({
        title: t("resetPassword.success"),
        description: t("resetPassword.passwordReset"),
        variant: "success"
      });

      setTimeout(() => {
        setCurrentModal("login");
      }, 2000);
    } catch (error: any) {
      const message =
        error.response?.data?.message || t("resetPassword.resetFailed");
      toast({
        title: t("resetPassword.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginModal = () => (
    <DialogContent className="sm:max-w-md">
      <DialogHeader className="space-y-3">
        {/* <div className="text-center">
          <div className="inline-flex items-center mb-4">
            <Building className="h-10 w-10 text-primary" />
            <span className="ml-2 text-2xl font-bold text-foreground">
              FacilityPro
            </span>
          </div>
        </div> */}
        <DialogTitle className="text-2xl font-bold text-center">
          {t("login.welcomeBack")}
        </DialogTitle>
        <DialogDescription className="text-center">
          {t("login.enterCredentials")}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("login.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("login.enterEmail")}
            value={loginData.email}
            onChange={(e) =>
              setLoginData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("login.password")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("login.enterPassword")}
              value={loginData.password}
              onChange={(e) =>
                setLoginData((prev) => ({ ...prev, password: e.target.value }))
              }
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
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="remember" className="rounded" />
            <Label htmlFor="remember" className="text-sm">
              {t("login.rememberMe")}
            </Label>
          </div>
          <button
            type="button"
            onClick={() => setCurrentModal("forgot-password")}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            {t("login.forgotPassword")}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full text-white"
          disabled={isLoading}
        >
          {isLoading ? t("login.signingIn") : t("login.signIn")}
        </Button>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">{t("login.noAccount")} </span>
          <button
            type="button"
            onClick={() => setCurrentModal("register")}
            className="text-primary hover:text-primary/80 font-medium"
          >
            {t("login.signUp")}
          </button>
        </div>
      </form>
    </DialogContent>
  );

  const renderRegisterModal = () => (
    <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader className="space-y-3">
        {/*  <div className="text-center">
          <div className="inline-flex items-center mb-4">
            <Building className="h-10 w-10 text-primary" />
            <span className="ml-2 text-2xl font-bold text-foreground">
              FacilityPro
            </span>
          </div>
        </div> */}
        <DialogTitle className="text-2xl font-bold text-center">
          {t("signup.createAccount")}
        </DialogTitle>
        <DialogDescription className="text-center">
          {t("signup.enterDetails")}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t("signup.firstName")}</Label>
            <Input
              id="firstName"
              placeholder={t("signup.enterFirstName")}
              value={registerData.firstName}
              onChange={(e) =>
                setRegisterData((prev) => ({
                  ...prev,
                  firstName: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t("signup.lastName")}</Label>
            <Input
              id="lastName"
              placeholder={t("signup.enterLastName")}
              value={registerData.lastName}
              onChange={(e) =>
                setRegisterData((prev) => ({
                  ...prev,
                  lastName: e.target.value,
                }))
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("signup.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("signup.enterEmail")}
            value={registerData.email}
            onChange={(e) =>
              setRegisterData((prev) => ({ ...prev, email: e.target.value }))
            }
            disabled={isInviteFlow}
            className={isInviteFlow ? "bg-muted cursor-not-allowed" : ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("signup.password")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("signup.enterPassword")}
              value={registerData.password}
              onChange={(e) =>
                setRegisterData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
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
          <PasswordStrengthIndicator password={registerData.password} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("signup.confirmPassword")}</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("signup.confirmPasswordPlaceholder")}
              value={registerData.confirmPassword}
              onChange={(e) =>
                setRegisterData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
          />
          <label
            htmlFor="terms"
            className="text-sm  items-center leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t("signup.agreeToThe")}{" "}
            <a
              href="/agb"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t("signup.termsAndConditions")}
            </a>{" "}
            {t("signup.and")}{" "}
              <a
              href="/datenschutz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t("signup.privacyPolicy")}
             </a>
            {t("signup.zu")}
          </label>
        </div>

        <Button
          type="submit"
          className="w-full text-white"
          disabled={isLoading || !acceptedTerms}
        >
          {isLoading ? t("signup.creatingAccount") : t("signup.createAccount")}
        </Button>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">
            {t("signup.alreadyHaveAccount")}{" "}
          </span>
          <button
            type="button"
            onClick={() => setCurrentModal("login")}
            className="text-primary hover:text-primary/80 font-medium"
          >
            {t("signup.signIn")}
          </button>
        </div>
      </form>
    </DialogContent>
  );

  const renderForgotPasswordModal = () => (
    <DialogContent className="sm:max-w-md">
      <DialogHeader className="space-y-3">
        {/* <div className="text-center">
          <div className="inline-flex items-center mb-4">
            <Building className="h-10 w-10 text-primary" />
            <span className="ml-2 text-2xl font-bold text-foreground">
              FacilityPro
            </span>
          </div>
        </div> */}
        <DialogTitle className="text-2xl font-bold text-center">
          {t("forgotPassword.title")}
        </DialogTitle>
        <DialogDescription className="text-center">
          {t("forgotPassword.description")}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("forgotPassword.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("forgotPassword.enterEmail")}
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full text-white"
          disabled={isLoading}
        >
          {isLoading
            ? t("forgotPassword.sending")
            : t("forgotPassword.sendResetLink")}
        </Button>

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => setCurrentModal("login")}
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("forgotPassword.backToLogin")}
          </button>
        </div>
      </form>
    </DialogContent>
  );

  const renderResetPasswordModal = () => (
    <DialogContent className="sm:max-w-md">
      <DialogHeader className="space-y-3">
        {/*  <div className="text-center">
          <div className="inline-flex items-center mb-4">
            <Building className="h-10 w-10 text-primary" />
            <span className="ml-2 text-2xl font-bold text-foreground">
              FacilityPro
            </span>
          </div>
        </div> */}
        <DialogTitle className="text-2xl font-bold text-center">
          {t("resetPassword.title")}
        </DialogTitle>
        <DialogDescription className="text-center">
          {t("resetPassword.description")}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t("resetPassword.newPassword")}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("resetPassword.enterNewPassword")}
              value={resetPasswordData.password}
              onChange={(e) =>
                setResetPasswordData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {t("resetPassword.confirmPassword")}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("resetPassword.confirmNewPassword")}
              value={resetPasswordData.confirmPassword}
              onChange={(e) =>
                setResetPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? t("resetPassword.resetting")
            : t("resetPassword.resetPassword")}
        </Button>

        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            onClick={() => setCurrentModal("login")}
            className="text-primary hover:text-primary/80 font-medium"
          >
            {t("resetPassword.backToLogin")}
          </button>
        </div>
      </form>
    </DialogContent>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        {currentModal === "login" && renderLoginModal()}
        {currentModal === "register" && renderRegisterModal()}
        {currentModal === "forgot-password" && renderForgotPasswordModal()}
        {currentModal === "reset-password" && renderResetPasswordModal()}
      </Dialog>

      {/* Email Confirmation Popup */}
      <Dialog
        open={showEmailConfirmation}
        onOpenChange={setShowEmailConfirmation}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl font-semibold text-center">
              {t("signup.signupSuccessful")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {emailConfirmationMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Button
              onClick={() => {
                setShowEmailConfirmation(false);
                setCurrentModal("login");
              }}
              className="px-6"
            >
              {t("resetPassword.backToLogin") || "OK"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
