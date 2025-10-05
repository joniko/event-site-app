'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient, signOut } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Bienvenido</h1>
          {user && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sesión activa: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </div>

        {user ? (
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Cerrar sesión
          </button>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Iniciar sesión
          </button>
        )}
      </div>

      <p className="text-muted-foreground">
        App de Conferencias - En construcción 🚧
      </p>

      {user && (
        <>
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h2 className="font-semibold text-green-800 dark:text-green-200 mb-2">
              ✅ Autenticación exitosa
            </h2>
            <p className="text-sm text-green-700 dark:text-green-300">
              Has iniciado sesión correctamente con Magic Link.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/entradas')}
              className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:shadow-md transition text-left"
            >
              <div className="text-3xl mb-2">🎫</div>
              <h3 className="font-semibold text-lg mb-1">Mis Entradas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ver mis tickets y códigos QR
              </p>
            </button>

            <button
              onClick={() => router.push('/programa')}
              className="p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:shadow-md transition text-left"
            >
              <div className="text-3xl mb-2">📅</div>
              <h3 className="font-semibold text-lg mb-1">Programa</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Agenda de sesiones y actividades
              </p>
            </button>

            <button
              onClick={() => router.push('/stands')}
              className="p-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:shadow-md transition text-left"
            >
              <div className="text-3xl mb-2">🏢</div>
              <h3 className="font-semibold text-lg mb-1">Stands</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Instituciones y sponsors
              </p>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
