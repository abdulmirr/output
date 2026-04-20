import type { TourStep } from '@/lib/tour/tour-types';

export const TASKS_STEPS: TourStep[] = [
  {
    targetId: 'tasks.tab-bar',
    title: 'Folders group your work',
    body: 'Inbox is your default catch-all. You can drag tasks between folders or create new ones.',
    advanceOn: 'manual',
    placement: 'bottom',
    route: '/tasks',
  },
  {
    targetId: 'tasks.add-button',
    title: 'Add a task',
    body: 'Try it now \u2014 we\u2019ll wait.',
    kbd: ['\u2318', '\u21e7', 'P'],
    advanceOn: 'click-target',
    placement: 'left',
    route: '/tasks',
  },
  {
    targetId: 'tasks.detail-fields',
    title: 'Title is all you need',
    body: 'Notes, a duration estimate, and a due date help you plan \u2014 but they\u2019re optional.',
    advanceOn: 'action',
    placement: 'right',
    route: '/tasks',
  },
  {
    targetId: 'tasks.first-row',
    title: 'Edit, reorder, complete',
    body: 'Click the title to edit. Drag to reorder. Check the box when you\u2019re done.',
    advanceOn: 'action',
    placement: 'right',
    route: '/tasks',
  },
  {
    targetId: 'tasks.finale',
    title: 'You\u2019re all set.',
    body: 'Your Output page is your daily home. Come back tomorrow and do it again.',
    advanceOn: 'manual',
    cta: 'Done',
    placement: 'auto',
    route: '/tasks',
    isFinale: true,
  },
];
