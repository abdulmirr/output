import { cookies } from 'next/headers';
import { getProfile } from '@/lib/api/queries';

function offsetForZone(tz: string): number | null {
  try {
    const now = new Date();
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const parts = dtf.formatToParts(now);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const asZone = Date.UTC(
      get('year'),
      get('month') - 1,
      get('day'),
      get('hour'),
      get('minute'),
      get('second')
    );
    return Math.round((now.getTime() - asZone) / 60000);
  } catch {
    return null;
  }
}

export async function getTzOffsetMinutes(): Promise<number> {
  const store = await cookies();
  const raw = store.get('tz_offset')?.value;
  if (raw) {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n)) return n;
  }
  const profile = await getProfile();
  if (profile?.timezone) {
    const fromZone = offsetForZone(profile.timezone);
    if (fromZone !== null) return fromZone;
  }
  return 0;
}
