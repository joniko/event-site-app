'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/auth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const error_description = searchParams.get('error_description');

      // Handle error from Supabase
      if (error) {
        console.error('Auth error:', error, error_description);
        router.push(`/login?error=${error}`);
        return;
      }

      // Handle PKCE flow with code
      if (code) {
        const supabase = createBrowserClient();

        try {
          // Exchange code for session - client has access to code_verifier
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError);
            router.push('/login?error=auth_failed');
            return;
          }

          // Success! Redirect to home
          router.push('/');
        } catch (err) {
          console.error('Unexpected error during auth:', err);
          router.push('/login?error=unexpected');
        }
      } else {
        // No code in URL, redirect to login
        router.push('/login');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">
          Verificando tu sesión...
        </p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Cargando...
          </p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}