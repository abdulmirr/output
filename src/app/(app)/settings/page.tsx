import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/api/queries';
import { SettingsPageClient } from './page-client';

export const unstable_instant = {
  prefetch: 'static',
  unstable_disableBuildValidation: true,
};

async function SettingsData() {
  const profile = await getProfile();
  if (!profile) redirect('/login');
  return <SettingsPageClient profile={profile} />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsData />
    </Suspense>
  );
}
