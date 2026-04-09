import { getBlocksForDate, getDailyLog, getTodosForDate, getProfile, getHasAnyTask, getHasAnyBlock } from '@/lib/api/queries';
import { getTodayString } from '@/lib/utils';
import { getTzOffsetMinutes } from '@/lib/tz';
import { OutputPageClient } from './page-client';

export default async function OutputPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const tzOffset = await getTzOffsetMinutes();
  const today = getTodayString(tzOffset);
  const { date: dateParam } = await searchParams;
  const date = dateParam ?? today;

  const [blocks, dailyLog, todos, profile, hasTasks, hasAnyBlock] = await Promise.all([
    getBlocksForDate(date, tzOffset),
    getDailyLog(date),
    getTodosForDate(date),
    getProfile(),
    getHasAnyTask(),
    getHasAnyBlock(),
  ]);

  const hasCompletedFirstBlock = (profile?.hasCompletedFirstBlock ?? false) || hasAnyBlock;
  const showFirstRunBanner = profile ? !hasCompletedFirstBlock : false;
  const showChecklist = profile ? !profile.onboardingChecklistDismissed : false;

  return (
    <OutputPageClient
      key={date}
      initialBlocks={blocks}
      initialDailyLog={dailyLog}
      initialTodos={todos}
      date={date}
      showFirstRunBanner={showFirstRunBanner}
      showChecklist={showChecklist}
      hasCompletedFirstBlock={hasCompletedFirstBlock}
      hasTasks={hasTasks}
      hasLoggedOffToday={dailyLog?.loggedOff ?? false}
    />
  );
}
