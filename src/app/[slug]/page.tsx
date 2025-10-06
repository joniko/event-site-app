import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, slug),
  });

  if (!page) {
    return { title: 'Página no encontrada' };
  }

  return {
    title: `${page.title} - Conferencia`,
    description: page.title,
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, slug),
  });

  if (!page || !page.visible) {
    notFound();
  }

  // Render based on page type
  switch (page.type) {
    case 'FEED':
      return <div>Feed (Posts) - TODO: Implementar</div>;
    case 'PROGRAMA':
      return <div>Programa (Sesiones) - TODO: Implementar</div>;
    case 'ENTRADAS':
      return <div>Entradas (Tickets) - TODO: Implementar</div>;
    case 'STANDS':
      return <div>Stands - TODO: Implementar</div>;
    case 'CUSTOM':
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">{page.title}</h1>
          <div>
            {/* Render custom blocks */}
            {page.blocks?.map((block: Record<string, unknown>, i: number) => (
              <div key={i} className="mb-4">
                {block.type === 'paragraph' && <p>{String(block.text)}</p>}
                {block.type === 'image' && (
                  <img src={String(block.url)} alt={String(block.alt)} className="max-w-full" />
                )}
                {/* TODO: Implementar más tipos de bloques */}
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return <div>Tipo de página no soportado</div>;
  }
}
