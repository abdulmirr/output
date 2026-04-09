'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function TzCookie() {
  const router = useRouter();

  useEffect(() => {
    const offset = new Date().getTimezoneOffset();
    const match = document.cookie.match(/(?:^|;\s*)tz_offset=(-?\d+)/);
    const current = match ? parseInt(match[1], 10) : null;
    if (current === offset) return;
    document.cookie = `tz_offset=${offset}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
