import TopBar from '@/components/TopBar';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar title="Dashboard" subtitle="Panel de administración" largeTitle />

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Metric cards */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Posts</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Sesiones</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Stands</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Tickets</p>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
