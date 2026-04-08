
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHUNK_RECOVERY_FLAG = "__lovable_chunk_recovery_attempted";

function isChunkLoadError(err: unknown): boolean {
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "";

  return (
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Loading chunk") ||
    message.includes("ChunkLoadError")
  );
}

function forceHardReloadOnce() {
  try {
    if (sessionStorage.getItem(CHUNK_RECOVERY_FLAG) === "1") return;
    sessionStorage.setItem(CHUNK_RECOVERY_FLAG, "1");

    const url = new URL(window.location.href);
    url.searchParams.set("r", Date.now().toString());
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
}

// Helper to get translations without hook (class component)
function getErrorBoundaryTranslations() {
  try {
    const lang = localStorage.getItem("language") || "de";
    if (lang === "en") {
      return {
        title: "Something went wrong",
        description: "We're sorry, but something unexpected happened. Please try refreshing the page.",
        tryAgain: "Try Again",
        reloadPage: "Reload Page",
      };
    }
    return {
      title: "Etwas ist schiefgelaufen",
      description: "Es tut uns leid, aber etwas Unerwartetes ist passiert. Bitte versuchen Sie, die Seite zu aktualisieren.",
      tryAgain: "Erneut versuchen",
      reloadPage: "Seite neu laden",
    };
  } catch {
    return {
      title: "Something went wrong",
      description: "We're sorry, but something unexpected happened. Please try refreshing the page.",
      tryAgain: "Try Again",
      reloadPage: "Reload Page",
    };
  }
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (isChunkLoadError(error)) {
      forceHardReloadOnce();
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const translations = getErrorBoundaryTranslations();

      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-2" />
              <CardTitle>{translations.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {translations.description}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={this.handleReset}>
                  {translations.tryAgain}
                </Button>
                <Button onClick={this.handleReload}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {translations.reloadPage}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
