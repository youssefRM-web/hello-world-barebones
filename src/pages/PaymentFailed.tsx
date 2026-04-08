import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PaymentFailed = () => {
  const [countdown, setCountdown] = useState(4);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleTryAgain = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Payment Failed</h1>
            <p className="text-muted-foreground">
              We couldn't process your payment. Please try again or contact support.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Redirecting to dashboard in{" "}
                <span className="font-bold text-foreground">{countdown}</span> seconds
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleTryAgain} 
                variant="outline"
                className="w-full"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={handleGoToDashboard} 
                className="w-full"
                size="lg"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailed;