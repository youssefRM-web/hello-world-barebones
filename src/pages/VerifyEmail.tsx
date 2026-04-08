import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(response.data.message || t("verifyEmail.defaultSuccess"));

        setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            t("verifyEmail.defaultError")
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && (
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="w-16 h-16 text-destructive" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === "loading" && t("verifyEmail.verifying")}
            {status === "success" && t("verifyEmail.verified")}
            {status === "error" && t("verifyEmail.verificationFailed")}
          </CardTitle>
          <CardDescription className="mt-2">{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <p className="text-sm text-muted-foreground mb-4">
              {t("verifyEmail.redirecting")}
            </p>
          )}
          {status === "error" && (
            <Button onClick={() => navigate("/login")} className="w-full">
              {t("verifyEmail.goToLogin")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
