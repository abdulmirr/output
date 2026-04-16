import { getAllBlocks, getAllDailyLogs } from '@/lib/api/queries';
import { getTzOffsetMinutes } from '@/lib/tz';
import { computeStats } from '@/lib/stats';
import { StatsPageClient } from './page-client';

export default async function StatsPage() {
  const [blocks, logs, tzOffset] = await Promise.all([
    getAllBlocks(),
    getAllDailyLogs(),
    getTzOffsetMinutes(),
  ]);

  const statsData = computeStats(blocks, logs, tzOffset);

  return <StatsPageClient data={statsData} />;
}
