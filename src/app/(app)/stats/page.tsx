import { Suspense } from 'react';
import { getBlocksSince, getDailyLogsSince } from '@/lib/api/queries';
import { getTzOffsetMinutes } from '@/lib/tz';
import { computeStats } from '@/lib/stats';
import { StatsPageClient } from './page-client';

export const unstable_instant = {
  prefetch: 'static',
  unstable_disableBuildValidation: true,
};

const WINDOW_DAYS = 90;

async function StatsData() {
  const now = new Date();
  const sinceMs = now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const sinceUtcISO = new Date(sinceMs).toISOString();
  const sinceDate = new Date(sinceMs).toISOString().slice(0, 10);

  const [blocks, logs, tzOffset] = await Promise.all([
    getBlocksSince(sinceUtcISO),
    getDailyLogsSince(sinceDate),
    getTzOffsetMinutes(),
  ]);

  const statsData = computeStats(blocks, logs, tzOffset);
  return <StatsPageClient data={statsData} windowDays={WINDOW_DAYS} />;
}

export default function StatsPage() {
  return (
    <Suspense fallback={null}>
      <StatsData />
    </Suspense>
  );
}
