import { FadeIn } from './fade-in';

export function ShowcaseSection() {
  return (
    <section className="pt-12 pb-24 md:pt-16 md:pb-32">
      <div className="mx-auto max-w-5xl px-6 space-y-24 md:space-y-32">
        {/* Row 1: Work Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <FadeIn>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Start a work block in seconds
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Open the overlay, name what you&apos;re building, choose stopwatch
                or timer, and go. When you&apos;re done, rate your depth.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <WorkBlockMockup />
          </FadeIn>
        </div>

        {/* Row 2: Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <FadeIn className="order-2 md:order-1">
            <TasksInboxMockup />
          </FadeIn>
          <FadeIn delay={150} className="order-1 md:order-2">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Capture tasks to stay in flow
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Open the quick-add from anywhere. Drop a task into your inbox and
                get back to work. No app switching, no context lost.
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Row 3: Weekly Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <FadeIn>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Get weekly stats
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Review your weekly and monthly stats to identify patterns. Are you hitting your deep work goals, or are shallow tasks taking over? Visualize your focus and adjust.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <WeeklyStatsMockup />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}


function TasksInboxMockup() {
  const tasks = [
    'Reply to investor intro email',
    'Fix work block timer drift bug',
    'Outline next week\u2019s landing rewrite',
    'Book dentist appointment',
    'Review pricing page copy',
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Inbox</h2>
          <span className="text-xs text-muted-foreground">{tasks.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"><span className="text-xs">&#8984;</span></kbd>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">Shift</kbd>
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">N</kbd>
        </div>
      </div>
      <div className="space-y-1">
        {tasks.map((t) => (
          <div key={t} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50">
            <div className="h-4 w-4 rounded border border-border shrink-0" />
            <span className="text-sm">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function WorkBlockMockup() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      <div className="space-y-6 mt-2">
        <div className="space-y-2">
          <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Start work block</h2>
          <p className="text-sm font-semibold text-muted-foreground">What are you working on?</p>
        </div>

        <div className="border-0 border-b border-border pb-1">
          <span className="text-lg font-normal text-foreground">Deep work building product</span>
          <span className="animate-pulse ml-px text-primary">|</span>
        </div>

        <div className="flex gap-2 pt-1">
          <div className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 bg-muted text-foreground text-sm font-medium">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Stopwatch
          </div>
          <div className="flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-muted-foreground text-sm font-medium hover:bg-muted">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="9" />
            </svg>
            Timer
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <div className="h-9 px-4 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">Start</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeeklyStatsMockup() {
  const focusSegments = [
    { score: 5, bg: 'bg-[#1DB954]', dot: 'bg-[#1DB954]', label: 'Deep', value: '18h 45m', pct: 60 },
    { score: 4, bg: 'bg-[#8DC63F]', dot: 'bg-[#8DC63F]', label: 'Good', value: '4h 10m', pct: 15 },
    { score: 3, bg: 'bg-yellow-400', dot: 'bg-yellow-400', label: 'Okay', value: '2h 15m', pct: 15 },
    { score: 1, bg: 'bg-red-500', dot: 'bg-red-500', label: 'Wasted', value: '1h 20m', pct: 10 },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      <div className="space-y-5">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl md:text-5xl font-light text-foreground leading-none tracking-tight tabular-nums">
            26h 30m
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            total
          </span>
        </div>

        <div className="flex h-3 w-full rounded-full overflow-hidden gap-0.5 my-6">
          {focusSegments.map((seg, i) => (
            <div
              key={i}
              className={`${seg.bg} first:rounded-l-full last:rounded-r-full transition-all duration-300`}
              style={{ width: `${seg.pct}%` }}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
          {focusSegments.map((seg, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${seg.dot}`} />
              <span className="text-sm text-foreground/50">
                {seg.label}{' '}
                <span className="font-mono tabular-nums text-foreground/80 ml-0.5">
                  {seg.value}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
