'use client';

import { DailyHeader } from '@/components/output/daily-header';
import { DailyTodos } from '@/components/output/daily-todos';
import { OutputSection } from '@/components/output/output-section';
import { ThoughtsSection } from '@/components/output/thoughts-section';
import { LogOffFlow } from '@/components/output/log-off-flow';
import type { WorkBlock, DailyLog, DailyTodo } from '@/lib/types';

interface OutputPageClientProps {
  initialBlocks: WorkBlock[];
  initialDailyLog: DailyLog | null;
  initialTodos: DailyTodo[];
  date: string;
}

export function OutputPageClient({
  initialBlocks,
  initialDailyLog,
  initialTodos,
  date,
}: OutputPageClientProps) {
  return (
    <div>
      <DailyHeader date={date} />
      <div className="space-y-12 md:space-y-16">
        <DailyTodos initialTodos={initialTodos} today={date} />
        <div className="h-px bg-foreground/[0.06]" />
        <OutputSection initialBlocks={initialBlocks} date={date} />
        <div className="h-px bg-foreground/[0.06]" />
        <ThoughtsSection
          initialThoughts={initialDailyLog?.dailyThoughts ?? ''}
          today={date}
        />
        <LogOffFlow initialLog={initialDailyLog} today={date} />
      </div>
    </div>
  );
}
