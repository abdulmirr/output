import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/api/queries';
import { SettingsPageClient } from './page-client';

export default async function SettingsPage() {
  const profile = await getProfile();
  if (!profile) redirect('/login');
  return <SettingsPageClient profile={profile} />;
}
