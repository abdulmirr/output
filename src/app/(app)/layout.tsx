import { Sidebar } from '@/components/layout/sidebar';
import { AppShell } from '@/components/shared/app-shell';
import { OnboardingStoreInitializer } from '@/components/onboarding/onboarding-store-initializer';
import { TzCookie } from '@/components/shared/tz-cookie';
import { TourProvider } from '@/components/tour/tour-provider';
import { getProfile } from '@/lib/api/queries';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <AppShell>
      <TzCookie profileTimezone={profile?.timezone ?? null} />
      <OnboardingStoreInitializer hasCompletedFirstBlock={profile?.hasCompletedFirstBlock ?? true} />
      {profile && (
        <TourProvider initial={profile.tourProgress} />
      )}
      <Sidebar />
      <main className="min-h-screen pt-14">
        <div className="mx-auto max-w-[720px] px-6 md:px-8 py-12 md:py-20">
          {children}
        </div>
      </main>
    </AppShell>
  );
}
