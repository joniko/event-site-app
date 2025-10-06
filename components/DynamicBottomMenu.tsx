import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import BottomMenuClient from './BottomMenuClient';

// Default menu items as fallback
const DEFAULT_MENU_ITEMS = [
  { name: 'Inicio', href: '/', icon: 'Home' },
  { name: 'Entradas', href: '/entradas', icon: 'Ticket' },
];

export default async function DynamicBottomMenu() {
  try {
    // Fetch visible pages from DB ordered by position
    const visiblePages = await db.query.pages.findMany({
      where: (pages, { eq }) => eq(pages.visible, true),
      orderBy: [asc(pages.order)],
    });

    // If no pages found or DB not accessible, use default menu
    if (!visiblePages || visiblePages.length === 0) {
      return <BottomMenuClient items={DEFAULT_MENU_ITEMS} />;
    }

    // Map pages to menu items with icons
    const menuItems = visiblePages.map((page) => ({
      name: page.title,
      href: `/${page.slug}`,
      icon: page.icon, // Icon name from DB (e.g., 'Home', 'Calendar')
    }));

    return <BottomMenuClient items={menuItems} />;
  } catch (error) {
    // If DB query fails (e.g., during build), use default menu
    console.warn('Failed to fetch pages for menu, using defaults:', error);
    return <BottomMenuClient items={DEFAULT_MENU_ITEMS} />;
  }
}
