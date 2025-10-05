export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
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
  );
}
