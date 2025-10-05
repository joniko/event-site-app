import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            🎪 App de Conferencias
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Tu evento, en tu bolsillo
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link 
              href="/auth/login"
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
