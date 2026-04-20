'use client';

import { formatTimerDisplay } from '@/lib/utils';
import { useState, useEffect, useSyncExternalStore } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOverlayStore } from '@/stores/overlay-store';
import { useWorkBlockStore } from '@/stores/work-block-store';
import { useRouter } from 'next/navigation';

interface DailyHeaderProps {
  date: string;
}

const subscribeMounted = () => () => {};

export function DailyHeader({ date }: DailyHeaderProps) {
  const isMounted = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false
  );
  const openOverlay = useOverlayStore((s) => s.open);
  const workBlockPhase = useWorkBlockStore((s) => s.phase);
  const activeBlock = useWorkBlockStore((s) => s.activeBlock);
  const isActive = workBlockPhase === 'active' || workBlockPhase === 'rating';
  const router = useRouter();

  const d = new Date(date + 'T12:00:00');
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateLabel = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  let isToday = false;
  if (isMounted) {
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    isToday = date === localToday;
  }

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

  if (!isMounted) {
    return <div className="mb-16 md:mb-20 h-24" />;
  }

  return (
    <div className="mb-16 md:mb-20">
      {/* Date row: April 11 (left) + Start Work Block (right) — same row */}
      <div className="flex items-center justify-between">
        {/* Left arrow floats outside so h1 text aligns with page content */}
        <div className="relative flex items-center">
          <button
            onClick={handlePrevDay}
            className="absolute -left-7 text-foreground/20 hover:text-foreground/60 transition-colors"
            title="Previous day"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight">
            {dateLabel}
          </h1>
          <button
            onClick={handleNextDay}
            className="ml-2 text-foreground/20 hover:text-foreground/60 transition-colors"
            title="Next day"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Right side: active timer or start button */}
        <div className="flex items-center">
          {isActive && activeBlock ? (
            <MiniTimer
              startTime={activeBlock.startTime}
              type={activeBlock.type}
              plannedDuration={activeBlock.plannedDuration}
              title={activeBlock.title}
              onClick={handleRestore}
            />
          ) : isToday ? (
            <div className="flex flex-col items-end gap-1.5">
              <button
                onClick={handleStartWorkBlock}
                className="rounded-xl bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors shadow-sm"
                title="Start work block"
              >
                + Start work block
              </button>
              <span className="text-[11px] text-foreground/40 font-mono">
                Cmd+Shift+O
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Weekday label — below the date */}
      <p className="text-xs font-mono uppercase tracking-wider text-foreground/40 mt-2">
        {weekday}
      </p>
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
      className="flex items-center gap-3 text-sm font-mono text-foreground/60 hover:text-foreground transition-colors"
      title={title}
    >
      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      <span className="tabular-nums">
        {formatTimerDisplay(displaySeconds)}
      </span>
      <span className="text-foreground/40 truncate max-w-[160px]">
        {title}
      </span>
    </button>
  );
}
