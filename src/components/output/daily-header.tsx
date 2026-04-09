'use client';

import { formatTimerDisplay } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useOverlayStore } from '@/stores/overlay-store';
import { useWorkBlockStore } from '@/stores/work-block-store';
import { useRouter } from 'next/navigation';

interface DailyHeaderProps {
  date: string;
}

export function DailyHeader({ date }: DailyHeaderProps) {
  const [dateStr, setDateStr] = useState('');
  const [isToday, setIsToday] = useState(false);
  const openOverlay = useOverlayStore((s) => s.open);
  const workBlockPhase = useWorkBlockStore((s) => s.phase);
  const activeBlock = useWorkBlockStore((s) => s.activeBlock);
  const isActive = workBlockPhase === 'active' || workBlockPhase === 'rating';
  const router = useRouter();

  useEffect(() => {
    const d = new Date(date + 'T12:00:00');
    setDateStr(d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setIsToday(date === localToday);
  }, [date]);

  const handlePrevDay = () => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    router.push(`/output?date=${d.toISOString().split('T')[0]}`);
  };

  const handleNextDay = () => {
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    router.push(`/output?date=${d.toISOString().split('T')[0]}`);
  };

  const handleStartWorkBlock = () => {
    openOverlay('work-block');
    if (workBlockPhase === 'idle') {
      useWorkBlockStore.getState().beginStart();
    }
  };

  const handleRestore = () => {
    useWorkBlockStore.getState().restore();
    openOverlay('work-block');
  };

  if (!dateStr) {
    return (
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] h-8" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center">
        <button
          onClick={handlePrevDay}
          className="-ml-7 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em]">
          {dateStr}
        </h1>
        <button
          onClick={handleNextDay}
          className="ml-1 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      {isActive && activeBlock ? (
        <MiniTimer
          startTime={activeBlock.startTime}
          type={activeBlock.type}
          plannedDuration={activeBlock.plannedDuration}
          title={activeBlock.title}
          onClick={handleRestore}
        />
      ) : isToday ? (
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={handleStartWorkBlock}
            className="flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-accent"
            title="Start Work Block"
          >
            <Plus className="h-5 w-5" />
            Start work block
          </button>
          <p className="text-xs text-muted-foreground/60 pr-1">
            or Press{' '}
            <kbd className="px-1 py-0.5 text-xs bg-muted rounded font-mono">
              Cmd+Shift+O
            </kbd>
          </p>
        </div>
      ) : null}
    </div>
  );
}

function MiniTimer({
  startTime,
  type,
  plannedDuration,
  title,
  onClick,
}: {
  startTime: number;
  type: 'stopwatch' | 'timer';
  plannedDuration: number | null;
  title: string;
  onClick: () => void;
}) {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - startTime) / 1000)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const displaySeconds =
    type === 'timer' && plannedDuration
      ? Math.max(plannedDuration - elapsed, 0)
      : elapsed;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors shadow-sm"
      title={title}
    >
      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      <span className="font-mono tabular-nums text-sm font-semibold">
        {formatTimerDisplay(displaySeconds)}
      </span>
      <span className="text-muted-foreground truncate max-w-[120px]">
        {title}
      </span>
    </button>
  );
}
