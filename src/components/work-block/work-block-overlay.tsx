'use client';

import { Portal } from '@/components/shared/portal';
import { WorkBlockStart } from './work-block-start';
import { WorkBlockActive } from './work-block-active';
import { FocusRating } from './focus-rating';
import { useWorkBlockStore } from '@/stores/work-block-store';
import { useTimer } from '@/hooks/use-timer';
import { useEffect, useState } from 'react';
import { WorkBlockType } from '@/lib/types';
import { toast } from 'sonner';
import { saveWorkBlock } from '@/app/(app)/output/actions';
import { markFirstBlockCompleted } from '@/app/onboarding/actions';
import { useOnboardingStore } from '@/stores/onboarding-store';
import { useRouter } from 'next/navigation';

interface WorkBlockOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function WorkBlockOverlay({ visible, onClose }: WorkBlockOverlayProps) {
  const { phase, activeBlock, startBlock, updateStartTime, completeBlock, finishRating, discardBlock, minimize } =
    useWorkBlockStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const hasCompletedFirstBlock = useOnboardingStore((s) => s.hasCompletedFirstBlock);

  const elapsedSinceStart = activeBlock
    ? Math.floor((Date.now() - activeBlock.startTime) / 1000)
    : 0;

  const isCountdown = activeBlock?.type === 'timer';
  const timerInitial = isCountdown ? (activeBlock?.plannedDuration ?? 0) : 0;

  const timer = useTimer({
    mode: isCountdown ? 'countdown' : 'stopwatch',
    initialSeconds: isCountdown ? Math.max(timerInitial - elapsedSinceStart, 0) : elapsedSinceStart,
    onComplete: () => {
      if (isCountdown) {
        toast('Timer complete! Time to wrap up.');
        completeBlock();
      }
    },
  });

  // Start timer when phase becomes active
  useEffect(() => {
    if (phase === 'active' && !timer.isRunning) {
      timer.start();
    }
    if (phase !== 'active' && timer.isRunning) {
      timer.pause();
    }
  }, [phase, timer]);

  if (!visible) return null;

  const handleStart = (title: string, type: WorkBlockType, plannedDuration: number | null) => {
    startBlock(title, type, plannedDuration);
    if (type === 'timer' && plannedDuration) {
      timer.reset(plannedDuration);
    } else {
      timer.reset(0);
    }
    timer.start();
  };

  const handleComplete = () => {
    timer.pause();
    completeBlock();
  };

  const handleDiscard = () => {
    timer.pause();
    timer.reset(0);
    discardBlock();
    onClose();
  };

  const handleRatingSubmit = async (score: number, thoughts: string | null) => {
    if (!activeBlock || submitting) return;
    setSubmitting(true);

    const now = new Date();
    const startTime = new Date(activeBlock.startTime);
    const duration = Math.floor((now.getTime() - activeBlock.startTime) / 1000);

    // Save to Supabase
    const result = await saveWorkBlock({
      title: activeBlock.title,
      startTime: startTime.toISOString(),
      endTime: now.toISOString(),
      duration,
      type: activeBlock.type,
      plannedDuration: activeBlock.plannedDuration,
      focusScore: score,
      thoughts,
    });

    if (result?.error) {
      toast.error('Failed to save: ' + result.error);
    } else {
      toast.success('Work block saved!');
      if (!hasCompletedFirstBlock) {
        await markFirstBlockCompleted();
        useOnboardingStore.getState().setHasCompletedFirstBlock(true);
      }
    }

    setSubmitting(false);
    finishRating();
    timer.reset(0);
    onClose();
    router.refresh();
  };

  const handleStartTimeChange = (newStartTime: number) => {
    updateStartTime(newStartTime);
    const elapsed = Math.floor((Date.now() - newStartTime) / 1000);
    if (isCountdown) {
      timer.reset(Math.max((activeBlock?.plannedDuration ?? 0) - elapsed, 0));
      timer.start();
    } else {
      timer.reset(elapsed);
      timer.start();
    }
  };

  const handleMinimize = () => {
    minimize();
    onClose();
  };

  const handleBackdropClick = () => {
    if (phase === 'active') {
      handleMinimize();
    } else if (phase === 'start') {
      useWorkBlockStore.getState().reset();
      onClose();
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        <div className="fixed inset-0 bg-black/40" onClick={handleBackdropClick} />
        <div className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-background p-8 shadow-2xl">
          {phase === 'start' && <WorkBlockStart onStart={handleStart} onCancel={onClose} />}
          {phase === 'active' && (
            <WorkBlockActive
              title={activeBlock?.title ?? ''}
              seconds={timer.seconds}
              isRunning={timer.isRunning}
              startTime={activeBlock?.startTime ?? Date.now()}
              onComplete={handleComplete}
              onDiscard={handleDiscard}
              onMinimize={handleMinimize}
              onStartTimeChange={handleStartTimeChange}
            />
          )}
          {phase === 'rating' && <FocusRating onSubmit={handleRatingSubmit} submitting={submitting} />}
        </div>
      </div>
    </Portal>
  );
}
