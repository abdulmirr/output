import { Flame, Clock, Target, Sunrise, Calendar } from 'lucide-react';
import type { StatsTiles, WeekDeltas } from '@/lib/stats';

/* ── Lifetime overview (3 all-time stats) ── */

interface LifetimeOverviewProps {
  tiles: StatsTiles;
}

export function LifetimeOverview({ tiles }: LifetimeOverviewProps) {
  const lifetimeHours = Math.round(tiles.lifetimeTotalSeconds / 3600);

  return (
    <div className="grid grid-cols-3 gap-6">
      <LifetimeCell
        icon={<Flame className="h-4 w-4 text-foreground/30" strokeWidth={1.25} />}
        value={tiles.currentStreak.toString()}
        label="Day streak"
        sub={tiles.bestStreak > 0 ? `Best ${tiles.bestStreak}d` : '—'}
      />
      <LifetimeCell
        icon={<Clock className="h-4 w-4 text-foreground/30" strokeWidth={1.25} />}
        value={lifetimeHours > 0 ? lifetimeHours.toString() : '—'}
        label="Total hours"
        sub={
          tiles.lifetimeDaysWithBlocks > 0
            ? `across ${tiles.lifetimeDaysWithBlocks}d`
            : '—'
        }
      />
      <LifetimeCell
        icon={<Target className="h-4 w-4 text-foreground/30" strokeWidth={1.25} />}
        value={tiles.lifetimeTotalSeconds > 0 ? `${Math.round(tiles.deepWorkPct)}%` : '—'}
        label="Deep work"
        sub="focus 4–5"
      />
    </div>
  );
}

function LifetimeCell({
  icon,
  value,
  label,
  sub,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="space-y-2">
      {icon}
      <p className="text-3xl md:text-4xl font-light tracking-tight tabular-nums leading-none">
        {value}
      </p>
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-foreground/40">
          {label}
        </p>
        <p className="text-[11px] text-foreground/30 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ── Weekly stats (2×2 grid with delta chips) ── */

interface WeeklyStatsProps {
  days: Record<
    string,
    { totalSeconds: number; byFocus: Record<number, number>; earliestStart: Date | null; blockCount: number }
  >;
  weekDates: string[]; // 7 YYYY-MM-DD keys
  deltas: WeekDeltas;
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function WeeklyStats({ days, weekDates, deltas }: WeeklyStatsProps) {
  const weekDays = weekDates.map((d) => days[d]).filter(Boolean);
  const daysWithBlocks = weekDays.filter((d) => d.blockCount > 0);

  const totalHours = daysWithBlocks.reduce((s, d) => s + d.totalSeconds / 3600, 0);
  const avgHours = daysWithBlocks.length > 0 ? totalHours / daysWithBlocks.length : 0;

  let deepSecs = 0;
  let allSecs = 0;
  for (const d of weekDays) {
    for (const [scoreStr, secs] of Object.entries(d.byFocus)) {
      allSecs += secs;
      if (Number(scoreStr) >= 4) deepSecs += secs;
    }
  }
  const deepPct = allSecs > 0 ? Math.round((deepSecs / allSecs) * 100) : 0;

  let avgStart = '—';
  const startsMinutes: number[] = [];
  for (const d of daysWithBlocks) {
    if (d.earliestStart) {
      startsMinutes.push(d.earliestStart.getUTCHours() * 60 + d.earliestStart.getUTCMinutes());
    }
  }
  if (startsMinutes.length > 0) {
    const avgMin = Math.round(startsMinutes.reduce((a, b) => a + b, 0) / startsMinutes.length);
    const h = Math.floor(avgMin / 60);
    const m = avgMin % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    avgStart = `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  }

  let bestDay = '—';
  let bestSecs = 0;
  for (let i = 0; i < weekDates.length; i++) {
    const d = days[weekDates[i]];
    if (d && d.totalSeconds > bestSecs) {
      bestSecs = d.totalSeconds;
      bestDay = DAY_NAMES[i];
    }
  }

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
      <WeeklyStatCell
        icon={<Clock className="h-3.5 w-3.5 text-foreground/30" strokeWidth={1.25} />}
        label="Hrs / day"
        value={avgHours > 0 ? avgHours.toFixed(1) : '—'}
        delta={formatNumericDelta(deltas.avgHoursDelta, 1)}
      />
      <WeeklyStatCell
        icon={<Target className="h-3.5 w-3.5 text-foreground/30" strokeWidth={1.25} />}
        label="Deep work"
        value={allSecs > 0 ? `${deepPct}%` : '—'}
        delta={formatNumericDelta(deltas.deepPctDelta, 0, '%')}
      />
      <WeeklyStatCell
        icon={<Sunrise className="h-3.5 w-3.5 text-foreground/30" strokeWidth={1.25} />}
        label="Avg start"
        value={avgStart}
        delta={formatStartDelta(deltas.avgStartDeltaMinutes)}
      />
      <WeeklyStatCell
        icon={<Calendar className="h-3.5 w-3.5 text-foreground/30" strokeWidth={1.25} />}
        label="Best day"
        value={bestSecs > 0 ? bestDay : '—'}
        delta={null}
      />
    </div>
  );
}

function WeeklyStatCell({
  icon,
  label,
  value,
  delta,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string | null;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-xs font-mono uppercase tracking-wider text-foreground/40">
          {label}
        </p>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-light tracking-tight tabular-nums">{value}</p>
        {delta && (
          <span className="text-[11px] font-mono text-foreground/40 tabular-nums">
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

function formatNumericDelta(
  delta: number | null,
  fractionDigits: number,
  suffix = '',
): string | null {
  if (delta === null || Math.abs(delta) < Math.pow(10, -fractionDigits) / 2) return null;
  const arrow = delta > 0 ? '↑' : '↓';
  return `${arrow} ${Math.abs(delta).toFixed(fractionDigits)}${suffix}`;
}

function formatStartDelta(minutes: number | null): string | null {
  if (minutes === null || Math.abs(minutes) < 1) return null;
  // Negative = earlier start = "↑" (improvement in productivity framing).
  // We'll surface earlier start as ↑, later start as ↓, and show the absolute minute delta.
  const arrow = minutes < 0 ? '↑' : '↓';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const label = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return `${arrow} ${label}`;
}
