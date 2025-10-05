'use client';

import { usePathname } from 'next/navigation';
import BottomMenu from './BottomMenu';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't show BottomMenu on login or callback pages
  const hideBottomMenu = pathname.startsWith('/login') || pathname.startsWith('/callback');

  return (
    <>
      <main className={hideBottomMenu ? '' : 'pb-16'}>
        {children}
      </main>
      {!hideBottomMenu && <BottomMenu />}
    </>
  );
}
