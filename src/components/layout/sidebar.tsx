'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Zap, CheckSquare, Calendar, ChevronsUpDown, Settings, UserPlus, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { useThemeStore } from '@/stores/theme-store';
import { SettingsModal } from '@/app/(app)/settings/settings-modal';

const navItems = [
  { href: '/output', label: 'output', icon: Zap },
  { href: '/tasks', label: 'tasks', icon: CheckSquare },
  { href: '/archive', label: 'archive', icon: Calendar },
];

const themeOptions = [
  { value: 'light' as const, icon: Sun, label: 'Light' },
  { value: 'dark' as const, icon: Moon, label: 'Dark' },
  { value: 'system' as const, icon: Monitor, label: 'System' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatarUrl: string | null } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const meta = data.user.user_metadata;
        setUser({
          name: meta?.full_name || meta?.name || meta?.display_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email ?? '',
          avatarUrl: meta?.avatar_url || meta?.picture || null,
        });
      }
    });
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border">
        <span className="text-lg font-semibold tracking-tight">output</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-52 flex flex-col py-3 bg-sidebar border-r border-sidebar-border transition-transform md:translate-x-0 md:static',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* User header with dropdown */}
        <div className="px-2 mb-3">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-sidebar-accent/60 transition-colors text-left cursor-pointer"
            >
              <Avatar size="sm">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm font-semibold truncate text-sidebar-foreground">
                {user?.name ?? '...'}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 text-sidebar-foreground/50 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" sideOffset={4} className="p-2 min-w-52">
              {/* Icon button row: theme + settings + invite */}
              <div className="px-1 py-1.5">
                <div className="flex gap-1.5">
                  {themeOptions.map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setTheme(value)}
                      title={label}
                      className={cn(
                        'flex-1 flex items-center justify-center py-2 rounded-md transition-colors border',
                        theme === value
                          ? 'bg-accent text-accent-foreground border-border'
                          : 'border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                  <div className="w-px bg-border self-stretch mx-0.5" />
                  <button
                    onClick={() => { setMobileOpen(false); setSettingsOpen(true); }}
                    title="Settings"
                    className="flex-1 flex items-center justify-center py-2 rounded-md border border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </button>
                  <button
                    title="Invite members"
                    className="flex-1 flex items-center justify-center py-2 rounded-md border border-transparent text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <DropdownMenuSeparator className="my-2" />
              <p className="px-3 py-1.5 text-xs text-muted-foreground truncate">{user?.email}</p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Log out
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 pt-2">
          <p className="px-2 mb-2 text-[11px] font-semibold tracking-widest uppercase text-sidebar-foreground/30 select-none">
            Pages
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[14px] transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                      : 'text-sidebar-foreground/50 hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground font-medium'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-sidebar-foreground/80' : 'text-sidebar-foreground/40')} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="px-2">
          <ThemeToggle />
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Settings modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
