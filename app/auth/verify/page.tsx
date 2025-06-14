'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VerifyPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          if (data.verified) {
            setStatus('success');
            setMessage('Email verified successfully! Redirecting to login...');
            setTimeout(() => router.push('/auth/login'), 3000);
          } else {
            setStatus('error');
            setMessage(data.error || 'Failed to verify email');
          }
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your email');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <div className="mt-4">
            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Verifying your email...</p>
              </div>
            )}
            {status === 'success' && (
              <div className="text-green-600">
                <p>{message}</p>
              </div>
            )}
            {status === 'error' && (
              <div className="space-y-4">
                <p className="text-red-600">{message}</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => router.push('/auth/login')}
                    className="w-full"
                  >
                    Go to Login
                  </Button>
                  <Button
                    onClick={() => router.push('/auth/signup')}
                    variant="outline"
                    className="w-full"
                  >
                    Sign Up Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 