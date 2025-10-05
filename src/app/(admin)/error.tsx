'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminError({
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
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Error en el Admin
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
