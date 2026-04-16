'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TzCookieProps {
  profileTimezone?: string | null;
}

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

export function TzCookie({ profileTimezone }: TzCookieProps) {
  const router = useRouter();

  useEffect(() => {
    const offset =
      (profileTimezone ? offsetForZone(profileTimezone) : null) ??
      new Date().getTimezoneOffset();
    const match = document.cookie.match(/(?:^|;\s*)tz_offset=(-?\d+)/);
    const current = match ? parseInt(match[1], 10) : null;
    if (current === offset) return;
    document.cookie = `tz_offset=${offset}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router, profileTimezone]);

  return null;
}
