import dynamic from 'next/dynamic';
import { getProfile } from '@/lib/api/queries';
import { getTzOffsetMinutes } from '@/lib/tz';
import { TzCookie } from '@/components/shared/tz-cookie';
import { OnboardingStoreInitializer } from '@/components/onboarding/onboarding-store-initializer';

const TourProvider = dynamic(() =>
  import('@/components/tour/tour-provider').then((m) => ({ default: m.TourProvider }))
);

export async function ProfileBootstrap() {
  const [profile, serverOffset] = await Promise.all([getProfile(), getTzOffsetMinutes()]);

  return (
    <>
      <TzCookie profileTimezone={profile?.timezone ?? null} serverOffset={serverOffset} />
      <OnboardingStoreInitializer hasCompletedFirstBlock={profile?.hasCompletedFirstBlock ?? true} />
      {profile && <TourProvider initial={profile.tourProgress} />}
    </>
  );
}
