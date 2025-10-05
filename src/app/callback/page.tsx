'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/auth';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createBrowserClient();
      
      // Get URL params - Supabase can send different combinations
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const code = searchParams.get('code');
      
      console.log('Callback params:', { 
        has_token_hash: !!token_hash, 
        has_type: !!type, 
        has_code: !!code,
        type_value: type 
      });

      try {
        // Magic Link with token_hash (non-PKCE flow)
        if (token_hash && type) {
          console.log('Using verifyOtp flow with token_hash');
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            console.error('Error verifying OTP:', error);
            router.push('/login?error=invalid_link');
            return;
          }

          console.log('Magic link verified successfully');
          router.push('/');
          return;
        }
        
        // OAuth/PKCE flow with code
        if (code) {
          console.log('Using exchangeCodeForSession flow');
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Error exchanging code:', error);
            router.push('/login?error=auth_failed');
            return;
          }

          console.log('Code exchanged successfully');
          router.push('/');
          return;
        }

        // No params - just redirect
        console.log('No auth params found, redirecting to home');
        router.push('/');
      } catch (error) {
        console.error('Unexpected error during auth:', error);
        router.push('/login?error=unexpected');
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
            Verificando tu sesión...
          </p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}