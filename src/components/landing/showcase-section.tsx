import { FadeIn } from './fade-in';

export function ShowcaseSection() {
  return (
    <section className="py-24 md:py-32 border-t border-border">
      <div className="mx-auto max-w-5xl px-6 space-y-24 md:space-y-32">
        {/* Row 1: Text left, Visual right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <FadeIn>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Keyboard-first workflow
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Hit a shortcut to open the work block overlay. Type what you&apos;re
                working on, choose stopwatch or countdown, and press Enter. When
                you&apos;re done, rate your focus and move on. No clicking through menus.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <StepBadge step="1" label="Open overlay" />
                <StepBadge step="2" label="Start timer" />
                <StepBadge step="3" label="Rate focus" />
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <WorkBlockMockup />
          </FadeIn>
        </div>

        {/* Row 2: Outputs stacking up */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <FadeIn className="order-2 md:order-1">
            <DepthRatingMockup />
          </FadeIn>
          <FadeIn delay={150} className="order-1 md:order-2">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Know how deep you actually went
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Rate every work block — shallow, okay, or deep — the moment you
                finish it. At the end of the day you don&apos;t just see hours
                logged, you see how many of them were actually productive.
              </p>
            </div>
          </FadeIn>
        </div>

        {/* Row 3: Tasks page */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <FadeIn>
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                Capture tasks the second they hit you
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Hit ⌘⇧N from anywhere on your desktop to drop a task straight
                into your inbox. No app switching, no losing the thought —
                just type it and get back to what you were doing.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <TasksInboxMockup />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function DepthRatingMockup() {
  const blocks = [
    { label: 'Deep work building product', duration: '1h 45m', rating: 'Deep' as const },
    { label: 'Code review + PR feedback', duration: '45m', rating: 'Okay' as const },
    { label: 'Slack + email triage', duration: '30m', rating: 'Shallow' as const },
    { label: 'Landing page polish', duration: '1h 10m', rating: 'Deep' as const },
  ];
  const ratingStyles = {
    Deep: 'bg-green-500/15 text-green-500 border-green-500/30',
    Okay: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/30',
    Shallow: 'bg-red-500/15 text-red-500 border-red-500/30',
  };
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em]">Today</h2>
        <div className="text-xs text-muted-foreground">
          <span className="text-foreground font-semibold">2h 55m</span> deep · 4h 10m total
        </div>
      </div>
      <div className="space-y-2">
        {blocks.map((b) => (
          <div
            key={b.label}
            className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2.5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center shrink-0">
                <svg className="h-3.5 w-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{b.label}</div>
                <div className="text-[11px] text-muted-foreground">{b.duration}</div>
              </div>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ratingStyles[b.rating]}`}>
              {b.rating}
            </span>
          </div>
        ))}
      </div>
    </div>
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
    <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
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

function StepBadge({ step, label }: { step: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
        {step}
      </span>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

function WorkBlockMockup() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-lg">
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
