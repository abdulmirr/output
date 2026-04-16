'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DayStats } from '@/lib/stats';
import { computeWeekDeltas } from '@/lib/stats';
import { formatDuration } from '@/lib/utils';
import { FOCUS_LABELS, FOCUS_BG_COLORS } from '@/lib/constants';
import { WeeklyStats } from './stats-grid';
import { WeekBarChart } from './week-bar-chart';

interface WeekViewProps {
  days: Record<string, DayStats>;
}

function getMonday(ref: Date): Date {
  const d = new Date(ref);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function getWeekDates(monday: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const mStart = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const mEnd = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${mStart} – ${mEnd}`;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const FOCUS_DOT_COLORS: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-400',
  3: 'bg-yellow-400',
  4: 'bg-[#8DC63F]',
  5: 'bg-[#1DB954]',
};

export function WeekView({ days }: WeekViewProps) {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const todayStr = toDateStr(new Date());

  const handlePrev = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const handleNext = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const handleThisWeek = () => {
    setWeekStart(getMonday(new Date()));
  };

  const weekSummary = useMemo(() => {
    let totalSeconds = 0;
    const byFocus: Record<number, number> = {};

    for (const date of weekDates) {
      const dateStr = toDateStr(date);
      const dayData = days[dateStr];
      if (!dayData) continue;
      totalSeconds += dayData.totalSeconds;
      for (const [scoreStr, secs] of Object.entries(dayData.byFocus)) {
        const score = Number(scoreStr);
        byFocus[score] = (byFocus[score] ?? 0) + secs;
      }
    }

    return { totalSeconds, byFocus };
  }, [weekDates, days]);

  const isCurrentWeek = toDateStr(weekStart) === toDateStr(getMonday(new Date()));

  const focusSegments = useMemo(() => {
    if (weekSummary.totalSeconds === 0) return [];
    return [1, 2, 3, 4, 5]
      .filter((score) => weekSummary.byFocus[score] && weekSummary.byFocus[score] > 0)
      .map((score) => ({
        score,
        seconds: weekSummary.byFocus[score],
        pct: (weekSummary.byFocus[score] / weekSummary.totalSeconds) * 100,
      }));
  }, [weekSummary]);

  const weekDateStrings = useMemo(() => weekDates.map(toDateStr), [weekDates]);
  const deltas = useMemo(() => computeWeekDeltas(days, weekStart), [days, weekStart]);

  return (
    <section className="space-y-8">
      {/* Header row */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
            {isCurrentWeek ? 'This week' : 'Week'}
          </h2>
          <p className="text-xs font-mono text-foreground/40">
            {formatWeekLabel(weekStart)}
          </p>
        </div>
        <div className="flex items-center gap-0.5">
          {!isCurrentWeek && (
            <button
              onClick={handleThisWeek}
              className="text-[11px] font-mono uppercase tracking-wider text-foreground/40 hover:text-foreground px-2.5 py-1 rounded-md hover:bg-foreground/[0.04] transition-colors mr-1"
            >
              Today
            </button>
          )}
          <button
            onClick={handlePrev}
            className="p-1 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.25} />
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded-md text-foreground/40 hover:text-foreground hover:bg-foreground/[0.04] transition-colors"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.25} />
          </button>
        </div>
      </div>

      {/* Total + stacked bar + legend */}
      {weekSummary.totalSeconds > 0 ? (
        <div className="space-y-3">
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-light text-foreground leading-none tracking-tight tabular-nums">
              {formatDuration(weekSummary.totalSeconds)}
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-foreground/40">
              total
            </span>
          </div>

          <div className="flex h-2 w-full rounded-full overflow-hidden gap-0.5">
            {focusSegments.map((seg) => (
              <div
                key={seg.score}
                className={`${FOCUS_BG_COLORS[seg.score]} first:rounded-l-full last:rounded-r-full transition-all duration-300`}
                style={{ width: `${Math.max(seg.pct, 1.5)}%` }}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {focusSegments.map((seg) => (
              <div key={seg.score} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${FOCUS_DOT_COLORS[seg.score]}`} />
                <span className="text-[11px] text-foreground/50">
                  {FOCUS_LABELS[seg.score]}{' '}
                  <span className="font-mono tabular-nums text-foreground/80">
                    {formatDuration(seg.seconds)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm font-light text-foreground/40">
          No work tracked this week.
        </p>
      )}

      {/* Per-day horizontal bar chart */}
      {weekSummary.totalSeconds > 0 && (
        <WeekBarChart weekDates={weekDates} days={days} todayStr={todayStr} />
      )}

      {/* 2×2 weekly stats grid with delta chips */}
      <WeeklyStats days={days} weekDates={weekDateStrings} deltas={deltas} />
    </section>
  );
}
