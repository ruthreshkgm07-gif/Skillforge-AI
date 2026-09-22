import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    apiClient
      .get(`/auth/verify-email?token=${token}`)
      .then((res: any) => {
        if (res.success) {
          setStatus('success');
          setMessage('Email address verified successfully!');
        } else {
          setStatus('error');
          setMessage(res.message || 'Email verification failed.');
        }
      })
      .catch((err: any) => {
        setStatus('error');
        setMessage(err.message || 'Verification link expired or invalid.');
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl text-center"
      >
        {status === 'verifying' && (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
            <h2 className="text-xl font-bold">Verifying Email...</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Email Verified!</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button variant="gradient" className="w-full mt-4" onClick={() => navigate('/login')}>
              Proceed to Login
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold">Verification Failed</h2>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
