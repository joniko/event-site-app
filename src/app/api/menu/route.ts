import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { asc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch visible pages from DB ordered by position
    const visiblePages = await db.query.pages.findMany({
      where: eq(pages.visible, true),
      orderBy: [asc(pages.order)],
    });

    // Map pages to menu items
    const menuItems = visiblePages.map((page) => ({
      name: page.title,
      href: `/${page.slug}`,
      icon: page.icon,
    }));

    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json([], { status: 500 });
  }
}
