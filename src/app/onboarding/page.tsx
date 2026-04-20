import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/api/queries';
import { restoreOnboardingCookie } from './actions';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

async function OnboardingContent() {
  const profile = await getProfile();

  if (!profile) {
    redirect('/login');
  }

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

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingContent />
    </Suspense>
  );
}
