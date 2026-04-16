import type { StatsTiles } from '@/lib/stats';
import { formatDuration } from '@/lib/utils';

interface InsightsProps {
  tiles: StatsTiles;
}

export function Insights({ tiles }: InsightsProps) {
  const insights: { prefix: string; highlight: string }[] = [];

  if (tiles.bestDayOfWeek) {
    insights.push({
      prefix: 'Most productive on',
      highlight: `${tiles.bestDayOfWeek}s`,
    });
  }

  if (tiles.weightedAvgFocusScore !== null) {
    insights.push({
      prefix: 'Average focus',
      highlight: `${tiles.weightedAvgFocusScore.toFixed(1)} / 5`,
    });
  }

  if (tiles.bestStreak > 0) {
    insights.push({
      prefix: 'Longest streak',
      highlight: `${tiles.bestStreak} day${tiles.bestStreak === 1 ? '' : 's'}`,
    });
  }

  if (tiles.longestSessionSeconds > 0) {
    insights.push({
      prefix: 'Longest single session',
      highlight: formatDuration(tiles.longestSessionSeconds),
    });
  }

  if (insights.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
        Patterns
      </h2>
      <ul className="space-y-2">
        {insights.map((i, idx) => (
          <li key={idx} className="text-base font-light text-foreground/70 leading-relaxed">
            {i.prefix}{' '}
            <span className="text-foreground">{i.highlight}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
