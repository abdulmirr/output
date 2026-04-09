import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

export function formatTimeRange(start: Date, end: Date): string {
  const startPeriod = start.getHours() < 12 ? 'AM' : 'PM';
  const endPeriod = end.getHours() < 12 ? 'AM' : 'PM';
  const samePeriod = startPeriod === endPeriod;

  const fmtStart = (d: Date) =>
    d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !samePeriod,
    });
  const fmtEnd = (d: Date) =>
    d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  return `${fmtStart(start)}\u2013${fmtEnd(end)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function getTodayString(tzOffsetMinutes = 0): string {
  // tzOffsetMinutes matches Date.getTimezoneOffset(): minutes west of UTC.
  const now = Date.now();
  const local = new Date(now - tzOffsetMinutes * 60_000);
  return local.toISOString().split('T')[0];
}

/**
 * Given a YYYY-MM-DD date interpreted in the user's local timezone, return
 * the UTC ISO bounds [startUtc, endUtc) for that local day.
 */
export function getLocalDayUtcRange(
  date: string,
  tzOffsetMinutes = 0,
): { startUtc: string; endUtc: string } {
  const [y, m, d] = date.split('-').map(Number);
  // Local midnight in UTC ms = Date.UTC(...) + offsetMs
  const offsetMs = tzOffsetMinutes * 60_000;
  const startMs = Date.UTC(y, m - 1, d) + offsetMs;
  const endMs = startMs + 24 * 60 * 60 * 1000;
  return {
    startUtc: new Date(startMs).toISOString(),
    endUtc: new Date(endMs).toISOString(),
  };
}

export function parseDurationInput(input: string): number | null {
  const hours = input.match(/(\d+)\s*h/i);
  const minutes = input.match(/(\d+)\s*m/i);
  if (!hours && !minutes) return null;
  return (
    (hours ? parseInt(hours[1]) : 0) * 3600 +
    (minutes ? parseInt(minutes[1]) : 0) * 60
  );
}

export function formatTimerDisplay(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
