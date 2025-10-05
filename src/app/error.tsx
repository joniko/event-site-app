'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Algo salió mal
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error.message || 'Ha ocurrido un error inesperado'}
        </p>
        <Button onClick={reset}>
          Intentar nuevamente
        </Button>
      </div>
    </div>
  );
}
