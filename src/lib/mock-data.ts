import { WorkBlock, Task, DailyLog, DailyTodo } from './types';

// Use fixed dates to avoid SSR/client hydration mismatches.
// These helper functions are only called from client components.
function stableDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

// Fixed "today" reference: March 25, 2026
const REF_YEAR = 2026;
const REF_MONTH = 3;
const REF_DAY = 25;
const REF_TODAY_STR = '2026-03-25';

function refTimeToday(hour: number, minute: number): Date {
  return stableDate(REF_YEAR, REF_MONTH, REF_DAY, hour, minute);
}

function refDaysAgo(n: number): Date {
  return stableDate(REF_YEAR, REF_MONTH, REF_DAY - n);
}

function refTimeOnDate(daysAgoN: number, hour: number, minute: number): Date {
  return stableDate(REF_YEAR, REF_MONTH, REF_DAY - daysAgoN, hour, minute);
}

// --- Today's work blocks ---
export const mockWorkBlocks: WorkBlock[] = [
  {
    id: 'wb-1',
    title: 'Design system architecture',
    startTime: refTimeToday(9, 0),
    endTime: refTimeToday(10, 30),
    duration: 5400,
    type: 'stopwatch',
    plannedDuration: null,
    focusScore: 4,
    thoughts: 'Good flow state, got a lot done',
    status: 'completed',
    quality: 'deep',
    createdAt: refTimeToday(9, 0),
  },
  {
    id: 'wb-2',
    title: 'Code review PR #42',
    startTime: refTimeToday(11, 0),
    endTime: refTimeToday(11, 45),
    duration: 2700,
    type: 'timer',
    plannedDuration: 2700,
    focusScore: 3,
    thoughts: null,
    status: 'completed',
    quality: null,
    createdAt: refTimeToday(11, 0),
  },
  {
    id: 'wb-3',
    title: 'Write API documentation',
    startTime: refTimeToday(13, 0),
    endTime: refTimeToday(14, 20),
    duration: 4800,
    type: 'stopwatch',
    plannedDuration: null,
    focusScore: 3,
    thoughts: 'Got distracted midway but pulled through',
    status: 'completed',
    quality: 'meh',
    createdAt: refTimeToday(13, 0),
  },
];

// --- Tasks ---
export const mockTasks: Task[] = [
  {
    id: 't-1',
    title: 'Finish API integration',
    notes: 'Focus on the auth endpoints first',
    dueDate: refTimeToday(0, 0),
    status: 'pending',
    folderId: null,
    estimatedDuration: 5400,
    sortOrder: 0,
    createdAt: refDaysAgo(2),
    completedAt: null,
  },
  {
    id: 't-2',
    title: 'Review design mockups',
    notes: null,
    dueDate: refTimeToday(0, 0),
    status: 'completed',
    folderId: null,
    estimatedDuration: 1800,
    sortOrder: 1,
    createdAt: refDaysAgo(1),
    completedAt: refTimeToday(10, 0),
  },
  {
    id: 't-3',
    title: 'Write unit tests for auth module',
    notes: 'Cover edge cases for token refresh',
    dueDate: stableDate(REF_YEAR, REF_MONTH, REF_DAY + 2),
    status: 'pending',
    folderId: null,
    estimatedDuration: 7200,
    sortOrder: 2,
    createdAt: refDaysAgo(3),
    completedAt: null,
  },
  {
    id: 't-4',
    title: 'Update project README',
    notes: null,
    dueDate: null,
    status: 'pending',
    folderId: null,
    estimatedDuration: null,
    sortOrder: 3,
    createdAt: refDaysAgo(5),
    completedAt: null,
  },
  {
    id: 't-5',
    title: 'Research caching strategies',
    notes: 'Look into Redis vs in-memory options',
    dueDate: null,
    status: 'pending',
    folderId: null,
    estimatedDuration: 3600,
    sortOrder: 4,
    createdAt: refDaysAgo(4),
    completedAt: null,
  },
  {
    id: 't-6',
    title: 'Set up CI/CD pipeline',
    notes: 'Use GitHub Actions',
    dueDate: stableDate(REF_YEAR, REF_MONTH, REF_DAY + 3),
    status: 'pending',
    folderId: null,
    estimatedDuration: 5400,
    sortOrder: 5,
    createdAt: refDaysAgo(2),
    completedAt: null,
  },
];

// --- Daily log ---
export const mockDailyLog: DailyLog = {
  id: 'dl-1',
  date: REF_TODAY_STR,
  dailyThoughts: 'Productive morning. Need to focus more after lunch.',
  dailyFocusScore: null,
  dailyReflection: null,
  loggedOff: false,
  createdAt: refTimeToday(9, 0),
};

// --- Daily todos ---
export const mockDailyTodos: DailyTodo[] = [
  { id: 'dt-1', taskText: 'Ship v1 of the dashboard', completed: true, order: 0, date: REF_TODAY_STR, taskId: null },
  { id: 'dt-2', taskText: 'Write documentation', completed: false, order: 1, date: REF_TODAY_STR, taskId: null },
  { id: 'dt-3', taskText: 'Review team PRs', completed: false, order: 2, date: REF_TODAY_STR, taskId: null },
];

// --- Historical data for calendar (last 30 days) ---
// Uses seeded pseudo-random to be deterministic across server/client.
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateHistoricalBlocks(): WorkBlock[] {
  const rand = seededRandom(42);
  const blocks: WorkBlock[] = [];
  const titles = [
    'Deep work session', 'Email & admin', 'Team meeting', 'Code review',
    'Feature development', 'Bug fixing', 'Research', 'Planning',
    'Documentation', 'Testing', 'Design work', 'Brainstorming',
  ];

  for (let day = 1; day <= 30; day++) {
    const blockCount = Math.floor(rand() * 4) + 1;
    for (let b = 0; b < blockCount; b++) {
      const startHour = 8 + b * 2 + Math.floor(rand() * 2);
      const durationMins = 30 + Math.floor(rand() * 90);
      const startMin = Math.floor(rand() * 30);
      const start = refTimeOnDate(day, startHour, startMin);
      const end = new Date(start.getTime() + durationMins * 60 * 1000);

      blocks.push({
        id: `wb-hist-${day}-${b}`,
        title: titles[Math.floor(rand() * titles.length)],
        startTime: start,
        endTime: end,
        duration: durationMins * 60,
        type: rand() > 0.7 ? 'timer' : 'stopwatch',
        plannedDuration: null,
        focusScore: Math.floor(rand() * 5) + 1,
        thoughts: null,
        status: 'completed',
        quality: null,
        createdAt: start,
      });
    }
  }
  return blocks;
}

export function generateHistoricalLogs(): Record<string, DailyLog> {
  const rand = seededRandom(99);
  const logs: Record<string, DailyLog> = {};
  for (let day = 1; day <= 30; day++) {
    const d = refDaysAgo(day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    logs[dateStr] = {
      id: `dl-hist-${day}`,
      date: dateStr,
      dailyThoughts: '',
      dailyFocusScore: Math.floor(rand() * 5) + 5,
      dailyReflection: null,
      loggedOff: true,
      createdAt: d,
    };
  }
  return logs;
}
