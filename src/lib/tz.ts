import { cookies } from 'next/headers';

export async function getTzOffsetMinutes(): Promise<number> {
  const store = await cookies();
  const raw = store.get('tz_offset')?.value;
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}
