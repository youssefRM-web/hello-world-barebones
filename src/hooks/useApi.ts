import { useState } from 'react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export const useApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const executeRequest = async <T>(
    request: () => Promise<{ data: T }>,
    options: UseApiOptions = {}
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await request();
      
      if (options.successMessage) {
        toast({
          title: t('publicReport.apiSuccess'),
          description: options.successMessage,
          variant: "success",
        });
      }
      
      options.onSuccess?.(response.data);
      return response.data;
    } catch (err: any) {
      const errorMsg = t('publicReport.apiGenericError');
      const statusCode = err.response?.statusCode;
     
      
      const isExpiredSubscriptionError = statusCode === 403 && 
        (errorMsg.includes('subscription has expired') || 
         errorMsg.includes('subscription expired'));
      
      setError(errorMsg);
      
      if (isExpiredSubscriptionError) {
        toast({
          title: t('publicReport.apiSubscriptionExpiredTitle'),
          description: errorMsg,
          variant: "destructive",
          duration: 10000, // Show for 10 seconds
        });
        
        window.dispatchEvent(new CustomEvent('subscription-expired', {
          detail: { message: errorMsg }
        }));
      } else {
        
        toast({
          title: t('publicReport.apiError'),
          description: errorMsg,
          variant: "destructive",
        });
      }
      
      options.onError?.(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { executeRequest, isLoading, error };
};