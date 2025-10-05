'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, MoreVertical } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
  }>;
  largeTitle?: boolean; // iOS-style large title
}

export default function TopBar({
  title,
  subtitle,
  showBack = false,
  onBack,
  actions = [],
  largeTitle = false
}: TopBarProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  useEffect(() => {
    if (!largeTitle) return;

    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 40);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [largeTitle]);

  if (largeTitle) {
    return (
      <header className="bg-white sticky top-0 z-20 safe-area-inset-top transition-all duration-200">
        {/* Compact nav bar */}
        <div className={`border-b border-gray-200 transition-all duration-200 ${scrolled ? 'opacity-100 h-11' : 'opacity-0 h-0 overflow-hidden'}`}>
          <div className="flex items-center justify-between px-4 h-11">
            <div className="flex items-center min-w-[40px]">
              {showBack && (
                <button
                  onClick={handleBack}
                  className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition active:scale-95"
                  aria-label="Volver"
                >
                  <ChevronLeft className="w-5 h-5 text-blue-600" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center px-2">
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {title}
              </h1>
            </div>

            <div className="flex items-center min-w-[40px] justify-end relative">
              {actions.length > 0 && (
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition active:scale-95"
                  aria-label="Más opciones"
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Large title area */}
        <div className={`px-4 transition-all duration-200 ${scrolled ? 'py-0 h-0 opacity-0 overflow-hidden' : 'py-4 pb-3 opacity-100'}`}>
          <div className="flex items-center justify-between mb-2">
            {showBack && !scrolled && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition active:scale-95"
                aria-label="Volver"
              >
                <ChevronLeft className="w-6 h-6 text-blue-600" />
              </button>
            )}
            <div className={`${showBack ? '' : 'ml-0'} flex-1`}></div>
            {actions.length > 0 && !scrolled && (
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition active:scale-95"
                aria-label="Más opciones"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
          <h1 className="text-[32px] font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Menu dropdown */}
        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute top-12 right-4 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    action.onClick();
                    setShowMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition ${
                    action.variant === 'danger'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </>
        )}
      </header>
    );
  }

  // Standard small topbar (non-large)
  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 safe-area-inset-top">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Back button or spacing */}
          <div className="flex items-center min-w-[40px]">
            {showBack && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition active:scale-95"
                aria-label="Volver"
              >
                <ChevronLeft className="w-6 h-6 text-blue-600" />
              </button>
            )}
          </div>

          {/* Center: Title */}
          <div className="flex-1 text-center px-2">
            <h1 className="text-base font-semibold text-gray-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-gray-500 truncate">{subtitle}</p>
            )}
          </div>

          {/* Right: Actions menu */}
          <div className="flex items-center min-w-[40px] justify-end relative">
            {actions.length > 0 && (
              <>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition active:scale-95"
                  aria-label="Más opciones"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-40">
                      {actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            action.onClick();
                            setShowMenu(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition ${
                            action.variant === 'danger'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
