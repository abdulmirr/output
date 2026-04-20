import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/api/queries';
import { restoreOnboardingCookie } from './actions';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

export default async function OnboardingPage() {
  const profile = await getProfile();

  // Not logged in — send to login
  if (!profile) {
    redirect('/login');
  }

  // Already onboarded — restore cookie (handles cleared-cookie edge case) and redirect
  if (profile.onboardingCompleted) {
    await restoreOnboardingCookie();
    redirect('/output');
  }

  return (
    <OnboardingWizard
      displayName={profile.displayName}
      preferredName={profile.preferredName}
    />
  );
}
