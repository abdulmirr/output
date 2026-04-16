'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Zap, CheckSquare, BarChart3, Settings, ChevronsLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from './theme-toggle';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/output', label: 'output', icon: Zap },
  { href: '/tasks', label: 'tasks', icon: CheckSquare },
  { href: '/stats', label: 'stats', icon: BarChart3 },
];

const pageTitles: Record<string, string> = {
  '/output': 'Output',
  '/tasks': 'Tasks',
  '/stats': 'Stats',
  '/settings': 'Settings',
};

export function Sidebar() {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        setUser({
          name: meta?.full_name || meta?.name || meta?.display_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email ?? '',
          avatar: meta?.avatar_url || meta?.picture || undefined,
        });
      }
    });
  }, []);

  // Derive page title from route
  const pageTitle = Object.entries(pageTitles).find(
    ([path]) => pathname === path || pathname.startsWith(path + '/')
  )?.[1] ?? 'Output';

  // Close on click outside
  useEffect(() => {
    if (!navOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setNavOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [navOpen]);

  // Close on Escape
  useEffect(() => {
    if (!navOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [navOpen]);

  return (
    <>
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background">
        <div className="h-full grid grid-cols-3 items-center px-6">
          {/* Left: hamburger */}
          <div className="flex items-start">
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              {navOpen ? <X strokeWidth={1.25} className="h-5 w-5" /> : <Menu strokeWidth={1.25} className="h-5 w-5" />}
            </button>
          </div>

          {/* Center: page title */}
          <div className="flex justify-center">
            <span className="text-lg font-light">
              {pageTitle}
            </span>
          </div>

          {/* Right: spacer to balance grid */}
          <div />
        </div>
      </header>

      {/* Slide-in Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-background border-r border-foreground/[0.06] flex flex-col transition-transform duration-300 ease-in-out ${
          navOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User info at top */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 shrink-0 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-light text-foreground/60">
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
            )}
            <span className="text-base font-normal text-foreground truncate">
              {user?.name ?? 'User'}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 -mr-1">
            <ThemeToggle className="p-1" />
            <button
              onClick={() => setNavOpen(false)}
              className="text-foreground/40 hover:text-foreground transition-colors p-1"
            >
              <ChevronsLeft strokeWidth={1.25} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Section label */}
        <div className="px-5 pt-4 pb-2">
          <span className="text-xs font-normal uppercase tracking-wider text-foreground/40">
            Pages
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-colors ${
                  isActive
                    ? 'bg-foreground/[0.07] font-normal text-foreground'
                    : 'font-light text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground'
                }`}
              >
                <Icon strokeWidth={1.25} className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: settings */}
        <div className="mt-auto px-3 pb-5 flex flex-col gap-0.5">
          <Link
            href="/settings"
            onClick={() => setNavOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base transition-colors ${
              pathname === '/settings' || pathname.startsWith('/settings/')
                ? 'bg-foreground/[0.07] font-normal text-foreground'
                : 'font-light text-foreground/60 hover:bg-foreground/[0.04] hover:text-foreground'
            }`}
          >
            <Settings strokeWidth={1.25} className="h-4.5 w-4.5" />
            settings
          </Link>
        </div>
      </div>
    </>
  );
}
