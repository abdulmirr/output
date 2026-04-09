'use client';

import { List, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'week' | 'month';
  onChange: (view: 'week' | 'month') => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 rounded-lg border border-border p-0.5">
      <button
        onClick={() => onChange('week')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
          view === 'week'
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <List className="h-3.5 w-3.5" />
        Week
      </button>
      <button
        onClick={() => onChange('month')}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
          view === 'month'
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Calendar className="h-3.5 w-3.5" />
        Month
      </button>
    </div>
  );
}
