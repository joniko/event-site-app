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
      
      console.log('Callback received with code:', code ? 'YES' : 'NO');
      
      if (code) {
        const supabase = createBrowserClient();
        
        // Check if code_verifier exists in localStorage
        const storageKeys = Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('code_verifier'));
        console.log('Supabase storage keys:', storageKeys);
        
        // Exchange code for session
        const { error, data } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('Error exchanging code:', error);
          console.error('Error details:', {
            message: error.message,
            status: error.status,
            code: error.code
          });
          router.push('/login?error=auth_failed');
          return;
        }
        
        console.log('Session created successfully:', data?.session ? 'YES' : 'NO');
      }
      
      // Redirect to home
      router.push('/');
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