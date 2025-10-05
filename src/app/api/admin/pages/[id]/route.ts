import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isAdminOrEditor } from '@/lib/auth-server';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    const { title, slug, icon, visible, order } = body;

    // Update page
    const [updatedPage] = await db
      .update(pages)
      .set({
        title,
        slug,
        icon,
        visible,
        order,
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id))
      .returning();

    if (!updatedPage) {
      return NextResponse.json(
        { error: 'Página no encontrada' },
        { status: 404 }
      );
    }

    // Revalidate pages
    revalidatePath('/admin/paginas');
    revalidatePath('/'); // Revalidate public navigation

    return NextResponse.json({ ok: true, data: updatedPage });
  } catch (error) {
    console.error('Error updating page:', error);

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
    }

    return NextResponse.json(
      { error: 'Error al actualizar página' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Check permissions
    const hasAccess = await isAdminOrEditor();
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // Delete page
    await db.delete(pages).where(eq(pages.id, id));

    // Revalidate pages
    revalidatePath('/admin/paginas');
    revalidatePath('/'); // Revalidate public navigation

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Error al eliminar página' },
      { status: 500 }
    );
  }
}
