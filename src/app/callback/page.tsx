'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/auth';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">
        Completando inicio de sesión...
      </p>
    </div>
  </div>
);

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');

      if (!code) {
        router.replace('/login');
        return;
      }

      const supabase = createBrowserClient();

      try {
        // Client has access to code_verifier in localStorage
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error('Error exchanging code:', error);
          router.replace('/login?error=auth_failed');
          return;
        }

        // Success - redirect to home
        router.replace('/');
      } catch (err) {
        console.error('Unexpected error:', err);
        router.replace('/login?error=unexpected');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return <LoadingScreen />;
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <CallbackContent />
    </Suspense>
  );
}