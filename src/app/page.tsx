'use client';

import Link from "next/link";
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
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with Auth Status */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            🎪 Conferencias
          </div>
          
          {loading ? (
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                👋 <span className="font-medium">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link 
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🎪 App de Conferencias
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Tu evento, en tu bolsillo
          </p>
          
          {user && (
            <div className="mb-6 inline-block px-6 py-3 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-semibold">
                ✅ Sesión activa
              </p>
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            {user ? (
              <>
                <Link 
                  href="/entradas"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition transform hover:scale-105"
                >
                  🎫 Mis Entradas
                </Link>
                <Link 
                  href="/programa"
                  className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-3 rounded-lg border-2 border-gray-200 transition transform hover:scale-105"
                >
                  📅 Ver Programa
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition transform hover:scale-105"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/programa"
                  className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-3 rounded-lg border-2 border-gray-200 transition transform hover:scale-105"
                >
                  Ver Programa
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">📅</div>
            <h3 className="text-lg font-bold mb-2">Programa</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Explora sesiones, plenarias y speakers
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🎫</div>
            <h3 className="text-lg font-bold mb-2">Entradas</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Accede a tus tickets con QR
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🏢</div>
            <h3 className="text-lg font-bold mb-2">Stands</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Conoce instituciones y sponsors
            </p>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Desarrollado con Next.js 15 + Supabase + Drizzle ORM</p>
        </div>
      </div>
    </div>
  );
}
