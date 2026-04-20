import { Suspense } from 'react';
import { getBlocksForDate, getDailyLog, getTodosForDate } from '@/lib/api/queries';
import { getTodayString } from '@/lib/utils';
import { getTzOffsetMinutes } from '@/lib/tz';
import { OutputPageClient } from './page-client';

export const unstable_instant = {
  prefetch: 'static',
  unstable_disableBuildValidation: true,
};

async function OutputData({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const tzOffset = await getTzOffsetMinutes();
  const today = getTodayString(tzOffset);
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? today;

  const [blocks, dailyLog, todos] = await Promise.all([
    getBlocksForDate(date, tzOffset),
    getDailyLog(date),
    getTodosForDate(date),
  ]);

  return (
    <OutputPageClient
      key={date}
      initialBlocks={blocks}
      initialDailyLog={dailyLog}
      initialTodos={todos}
      date={date}
    />
  );
}

export default function OutputPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <OutputData searchParams={searchParams} />
    </Suspense>
  );
}
