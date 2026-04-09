'use client';

import { WorkBlock, DailyLog } from '@/lib/types';
import { formatDuration } from '@/lib/utils';
import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { FOCUS_TEXT_COLORS } from '@/lib/constants';

interface PeriodSummaryProps {
  blocks: WorkBlock[];
  logs: Record<string, DailyLog>;
  period: 'week' | 'month';
  referenceDate?: Date;
}

const SCORE_LABELS: Record<number, string> = {
  1: 'Wasted',
  2: 'Distracted',
  3: 'Ok',
  4: 'Good',
  5: 'Deep',
};

function getWeekRange(ref: Date) {
  const start = new Date(ref);
  start.setDate(ref.getDate() - ref.getDay());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

function getMonthRange(ref: Date) {
  const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(ref.getFullYear(), ref.getMonth() + 1, 1);
  return { start, end };
}

function blockToScoreBucket(b: WorkBlock): number | null {
  if (b.focusScore !== null) return b.focusScore;
  if (b.quality === 'deep') return 5;
  if (b.quality === 'meh') return 3;
  if (b.quality === 'distracted') return 1;
  return null;
}

export function PeriodSummary({ blocks, period, referenceDate }: PeriodSummaryProps) {
  const stats = useMemo(() => {
    const ref = referenceDate || new Date();
    const { start, end } = period === 'week' ? getWeekRange(ref) : getMonthRange(ref);

    const periodBlocks = blocks.filter((b) => {
      const st = new Date(b.startTime);
      return st >= start && st < end;
    });

    const totalSeconds = periodBlocks.reduce((sum, b) => sum + b.duration, 0);

    const byScore: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const b of periodBlocks) {
      const bucket = blockToScoreBucket(b);
      if (bucket !== null) byScore[bucket] += b.duration;
    }

    return { totalSeconds, byScore };
  }, [blocks, period, referenceDate]);

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="flex items-center gap-2.5">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-semibold">{formatDuration(stats.totalSeconds)}</p>
          <p className="text-xs text-muted-foreground">Total work</p>
        </div>
      </div>

      <div className="w-px h-8 bg-border/50" />

      {([1, 2, 3, 4, 5] as const).map((score, i) => (
        <div key={score} className="flex items-center gap-6">
          {i > 0 && <div className="w-px h-8 bg-border/50" />}
          <div>
            <p className={`text-sm font-semibold ${FOCUS_TEXT_COLORS[score]}`}>
              {formatDuration(stats.byScore[score])}
            </p>
            <p className="text-xs text-muted-foreground">{SCORE_LABELS[score]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
