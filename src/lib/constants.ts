export const HOTKEYS = {
  TOGGLE_WORK_BLOCK: 'meta+shift+o',
  ADD_TASK: 'meta+shift+u',
  KEYBOARD_SHORTCUTS: 'meta+/',
} as const;

export const FOCUS_EMOJIS: Record<number, string> = {
  1:  '\u{1F635}',  // 😵 wasted
  2:  '\u{1F615}',  // 😕 distracted
  3:  '\u{1F610}',  // 😐 ok
  4:  '\u{1F606}',  // 😆 good
  5:  '\u{1F60B}',  // 😋 deep
};

export const FOCUS_LABELS: Record<number, string> = {
  1:  'Wasted',
  2:  'Distracted',
  3:  'Ok',
  4:  'Good',
  5:  'Deep',
};

export const FOCUS_TEXT_COLORS: Record<number, string> = {
  1:  'text-red-600',
  2:  'text-orange-500',
  3:  'text-yellow-500',
  4:  'text-[#8DC63F]',
  5:  'text-[#1DB954]',
};

export const RATING_BADGE_BG: Record<number, string> = {
  1:  'bg-[#8b3a3a]',
  2:  'bg-[#9e4545]',
  3:  'bg-[#a05a35]',
  4:  'bg-[#3d5f92]',
  5:  'bg-[#3d6b4a]',
};

export const FOCUS_BG_COLORS: Record<number, string> = {
  1: 'bg-red-600',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-[#8DC63F]',
  5: 'bg-[#1DB954]',
};

export const DEFAULT_TIMER_DURATION = 25 * 60; // 25 minutes in seconds
export const MAX_BLOCK_DURATION = 12 * 60 * 60; // 12 hours in seconds
