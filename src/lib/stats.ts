import type { WorkBlock, DailyLog } from '@/lib/types';

export interface DayStats {
  totalSeconds: number;
  byFocus: Record<number, number>; // focusScore → seconds
  dailyRating: number | null; // 1-5
  earliestStart: Date | null;
  blockCount: number;
  weightedFocusScore: number | null; // duration-weighted avg focusScore 1-5
}

export interface StatsTiles {
  avgHoursPerDay: number;
  deepWorkPct: number; // 0-100
  bestDayOfWeek: string | null; // e.g. "Wednesday"
  avgStartTime: string | null; // e.g. "9:03 AM"
  longestSessionSeconds: number;
  currentStreak: number;
  bestStreak: number;
  lifetimeTotalSeconds: number;
  lifetimeDaysWithBlocks: number;
  weightedAvgFocusScore: number | null; // 1-5, duration-weighted across all blocks
}

export interface StatsData {
  days: Record<string, DayStats>; // YYYY-MM-DD → stats
  tiles: StatsTiles;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Assign a block to a YYYY-MM-DD date key based on its start time,
 * adjusted by the user's timezone offset.
 */
function blockToDateKey(block: WorkBlock, tzOffsetMinutes: number): string {
  const localMs = block.startTime.getTime() - tzOffsetMinutes * 60_000;
  const local = new Date(localMs);
  return local.toISOString().split('T')[0];
}

export function computeStats(
  blocks: WorkBlock[],
  logs: Record<string, DailyLog>,
  tzOffsetMinutes: number,
): StatsData {
  const days: Record<string, DayStats> = {};

  // Build per-day stats from blocks
  for (const block of blocks) {
    if (block.status !== 'completed' || block.duration <= 0) continue;
    const dateKey = blockToDateKey(block, tzOffsetMinutes);

    if (!days[dateKey]) {
      days[dateKey] = {
        totalSeconds: 0,
        byFocus: {},
        dailyRating: null,
        earliestStart: null,
        blockCount: 0,
        weightedFocusScore: null,
      };
    }

    const day = days[dateKey];
    day.totalSeconds += block.duration;
    day.blockCount += 1;

    const score = block.focusScore ?? 3; // default to 3 (meh) if unscored
    day.byFocus[score] = (day.byFocus[score] ?? 0) + block.duration;

    // Compute local start time for earliest-start tracking
    const localStart = new Date(block.startTime.getTime() - tzOffsetMinutes * 60_000);
    if (!day.earliestStart || localStart < day.earliestStart) {
      day.earliestStart = localStart;
    }
  }

  // Merge daily logs (ratings)
  for (const [dateKey, log] of Object.entries(logs)) {
    if (!days[dateKey]) {
      // Day has a log but no blocks — don't create a stats entry with 0 hours
      continue;
    }
    days[dateKey].dailyRating = log.dailyFocusScore;
  }

  // Compute weighted focus score per day
  for (const day of Object.values(days)) {
    let weightedSum = 0;
    let totalWeightedDuration = 0;
    for (const [scoreStr, seconds] of Object.entries(day.byFocus)) {
      const score = Number(scoreStr);
      weightedSum += score * seconds;
      totalWeightedDuration += seconds;
    }
    day.weightedFocusScore =
      totalWeightedDuration > 0 ? weightedSum / totalWeightedDuration : null;
  }

  // ── Tile computations ──
  const dayEntries = Object.entries(days);
  const daysWithBlocks = dayEntries.filter(([, d]) => d.blockCount > 0);

  // Avg hours/day (only days that have blocks)
  const totalHours = daysWithBlocks.reduce((s, [, d]) => s + d.totalSeconds / 3600, 0);
  const avgHoursPerDay = daysWithBlocks.length > 0 ? totalHours / daysWithBlocks.length : 0;

  // Deep work % (focusScore >= 4) + weighted-avg focus across everything
  let deepSeconds = 0;
  let allSeconds = 0;
  let weightedFocusSum = 0;
  for (const day of Object.values(days)) {
    for (const [scoreStr, seconds] of Object.entries(day.byFocus)) {
      const score = Number(scoreStr);
      allSeconds += seconds;
      weightedFocusSum += score * seconds;
      if (score >= 4) deepSeconds += seconds;
    }
  }
  const deepWorkPct = allSeconds > 0 ? (deepSeconds / allSeconds) * 100 : 0;
  const weightedAvgFocusScore = allSeconds > 0 ? weightedFocusSum / allSeconds : null;

  // Best day of week
  const dayOfWeekTotals: number[] = [0, 0, 0, 0, 0, 0, 0];
  const dayOfWeekCounts: number[] = [0, 0, 0, 0, 0, 0, 0];
  for (const [dateStr, day] of daysWithBlocks) {
    const dow = new Date(dateStr + 'T12:00:00').getDay();
    dayOfWeekTotals[dow] += day.totalSeconds;
    dayOfWeekCounts[dow] += 1;
  }
  let bestDayOfWeek: string | null = null;
  let bestAvg = 0;
  for (let i = 0; i < 7; i++) {
    if (dayOfWeekCounts[i] > 0) {
      const avg = dayOfWeekTotals[i] / dayOfWeekCounts[i];
      if (avg > bestAvg) {
        bestAvg = avg;
        bestDayOfWeek = DAY_NAMES[i];
      }
    }
  }

  // Avg start time
  let avgStartTime: string | null = null;
  if (daysWithBlocks.length > 0) {
    let totalMinutesSinceMidnight = 0;
    let countWithStart = 0;
    for (const [, day] of daysWithBlocks) {
      if (day.earliestStart) {
        totalMinutesSinceMidnight +=
          day.earliestStart.getUTCHours() * 60 + day.earliestStart.getUTCMinutes();
        countWithStart += 1;
      }
    }
    if (countWithStart > 0) {
      const avgMinutes = Math.round(totalMinutesSinceMidnight / countWithStart);
      const h = Math.floor(avgMinutes / 60);
      const m = avgMinutes % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      avgStartTime = `${h12}:${m.toString().padStart(2, '0')} ${period}`;
    }
  }

  // Longest session
  let longestSessionSeconds = 0;
  for (const block of blocks) {
    if (block.status === 'completed' && block.duration > longestSessionSeconds) {
      longestSessionSeconds = block.duration;
    }
  }

  // Streaks (consecutive days with ≥1 block)
  const sortedDates = Object.keys(days)
    .filter((d) => days[d].blockCount > 0)
    .sort();

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(sortedDates[i - 1] + 'T12:00:00');
      const curr = new Date(sortedDates[i] + 'T12:00:00');
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));
      tempStreak = diffDays === 1 ? tempStreak + 1 : 1;
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak;
  }

  // Current streak: count back from today
  if (sortedDates.length > 0) {
    const now = new Date();
    const localNow = new Date(now.getTime() - tzOffsetMinutes * 60_000);
    const todayStr = localNow.toISOString().split('T')[0];
    const yesterdayDate = new Date(localNow);
    yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    // Start from today or yesterday
    const lastDate = sortedDates[sortedDates.length - 1];
    if (lastDate === todayStr || lastDate === yesterdayStr) {
      currentStreak = 1;
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const curr = new Date(sortedDates[i + 1] + 'T12:00:00');
        const prev = new Date(sortedDates[i] + 'T12:00:00');
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000));
        if (diffDays === 1) {
          currentStreak += 1;
        } else {
          break;
        }
      }
    }
  }

  return {
    days,
    tiles: {
      avgHoursPerDay,
      deepWorkPct,
      bestDayOfWeek,
      avgStartTime,
      longestSessionSeconds,
      currentStreak,
      bestStreak,
      lifetimeTotalSeconds: allSeconds,
      lifetimeDaysWithBlocks: daysWithBlocks.length,
      weightedAvgFocusScore,
    },
  };
}

