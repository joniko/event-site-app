'use client';

import { usePathname } from 'next/navigation';

interface LayoutWrapperProps {
  children: React.ReactNode;
  bottomMenu?: React.ReactNode;
}

export default function LayoutWrapper({ children, bottomMenu }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Don't show BottomMenu on login, callback, or admin pages
  const hideBottomMenu = pathname.startsWith('/login') || 
                         pathname.startsWith('/callback') || 
                         pathname.startsWith('/dashboard') ||
                         pathname.startsWith('/paginas') ||
                         pathname.startsWith('/posts') ||
                         pathname.startsWith('/stands') ||
                         pathname.startsWith('/programa');

  return (
    <>
      <main className={hideBottomMenu ? '' : 'pb-16'}>
        {children}
      </main>
      {!hideBottomMenu && bottomMenu}
    </>
  );
}
