export const HOTKEYS = {
  TOGGLE_WORK_BLOCK: 'meta+shift+o',
  ADD_TASK: 'meta+shift+n',
  KEYBOARD_SHORTCUTS: 'meta+/',
} as const;

export const FOCUS_EMOJIS: Record<number, string> = {
  1:  '\u{1F635}',  // 😵 wasted
  2:  '\u{1F615}',  // 😕 scattered
  3:  '\u{1F610}',  // 😐 meh
  4:  '\u{1F606}',  // 😆 good
  5:  '\u{1F60B}',  // 😋 deep
  6:  '\u{1F60A}',  // 😊 focused
  7:  '\u{1F604}',  // 😄 productive
  8:  '\u{1F3AF}',  // 🎯 in the zone
  9:  '\u{1F525}',  // 🔥 deep work
  10: '\u{1F929}',  // 🤩 flow state
};

export const FOCUS_LABELS: Record<number, string> = {
  1:  'Distracted',
  2:  'Scattered',
  3:  'Meh',
  4:  'Focused',
  5:  'Deep work',
  6:  'Focused',
  7:  'Productive',
  8:  'In the zone',
  9:  'Deep work',
  10: 'Flow state',
};

export const FOCUS_TEXT_COLORS: Record<number, string> = {
  1:  'text-red-600',
  2:  'text-orange-500',
  3:  'text-yellow-500',
  4:  'text-[#8DC63F]',
  5:  'text-[#1DB954]',
  6:  'text-lime-500',
  7:  'text-green-400',
  8:  'text-green-500',
  9:  'text-emerald-500',
  10: 'text-teal-500',
};

export const RATING_BADGE_BG: Record<number, string> = {
  1:  'bg-[#8b3a3a]',
  2:  'bg-[#9e4545]',
  3:  'bg-[#a05a35]',
  4:  'bg-[#9b7035]',
  5:  'bg-[#72777e]',
  6:  'bg-[#5c6470]',
  7:  'bg-[#3d5f92]',
  8:  'bg-[#2d508a]',
  9:  'bg-[#3d6b4a]',
  10: 'bg-[#2d5c3d]',
};

export const DEFAULT_TIMER_DURATION = 25 * 60; // 25 minutes in seconds
export const MAX_BLOCK_DURATION = 12 * 60 * 60; // 12 hours in seconds
