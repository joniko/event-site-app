import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { isAdminOrEditor } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Check permissions
    const hasAccess = await isAdminOrEditor();
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, slug, type, icon, visible, order } = body;

    // Validate required fields
    if (!title || !slug || !type || !icon || order === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Create page
    const [newPage] = await db
      .insert(pages)
      .values({
        title,
        slug,
        type,
        icon,
        visible: visible ?? true,
        order,
        config: {},
      })
      .returning();

    // Revalidate pages
    revalidatePath('/admin/paginas');
    revalidatePath('/'); // Revalidate public navigation

    return NextResponse.json({ ok: true, data: newPage });
  } catch (error) {
    console.error('Error creating page:', error);

    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique')) {
      if (error.message.includes('slug')) {
        return NextResponse.json(
          { error: 'Ya existe una página con ese slug' },
          { status: 400 }
        );
      }
      if (error.message.includes('order')) {
        return NextResponse.json(
          { error: 'Ya existe una página con ese orden' },
          { status: 400 }
        );
      }
      if (error.message.includes('type')) {
        return NextResponse.json(
          { error: 'Ya existe una página visible de ese tipo' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Error al crear página' },
      { status: 500 }
    );
  }
}
