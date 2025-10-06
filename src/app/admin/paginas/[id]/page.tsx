import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import PageForm from '@/components/admin/page-form';

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = await db.query.pages.findFirst({
    where: eq(pages.id, id),
  });

  if (!page) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Editar Página
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Modifica la configuración de la página
        </p>
      </div>

      <PageForm page={page} />
    </div>
  );
}