export interface WeekDeltas {
  avgHoursDelta: number | null;
  deepPctDelta: number | null;
  avgStartDeltaMinutes: number | null; // negative = earlier start
  hasPrevWeekData: boolean;
}

interface WeekAggregate {
  avgHours: number;
  deepPct: number;
  avgStartMinutes: number | null;
  hasData: boolean;
}

function aggregateWeek(days: Record<string, DayStats>, weekStart: Date): WeekAggregate {
  const dateStrs: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    dateStrs.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    );
  }

  const weekDays = dateStrs.map((s) => days[s]).filter(Boolean);
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
  const deepPct = allSecs > 0 ? (deepSecs / allSecs) * 100 : 0;

  const startMinutes: number[] = [];
  for (const d of daysWithBlocks) {
    if (d.earliestStart) {
      startMinutes.push(d.earliestStart.getUTCHours() * 60 + d.earliestStart.getUTCMinutes());
    }
  }
  const avgStartMinutes =
    startMinutes.length > 0
      ? Math.round(startMinutes.reduce((a, b) => a + b, 0) / startMinutes.length)
      : null;

  return {
    avgHours,
    deepPct,
    avgStartMinutes,
    hasData: daysWithBlocks.length > 0,
  };
}

export function computeWeekDeltas(
  days: Record<string, DayStats>,
  weekStart: Date,
): WeekDeltas {
  const prevStart = new Date(weekStart);
  prevStart.setDate(weekStart.getDate() - 7);

  const curr = aggregateWeek(days, weekStart);
  const prev = aggregateWeek(days, prevStart);

  if (!prev.hasData) {
    return {
      avgHoursDelta: null,
      deepPctDelta: null,
      avgStartDeltaMinutes: null,
      hasPrevWeekData: false,
    };
  }

  return {
    avgHoursDelta: curr.hasData ? curr.avgHours - prev.avgHours : null,
    deepPctDelta: curr.hasData ? curr.deepPct - prev.deepPct : null,
    avgStartDeltaMinutes:
      curr.avgStartMinutes !== null && prev.avgStartMinutes !== null
        ? curr.avgStartMinutes - prev.avgStartMinutes
        : null,
    hasPrevWeekData: true,
  };
}
