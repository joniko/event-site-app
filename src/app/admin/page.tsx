import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { FileText, Calendar, Building2, Ticket, Mail, Layout } from 'lucide-react';

// Revalidate every 60 seconds
export const revalidate = 60;

async function getMetrics() {
  try {
    // Use a single query instead of 6 separate queries for better performance
    const result = await db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM pages) as pages,
        (SELECT COUNT(*)::int FROM posts) as posts,
        (SELECT COUNT(*)::int FROM sessions) as sessions,
        (SELECT COUNT(*)::int FROM stands) as stands,
        (SELECT COUNT(*)::int FROM tickets) as tickets,
        (SELECT COUNT(*)::int FROM newsletter_subs) as newsletter
    `);

    const counts = result[0] as Record<string, number>;

    return {
      pages: counts?.pages || 0,
      posts: counts?.posts || 0,
      sessions: counts?.sessions || 0,
      stands: counts?.stands || 0,
      tickets: counts?.tickets || 0,
      newsletter: counts?.newsletter || 0,
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return {
      pages: 0,
      posts: 0,
      sessions: 0,
      stands: 0,
      tickets: 0,
      newsletter: 0,
    };
  }
}

export default async function DashboardPage() {
  const metrics = await getMetrics();

  const cards = [
    {
      label: 'Páginas',
      value: metrics.pages,
      icon: Layout,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      label: 'Posts',
      value: metrics.posts,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      label: 'Sesiones',
      value: metrics.sessions,
      icon: Calendar,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      label: 'Stands',
      value: metrics.stands,
      icon: Building2,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      label: 'Tickets',
      value: metrics.tickets,
      icon: Ticket,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    {
      label: 'Newsletter',
      value: metrics.newsletter,
      icon: Mail,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/20',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Vista general del panel de administración
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
