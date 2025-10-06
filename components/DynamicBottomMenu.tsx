import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import BottomMenuClient from './BottomMenuClient';

export default async function DynamicBottomMenu() {
  // Fetch visible pages from DB ordered by position
  const visiblePages = await db.query.pages.findMany({
    where: (pages, { eq }) => eq(pages.visible, true),
    orderBy: [asc(pages.order)],
  });

  // Map pages to menu items with icons
  const menuItems = visiblePages.map((page) => ({
    name: page.title,
    href: `/${page.slug}`,
    icon: page.icon, // Icon name from DB (e.g., 'Home', 'Calendar')
  }));

  return <BottomMenuClient items={menuItems} />;
}
