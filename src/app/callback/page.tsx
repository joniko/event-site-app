'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();

  useEffect(() => {
    // This is a legacy callback URL
    // Redirect to the new auth callback route that handles everything server-side
    const hash = window.location.hash;
    const search = window.location.search;
    
    // Preserve all URL parameters and hash
    const newUrl = `/auth/callback${search}${hash}`;
    router.replace(newUrl);
  }, [router]);

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