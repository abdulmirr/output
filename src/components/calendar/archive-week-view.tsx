'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { formatDuration } from '@/lib/utils';
import { FOCUS_TEXT_COLORS, RATING_BADGE_BG } from '@/lib/constants';
import type { WorkBlock, DailyLog, DailyTodo } from '@/lib/types';

interface ArchiveWeekViewProps {
  blocks: WorkBlock[];
  logs: Record<string, DailyLog>;
  todos: DailyTodo[];
  refDate: Date;
  onRefDateChange: (date: Date) => void;
}

function getWeekDates(ref: Date): Date[] {
  const start = new Date(ref);
  start.setDate(ref.getDate() - ref.getDay());
  start.setHours(0, 0, 0, 0);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatMinimalTimeRange(start: Date, end: Date): string {
  const formatTime = (d: Date) => {
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const mStr = m === 0 ? '' : `:${m.toString().padStart(2, '0')}`;
    return { h, mStr, ampm };
  };
  const s = formatTime(start);
  const e = formatTime(end);
  return `${s.h}${s.mStr}-${e.h}${e.mStr} ${e.ampm}`;
}

export function ArchiveWeekView({ blocks, logs, refDate, onRefDateChange }: ArchiveWeekViewProps) {
  const router = useRouter();
  const today = new Date();

  const weekDates = useMemo(() => getWeekDates(refDate), [refDate]);

  const blocksByDate = useMemo(() => {
    const map: Record<string, WorkBlock[]> = {};
    blocks.forEach((block) => {
      const d = new Date(block.startTime);
      const dateStr = toDateStr(d);
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(block);
    });
    return map;
  }, [blocks]);

  const prevWeek = () => {
    const d = new Date(refDate);
    d.setDate(d.getDate() - 7);
    onRefDateChange(d);
  };
  const nextWeek = () => {
    const d = new Date(refDate);
    d.setDate(d.getDate() + 7);
    onRefDateChange(d);
  };
  const goThisWeek = () => onRefDateChange(new Date());

  const weekStartStr = weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const weekEndStr = weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
          {weekStartStr} – {weekEndStr}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goThisWeek}>
            This week
          </Button>
          <Button variant="ghost" size="icon" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day feed */}
      <div className="space-y-3">
        {weekDates.map((date) => {
          const dateStr = toDateStr(date);
          const dayBlocks = blocksByDate[dateStr] || [];
          const log = logs[dateStr];
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          const hasContent = dayBlocks.length > 0 || (log?.dailyThoughts && log.dailyThoughts.trim());
          if (!hasContent) return null;

          const goodSeconds = dayBlocks
            .filter(b => b.quality === 'deep' || (b.quality === null && b.focusScore !== null && b.focusScore >= 4))
            .reduce((sum, b) => sum + b.duration, 0);
          const badSeconds = dayBlocks
            .filter(b => b.quality === 'distracted' || (b.quality === null && b.focusScore !== null && b.focusScore <= 2))
            .reduce((sum, b) => sum + b.duration, 0);

          return (
            <div
              key={dateStr}
              onClick={() => router.push(`/archive/day/${dateStr}`)}
              className={cn(
                'bg-white dark:bg-card border rounded-xl px-5 py-5 cursor-pointer transition-shadow shadow-sm hover:shadow-md',
                isToday ? 'border-primary/30' : 'border-border/60'
              )}
            >
              {/* Day header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={cn(
                    'text-[18px] font-semibold tracking-[-0.02em]',
                    isToday && 'text-primary'
                  )}>
                    {date.toLocaleDateString('en-US', { weekday: 'long' })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground pt-0.5">
                  {goodSeconds > 0 && (
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-500 shrink-0" />
                      {formatDuration(goodSeconds)}
                    </span>
                  )}
                  {badSeconds > 0 && (
                    <span className="flex items-center gap-1">
                      <X className="h-3 w-3 text-red-500 shrink-0" />
                      {formatDuration(badSeconds)}
                    </span>
                  )}
                  {log?.dailyFocusScore != null && (
                    <span className={cn('text-xs font-semibold text-white px-2 py-0.5 rounded-md', RATING_BADGE_BG[log.dailyFocusScore])}>
                      {log.dailyFocusScore}/10
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Output blocks */}
                {dayBlocks.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">Output:</h3>
                    <div>
                      {dayBlocks.map((block, i) => (
                        <div key={block.id}>
                          {i > 0 && <div className="h-px bg-border/50 ml-[120px]" />}
                          <div className="flex items-start gap-3 py-2">
                            <span className="text-xs text-muted-foreground font-mono w-[112px] shrink-0 pt-0.5">
                              {block.endTime
                                ? formatMinimalTimeRange(new Date(block.startTime), new Date(block.endTime))
                                : ''}
                            </span>
                            <div className="w-7 shrink-0 pt-0.5">
                              {block.focusScore !== null && (
                                <span className={`text-xs font-mono ${FOCUS_TEXT_COLORS[block.focusScore]}`}>
                                  {block.focusScore}/5
                                </span>
                              )}
                            </div>
                            <span className="text-sm font-normal truncate flex-1">{block.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Thoughts */}
                {log?.dailyThoughts && log.dailyThoughts.trim() && (
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">Thoughts:</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {log.dailyThoughts}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
