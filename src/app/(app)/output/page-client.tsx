'use client';

import { DailyHeader } from '@/components/output/daily-header';
import { DailyTodos } from '@/components/output/daily-todos';
import { OutputSection } from '@/components/output/output-section';
import { ThoughtsSection } from '@/components/output/thoughts-section';
import { LogOffFlow } from '@/components/output/log-off-flow';
import { Separator } from '@/components/ui/separator';
import { FirstRunBanner } from '@/components/onboarding/first-run-banner';
import { GettingStartedChecklist } from '@/components/onboarding/getting-started-checklist';
import type { WorkBlock, DailyLog, DailyTodo } from '@/lib/types';
import { useState } from 'react';

interface OutputPageClientProps {
  initialBlocks: WorkBlock[];
  initialDailyLog: DailyLog | null;
  initialTodos: DailyTodo[];
  date: string;
  showFirstRunBanner?: boolean;
  showChecklist?: boolean;
  hasCompletedFirstBlock?: boolean;
  hasTasks?: boolean;
  hasLoggedOffToday?: boolean;
}

export function OutputPageClient({
  initialBlocks,
  initialDailyLog,
  initialTodos,
  date,
  showFirstRunBanner = false,
  showChecklist = false,
  hasCompletedFirstBlock = true,
  hasTasks = false,
  hasLoggedOffToday = false,
}: OutputPageClientProps) {
  const [checklistVisible, setChecklistVisible] = useState(showChecklist);

  return (
    <div className="space-y-8">
      <DailyHeader date={date} />
      {showFirstRunBanner && <FirstRunBanner />}
      <DailyTodos initialTodos={initialTodos} today={date} />
      <Separator className="opacity-50" />
      <OutputSection initialBlocks={initialBlocks} date={date} />
      <Separator className="opacity-50" />
      <ThoughtsSection
        initialThoughts={initialDailyLog?.dailyThoughts ?? ''}
        today={date}
      />
      <LogOffFlow initialLog={initialDailyLog} today={date} />
      {checklistVisible && (
        <GettingStartedChecklist
          hasCompletedFirstBlock={hasCompletedFirstBlock}
          hasTasks={hasTasks}
          hasLoggedOffToday={hasLoggedOffToday}
          onDismiss={() => setChecklistVisible(false)}
        />
      )}
    </div>
  );
}
