'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { DayStats } from '@/lib/stats';
import { formatDuration, formatDate } from '@/lib/utils';
import { FOCUS_LABELS } from '@/lib/constants';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';

interface ActivityHeatmapProps {
  days: Record<string, DayStats>;
}

const CELL_SIZE = 13;
const CELL_GAP = 3;
const WEEKS_TO_SHOW = 39; // ~9 months
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getHeatmapColor(day: DayStats | undefined): string {
  if (!day || day.totalSeconds === 0) return 'bg-muted/30';

  const score = day.weightedFocusScore;
  if (score === null) return 'bg-muted/50';

  const hours = day.totalSeconds / 3600;
  const opacity = hours >= 4 ? 'opacity-90' : hours >= 2 ? 'opacity-70' : hours >= 1 ? 'opacity-55' : 'opacity-40';

  if (score < 1.5) return `bg-red-600 ${opacity}`;
  if (score < 2.5) return `bg-orange-500 ${opacity}`;
  if (score < 3.5) return `bg-yellow-500 ${opacity}`;
  if (score < 4.5) return `bg-[#8DC63F] ${opacity}`;
  return `bg-[#1DB954] ${opacity}`;
}

function getLegendColor(index: number): string {
  const colors = ['bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-[#8DC63F]', 'bg-[#1DB954]'];
  return colors[index];
}

export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const router = useRouter();

  const grid = useMemo(() => {
    // Grid ends on today — no future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from the Sunday of the week WEEKS_TO_SHOW weeks ago
    const startDate = new Date(today);
    // Rewind to Sunday of the current week, then go back WEEKS_TO_SHOW-1 more weeks
    startDate.setDate(startDate.getDate() - startDate.getDay() - (WEEKS_TO_SHOW - 1) * 7);

    const weeks: { date: Date; dateStr: string }[][] = [];
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    const cursor = new Date(startDate);
    let weekIndex = 0;
    let currentWeek: { date: Date; dateStr: string }[] = [];

    while (cursor <= today) {
      const month = cursor.getMonth();
      if (month !== lastMonth && cursor.getDay() === 0) {
        monthLabels.push({ label: MONTH_NAMES[month], weekIndex });
        lastMonth = month;
      }

      currentWeek.push({
        date: new Date(cursor),
        dateStr: `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`,
      });

      if (cursor.getDay() === 6) {
        weeks.push(currentWeek);
        currentWeek = [];
        weekIndex++;
      }

      cursor.setDate(cursor.getDate() + 1);
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return { weeks, monthLabels, todayStr };
  }, []);

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-0">
            {/* Month labels */}
            <div className="flex mb-2" style={{ paddingLeft: 32 }}>
              {grid.monthLabels.map((m, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono uppercase tracking-wider text-foreground/30 select-none"
                  style={{
                    position: 'relative',
                    left: m.weekIndex * (CELL_SIZE + CELL_GAP),
                  }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex gap-0">
              {/* Day labels */}
              <div
                className="flex flex-col justify-between shrink-0"
                style={{ width: 28, height: 7 * (CELL_SIZE + CELL_GAP) - CELL_GAP }}
              >
                {DAY_LABELS.map((label, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono text-foreground/30 leading-none select-none"
                    style={{ height: CELL_SIZE, display: 'flex', alignItems: 'center' }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Cells */}
              <div className="flex" style={{ gap: CELL_GAP }}>
                {grid.weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col" style={{ gap: CELL_GAP }}>
                    {/* Pad the first week if it doesn't start on Sunday */}
                    {wi === 0 &&
                      Array.from({ length: 7 - week.length }).map((_, i) => (
                        <div key={`pad-${i}`} style={{ width: CELL_SIZE, height: CELL_SIZE }} />
                      ))}
                    {week.map((cell) => {
                      const dayData = days[cell.dateStr];
                      const color = getHeatmapColor(dayData);
                      const isToday = cell.dateStr === grid.todayStr;

                      return (
                        <Tooltip key={cell.dateStr}>
                          <TooltipTrigger
                            className={`rounded-[3px] cursor-pointer transition-all hover:ring-1 hover:ring-foreground/20 ${color} ${isToday ? 'ring-1 ring-foreground/30' : ''}`}
                            style={{ width: CELL_SIZE, height: CELL_SIZE }}
                            onClick={() => router.push(`/output?date=${cell.dateStr}`)}
                          />
                          <TooltipContent side="top">
                            <HeatmapTooltip date={cell.date} dayData={dayData} />
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-foreground/30 select-none">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`rounded-[2px] ${getLegendColor(i)} opacity-70`}
            style={{ width: 8, height: 8 }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function HeatmapTooltip({ date, dayData }: { date: Date; dayData?: DayStats }) {
  return (
    <div className="text-xs space-y-0.5">
      <p className="font-medium">{formatDate(date)}</p>
      {dayData && dayData.totalSeconds > 0 ? (
        <>
          <p>{formatDuration(dayData.totalSeconds)} worked</p>
          {dayData.weightedFocusScore !== null && (
            <p className="text-background/70">
              Avg focus: {FOCUS_LABELS[Math.round(dayData.weightedFocusScore)]}
            </p>
          )}
          {dayData.dailyRating !== null && (
            <p className="text-background/70">Daily rating: {dayData.dailyRating}/5</p>
          )}
        </>
      ) : (
        <p className="text-background/70">No work</p>
      )}
    </div>
  );
}
