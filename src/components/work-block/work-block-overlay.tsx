'use client';

import { Portal } from '@/components/shared/portal';
import { WorkBlockStart } from './work-block-start';
import { WorkBlockActive } from './work-block-active';
import { FocusRating } from './focus-rating';
import { useWorkBlockStore } from '@/stores/work-block-store';
import { useEffect, useRef, useState } from 'react';
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
  const { phase, activeBlock, startBlock, updateStartTime, updateTitle, completeBlock, finishRating, discardBlock, minimize } =
    useWorkBlockStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const hasCompletedFirstBlock = useOnboardingStore((s) => s.hasCompletedFirstBlock);

  const isCountdown = activeBlock?.type === 'timer';
  const plannedDuration = activeBlock?.plannedDuration ?? 0;

  // Wall-clock based tick so the displayed timer stays in sync with real time
  // even when the tab is backgrounded or setInterval gets throttled.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (phase !== 'active') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- wall-clock sync on phase change
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const elapsedSinceStart = activeBlock
    ? Math.floor((now - activeBlock.startTime) / 1000)
    : 0;

  const displaySeconds = isCountdown
    ? Math.max(plannedDuration - elapsedSinceStart, 0)
    : elapsedSinceStart;

  const isRunning = phase === 'active';

  // Fire countdown completion exactly once when time runs out
  const completedRef = useRef(false);
  useEffect(() => {
    if (phase !== 'active') {
      completedRef.current = false;
      return;
    }
    if (isCountdown && elapsedSinceStart >= plannedDuration && plannedDuration > 0 && !completedRef.current) {
      completedRef.current = true;
      toast('Timer complete! Time to wrap up.');
      completeBlock();
    }
  }, [phase, isCountdown, elapsedSinceStart, plannedDuration, completeBlock]);

  if (!visible) return null;

  const handleStart = (title: string, type: WorkBlockType, plannedDuration: number | null) => {
    startBlock(title, type, plannedDuration);
  };

  const handleComplete = () => {
    completeBlock();
  };

  const handleDiscard = () => {
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
    onClose();
    router.refresh();
  };

  const handleStartTimeChange = (newStartTime: number) => {
    updateStartTime(newStartTime);
  };

  const handleTitleChange = (newTitle: string) => {
    updateTitle(newTitle);
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
          {phase === 'active' && activeBlock && (
            <WorkBlockActive
              title={activeBlock.title}
              seconds={displaySeconds}
              isRunning={isRunning}
              startTime={activeBlock.startTime}
              onComplete={handleComplete}
              onDiscard={handleDiscard}
              onMinimize={handleMinimize}
              onStartTimeChange={handleStartTimeChange}
              onTitleChange={handleTitleChange}
            />
          )}
          {phase === 'rating' && <FocusRating onSubmit={handleRatingSubmit} submitting={submitting} />}
        </div>
      </div>
    </Portal>
  );
}
