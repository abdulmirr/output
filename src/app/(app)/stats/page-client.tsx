'use client';

import type { StatsData } from '@/lib/stats';
import { ActivityHeatmap } from '@/components/stats/activity-heatmap';
import { LifetimeOverview } from '@/components/stats/stats-grid';
import { WeekView } from '@/components/stats/week-view';
import { Insights } from '@/components/stats/insights';

interface StatsPageClientProps {
  data: StatsData;
}

function formatLifetimeRange(firstDateStr: string): string {
  const firstDate = new Date(firstDateStr + 'T12:00:00');
  const today = new Date();
  const opts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  return `${firstDate.toLocaleDateString('en-US', opts)} – ${today.toLocaleDateString('en-US', opts)}`;
}

export function StatsPageClient({ data }: StatsPageClientProps) {
  const firstLoggedDate = Object.keys(data.days)
    .filter((d) => data.days[d].blockCount > 0)
    .sort()[0];
  const hasData = !!firstLoggedDate;

  if (!hasData) {
    return (
      <div>
        <div className="space-y-1 mb-12 md:mb-16">
          <p className="text-xs font-mono uppercase tracking-wider text-foreground/40">
            All-time overview
          </p>
        </div>
        <p className="text-base font-light text-foreground/50">
          Start tracking work blocks to see your stats here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 md:space-y-16">
      <section className="space-y-4">
        <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
          Activity
        </h2>
        <ActivityHeatmap days={data.days} />
      </section>

      <div className="h-px bg-foreground/[0.06]" />

      <section className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
            All-time overview
          </h2>
          <p className="text-xs font-mono text-foreground/40">
            {formatLifetimeRange(firstLoggedDate)}
          </p>
        </div>
        <LifetimeOverview tiles={data.tiles} />
      </section>

      <div className="h-px bg-foreground/[0.06]" />

      <WeekView days={data.days} />

      <div className="h-px bg-foreground/[0.06]" />

      <Insights tiles={data.tiles} />
    </div>
  );
}
