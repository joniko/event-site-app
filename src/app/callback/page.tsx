'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/auth';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">
        Verificando tu sesión...
      </p>
    </div>
  </div>
);

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient();
      
      // Get all URL params that Supabase might send
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const code = searchParams.get('code');

      try {
        // Magic Link flow (has token_hash and type)
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as 'email' | 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change',
          });

          if (error) {
            console.error('Error verifying OTP:', error);
            router.push('/login?error=invalid_link');
            return;
          }
        }
        // OAuth/PKCE flow (has code)
        else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('Error exchanging code:', error);
            router.push('/login?error=auth_failed');
            return;
          }
        }
        // No params - check if session exists
        else {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error || !session) {
            console.error('No session found:', error);
            router.push('/login?error=no_session');
            return;
          }
        }

        // Success - redirect to home
        router.push('/');
      } catch (error) {
        console.error('Unexpected error:', error);
        router.push('/login?error=unexpected');
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