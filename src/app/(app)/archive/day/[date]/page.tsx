import { getBlocksForDate, getDailyLog, getTodosForDate } from '@/lib/api/queries';
import { DayPageClient } from './page-client';

interface DayPageProps {
  params: Promise<{ date: string }>;
}

export default async function DayPage({ params }: DayPageProps) {
  const { date } = await params;

  const [blocks, log, todos] = await Promise.all([
    getBlocksForDate(date),
    getDailyLog(date),
    getTodosForDate(date),
  ]);

  return <DayPageClient date={date} initialBlocks={blocks} initialLog={log} initialTodos={todos} />;
}
