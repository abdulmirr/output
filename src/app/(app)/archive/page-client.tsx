'use client';

import { useState } from 'react';
import { CalendarGrid } from '@/components/calendar/calendar-grid';
import { ArchiveWeekView } from '@/components/calendar/archive-week-view';
import { PeriodSummary } from '@/components/calendar/period-summary';
import { ViewToggle } from '@/components/calendar/view-toggle';
import { Separator } from '@/components/ui/separator';
import type { WorkBlock, DailyLog, DailyTodo } from '@/lib/types';

interface ArchivePageClientProps {
  initialBlocks: WorkBlock[];
  initialLogs: Record<string, DailyLog>;
  initialTodos: DailyTodo[];
}

export function ArchivePageClient({ initialBlocks, initialLogs, initialTodos }: ArchivePageClientProps) {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [weekRefDate, setWeekRefDate] = useState(new Date());
  const [monthRefDate, setMonthRefDate] = useState(new Date());

  const referenceDate = view === 'week' ? weekRefDate : monthRefDate;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">Archive</h1>
        <ViewToggle view={view} onChange={setView} />
      </div>

      <PeriodSummary blocks={initialBlocks} logs={initialLogs} period={view} referenceDate={referenceDate} />

      <Separator />

      {view === 'week' ? (
        <div className="max-w-3xl">
          <ArchiveWeekView
            blocks={initialBlocks}
            logs={initialLogs}
            todos={initialTodos}
            refDate={weekRefDate}
            onRefDateChange={setWeekRefDate}
          />
        </div>
      ) : (
        <CalendarGrid
          blocks={initialBlocks}
          logs={initialLogs}
          todos={initialTodos}
          currentDate={monthRefDate}
          onCurrentDateChange={setMonthRefDate}
        />
      )}
    </div>
  );
}
