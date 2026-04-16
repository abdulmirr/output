'use client';

import { useRouter } from 'next/navigation';
import type { DayStats } from '@/lib/stats';
import { formatDuration } from '@/lib/utils';
import { FOCUS_BG_COLORS } from '@/lib/constants';

interface WeekBarChartProps {
  weekDates: Date[];
  days: Record<string, DayStats>;
  todayStr: string;
}

const SHORT_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function WeekBarChart({ weekDates, days, todayStr }: WeekBarChartProps) {
  const router = useRouter();

  let maxSeconds = 0;
  for (const date of weekDates) {
    const dayData = days[toDateStr(date)];
    if (dayData && dayData.totalSeconds > maxSeconds) maxSeconds = dayData.totalSeconds;
  }
  maxSeconds = Math.max(maxSeconds, 1);

  return (
    <div className="space-y-0.5">
      {weekDates.map((date, i) => {
        const dateStr = toDateStr(date);
        const dayData = days[dateStr];
        const isToday = dateStr === todayStr;
        const widthPct = dayData ? (dayData.totalSeconds / maxSeconds) * 100 : 0;

        const segments = dayData
          ? [1, 2, 3, 4, 5]
              .filter((score) => dayData.byFocus[score] && dayData.byFocus[score] > 0)
              .map((score) => ({
                score,
                seconds: dayData.byFocus[score],
                pct: dayData.totalSeconds > 0 ? (dayData.byFocus[score] / dayData.totalSeconds) * 100 : 0,
              }))
          : [];

        return (
          <button
            key={dateStr}
            onClick={() => router.push(`/output?date=${dateStr}`)}
            className="w-full grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 py-2 -mx-2 px-2 rounded-md hover:bg-foreground/[0.03] transition-colors text-left"
          >
            <span
              className={`text-xs font-mono uppercase tracking-wider w-8 ${
                isToday ? 'text-foreground' : 'text-foreground/40'
              }`}
            >
              {SHORT_DAY_NAMES[i]}
            </span>
            <span
              className={`text-xs font-mono tabular-nums w-5 ${
                isToday ? 'text-foreground/60' : 'text-foreground/30'
              }`}
            >
              {date.getDate()}
            </span>
            <div className="h-1.5 rounded-full bg-foreground/[0.04] overflow-hidden relative">
              {dayData && dayData.totalSeconds > 0 && (
                <div
                  className="h-full flex gap-px"
                  style={{ width: `${widthPct}%` }}
                >
                  {segments.map((seg) => (
                    <div
                      key={seg.score}
                      className={`${FOCUS_BG_COLORS[seg.score]} first:rounded-l-full last:rounded-r-full`}
                      style={{ width: `${seg.pct}%` }}
                    />
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs font-mono text-foreground/60 tabular-nums min-w-[56px] text-right">
              {dayData && dayData.totalSeconds > 0
                ? formatDuration(dayData.totalSeconds)
                : '—'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
