'use client';

import { useState } from 'react';
import { pages as pagesSchema } from '@/lib/db/schema';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

type Page = typeof pagesSchema.$inferSelect;

interface PagesTableProps {
  pages: Page[];
}

const moduleTypeBadges: Record<string, { label: string; color: string }> = {
  FEED: { label: 'Feed', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' },
  PROGRAMA: { label: 'Programa', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
  ENTRADAS: { label: 'Entradas', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' },
  STANDS: { label: 'Stands', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' },
  CUSTOM: { label: 'Custom', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
};

export default function PagesTable({ pages: initialPages }: PagesTableProps) {
  const [pages, setPages] = useState(initialPages);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta página?')) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar');
      }

      toast.success('Página eliminada');
      setPages(pages.filter(p => p.id !== id));
      router.refresh();
    } catch {
      toast.error('Error al eliminar página');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {pages.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No hay páginas creadas aún. Crea tu primera página para empezar.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Orden
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Icono
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Slug
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Visible
                </th>
                <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => {
                const typeBadge = moduleTypeBadges[page.type] || moduleTypeBadges.CUSTOM;
                return (
                  <tr
                    key={page.id}
                    className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {page.order}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700">
                        {getIcon(page.icon)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {page.title}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <code className="text-sm text-gray-600 dark:text-gray-400">
                        /{page.slug}
                      </code>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          typeBadge.color
                        )}
                      >
                        {typeBadge.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {page.visible ? (
                        <Eye className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/paginas/${page.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          onClick={() => handleDelete(page.id)}
                          disabled={deletingId === page.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
