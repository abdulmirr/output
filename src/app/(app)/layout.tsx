import { Sidebar } from '@/components/layout/sidebar';
import { AppShell } from '@/components/shared/app-shell';
import { OnboardingStoreInitializer } from '@/components/onboarding/onboarding-store-initializer';
import { TzCookie } from '@/components/shared/tz-cookie';
import { getProfile } from '@/lib/api/queries';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <AppShell>
      <TzCookie />
      <OnboardingStoreInitializer hasCompletedFirstBlock={profile?.hasCompletedFirstBlock ?? true} />
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[960px] px-8 py-6 md:px-12">
            {children}
          </div>
        </main>
      </div>
    </AppShell>
  );
}
