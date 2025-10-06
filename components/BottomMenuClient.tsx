'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface MenuItem {
  name: string;
  href: string;
  icon: string; // Icon name (e.g., 'Home', 'Calendar')
}

interface BottomMenuClientProps {
  items: MenuItem[];
}

const getIconComponent = (iconName: string): LucideIcon => {
  const icon = (Icons as Record<string, unknown>)[iconName];
  if (typeof icon === 'function') {
    return icon as LucideIcon;
  }
  return Icons.FileQuestion;
};

export default function BottomMenuClient({ items }: BottomMenuClientProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          // Dynamically get icon from lucide-react
          const IconComponent = getIconComponent(item.icon);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 min-w-[60px] py-2 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <IconComponent className="w-6 h-6" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
