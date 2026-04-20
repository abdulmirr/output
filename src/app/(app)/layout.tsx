import { Suspense } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { AppShell } from '@/components/shared/app-shell';
import { ProfileBootstrap } from '@/components/shared/profile-bootstrap';
import { SidebarUser, SidebarUserSkeleton } from '@/components/layout/sidebar-user';

export const unstable_instant = false;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <ProfileBootstrap />
      </Suspense>
      <Sidebar
        userSlot={
          <Suspense fallback={<SidebarUserSkeleton />}>
            <SidebarUser />
          </Suspense>
        }
      />
      <main className="min-h-screen pt-14">
        <div className="mx-auto max-w-[720px] px-6 md:px-8 py-12 md:py-20">
          {children}
        </div>
      </main>
    </AppShell>
  );
}
