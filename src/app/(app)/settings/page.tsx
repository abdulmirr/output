'use client';

import { useRouter } from 'next/navigation';
import { SettingsModal } from './settings-modal';

export default function SettingsPage() {
  const router = useRouter();
  return <SettingsModal open={true} onClose={() => router.back()} />;
}
