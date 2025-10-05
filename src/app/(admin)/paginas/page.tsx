import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PagesTable from '@/components/admin/pages-table';

export default async function PaginasPage() {
  const allPages = await db.select().from(pages).orderBy(pages.order);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Páginas
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona las páginas y módulos de tu app
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/paginas/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Página
          </Link>
        </Button>
      </div>

      <PagesTable pages={allPages} />
    </div>
  );
}
