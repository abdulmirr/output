const KEY_LABELS: Record<string, string> = {
  meta: 'Cmd',
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
};

const KEY_SYMBOLS: Record<string, string> = {
  meta: '\u2318',
  shift: '\u21e7',
  ctrl: '\u2303',
  alt: '\u2325',
};

export function formatShortcutText(shortcut: string): string {
  return shortcut
    .split('+')
    .map((k) => KEY_LABELS[k.toLowerCase()] ?? k.toUpperCase())
    .join('+');
}

export function formatShortcutSymbols(shortcut: string): string[] {
  return shortcut
    .split('+')
    .map((k) => KEY_SYMBOLS[k.toLowerCase()] ?? k.toUpperCase());
}

export function keyEventToShortcut(e: KeyboardEvent): string | null {
  const key = e.key.toLowerCase();
  if (['meta', 'control', 'alt', 'shift', 'dead'].includes(key)) return null;

  const hasRealModifier = e.metaKey || e.ctrlKey || e.altKey;
  if (!hasRealModifier) return null;

  const parts: string[] = [];
  if (e.metaKey) parts.push('meta');
  if (e.ctrlKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');
  parts.push(key);
  return parts.join('+');
}

const RESERVED_SHORTCUTS = new Set([
  'meta+shift+o',
  'meta+/',
  'escape',
]);

export function isReservedShortcut(shortcut: string): boolean {
  return RESERVED_SHORTCUTS.has(shortcut);
}
