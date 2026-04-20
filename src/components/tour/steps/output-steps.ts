import type { TourStep } from '@/lib/tour/tour-types';

export const OUTPUT_STEPS: TourStep[] = [
  {
    targetId: 'output.start-block-cta',
    title: 'Start a work block',
    body: 'A timed, intentional focus session. Name it, hit go, and rate your focus when you\u2019re done.',
    kbd: ['\u2318', '\u21e7', 'O'],
    advanceOn: 'click-target',
    placement: 'bottom',
    route: '/output',
  },
  {
    targetId: 'output.manual-add-button',
    title: 'Missed tracking live?',
    body: 'Add a block manually with start/end time, title, and a focus rating 1\u20135.',
    advanceOn: 'click-target',
    placement: 'right',
    route: '/output',
  },
  {
    targetId: 'output.daily-todos',
    title: 'Daily to-dos',
    body: 'Quick one-liners for today. Think scratchpad, not your full task list.',
    advanceOn: 'manual',
    placement: 'right',
    route: '/output',
  },
  {
    targetId: 'output.thoughts',
    title: 'End-of-day thoughts',
    body: 'A space for reflection. What worked, what didn\u2019t. Two sentences is plenty.',
    advanceOn: 'manual',
    cta: 'Continue to tasks \u2192',
    placement: 'right',
    route: '/output',
  },
];
