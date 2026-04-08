import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const token = searchParams.get('token');
  const issueId = searchParams.get('issueId');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = async () => {
      if (!token || !issueId || !email) {
        setStatus('error');
        setMessage(t('publicReport.unsubscribeInvalidLink'));
        return;
      }

      try {
        const response = await apiService.get('/issue/unsubscribe', {
          params: { token, issueId, email },
        });

        if (response.status === 200) {
          setStatus('success');
          setMessage(t('unsubscribeSuccessMessage'));
        } else {
          throw new Error('Failed to unsubscribe');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(t('publicReport.unsubscribeFailed'));
      }
    };

    unsubscribe();
  }, [token, issueId, email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="max-w-md w-full bg-card rounded-xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold text-foreground">{t('publicReport.unsubscribeProcessing')}</h2>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('publicReport.unsubscribeSuccessMessage')}</h2>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition"
            >
              {t('publicReport.backToDashboard')}
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('publicReport.unsubscribeError')}</h2>
            <p className="text-muted-foreground mb-8">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-secondary text-secondary-foreground py-3 rounded-lg font-medium hover:bg-secondary/80 transition"
            >
              {t('publicReport.backToDashboard')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
