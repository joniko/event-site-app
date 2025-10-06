import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import BottomMenuClient from './BottomMenuClient';

// Default menu items as fallback
const DEFAULT_MENU_ITEMS = [
  { name: 'Inicio', href: '/', icon: 'Home' },
  { name: 'Entradas', href: '/entradas', icon: 'Ticket' },
];

// Cache the menu data with a tag for on-demand revalidation
// Revalidate every 5 minutes as fallback (menu rarely changes during events)
const getMenuItems = unstable_cache(
  async () => {
    try {
      // Fetch visible pages from DB ordered by position
      const visiblePages = await db.query.pages.findMany({
        where: (pages, { eq }) => eq(pages.visible, true),
        orderBy: [asc(pages.order)],
      });

      // If no pages found, return default menu
      if (!visiblePages || visiblePages.length === 0) {
        return DEFAULT_MENU_ITEMS;
      }

      // Map pages to menu items with icons
      return visiblePages.map((page) => ({
        name: page.title,
        href: `/${page.slug}`,
        icon: page.icon,
      }));
    } catch (error) {
      console.warn('Failed to fetch pages for menu, using defaults:', error);
      return DEFAULT_MENU_ITEMS;
    }
  },
  ['bottom-menu'],
  {
    revalidate: 300, // Revalidate every 5 minutes as fallback (menu rarely changes)
    tags: ['bottom-menu'],
  }
);

export default async function DynamicBottomMenu() {
  const menuItems = await getMenuItems();
  return <BottomMenuClient items={menuItems} />;
}
