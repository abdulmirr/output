'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkBlock } from '@/lib/types';
import { DailyLog } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { RATING_BADGE_BG } from '@/lib/constants';
import { formatDuration } from '@/lib/utils';

interface CalendarGridProps {
  blocks: WorkBlock[];
  logs: Record<string, DailyLog>;
  todos: unknown[];
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({ blocks, logs, currentDate, onCurrentDateChange }: CalendarGridProps) {
  const router = useRouter();
  const today = new Date();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
      }
    }

    return days;
  }, [year, month]);

  const blocksByDate = useMemo(() => {
    const map: Record<string, WorkBlock[]> = {};
    blocks.forEach((block) => {
      const d = new Date(block.startTime);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(block);
    });
    return map;
  }, [blocks]);

  const prevMonth = () => onCurrentDateChange(new Date(year, month - 1, 1));
  const nextMonth = () => onCurrentDateChange(new Date(year, month + 1, 1));
  const goToday = () => onCurrentDateChange(new Date());

  const handleDayClick = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    router.push(`/archive/day/${dateStr}`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
          {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysInMonth.map(({ date, isCurrentMonth }, i) => {
          const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          const dayBlocks = blocksByDate[dateStr] || [];
          const log = logs[dateStr];
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          const goodSeconds = dayBlocks
            .filter(b => b.quality === 'deep' || (b.quality === null && b.focusScore !== null && b.focusScore >= 4))
            .reduce((sum, b) => sum + b.duration, 0);
          const badSeconds = dayBlocks
            .filter(b => b.quality === 'distracted' || (b.quality === null && b.focusScore !== null && b.focusScore <= 2))
            .reduce((sum, b) => sum + b.duration, 0);

          const hasData = dayBlocks.length > 0 || log?.dailyFocusScore != null;

          return (
            <button
              key={i}
              onClick={() => handleDayClick(date)}
              className={cn(
                'flex flex-col items-start p-2.5 min-h-[90px] w-full rounded-lg text-left transition-all cursor-pointer',
                hasData && isCurrentMonth
                  ? 'bg-white dark:bg-card border border-border/60 shadow-sm hover:shadow-md'
                  : 'hover:bg-muted/50',
                isToday && hasData && 'border-primary/30',
                !isCurrentMonth && 'opacity-35'
              )}
            >
              {/* Day number + rating */}
              <div className="flex items-center justify-between w-full mb-1.5">
                {isToday ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {date.getDate()}
                  </span>
                ) : (
                  <span className="text-sm font-medium">{date.getDate()}</span>
                )}
                {log?.dailyFocusScore != null && (
                  <span className={cn('text-[10px] font-semibold text-white px-1.5 py-0.5 rounded', RATING_BADGE_BG[log.dailyFocusScore])}>
                    {log.dailyFocusScore}/10
                  </span>
                )}
              </div>

              {/* Hours */}
              {(goodSeconds > 0 || badSeconds > 0) && (
                <div className="mt-1 space-y-1">
                  {goodSeconds > 0 && (
                    <div className="flex items-center gap-1">
                      <Check className="h-2.5 w-2.5 text-green-500 shrink-0" />
                      <span className="text-[10px] font-mono text-muted-foreground">{formatDuration(goodSeconds)}</span>
                    </div>
                  )}
                  {badSeconds > 0 && (
                    <div className="flex items-center gap-1">
                      <X className="h-2.5 w-2.5 text-red-500 shrink-0" />
                      <span className="text-[10px] font-mono text-muted-foreground">{formatDuration(badSeconds)}</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
