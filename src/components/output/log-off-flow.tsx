'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EmojiSlider } from '@/components/work-block/emoji-slider';
import { useState, useTransition } from 'react';
import { FOCUS_EMOJIS } from '@/lib/constants';
import { toast } from 'sonner';
import { logOff as logOffAction } from '@/app/(app)/output/actions';
import { useRouter } from 'next/navigation';
import type { DailyLog } from '@/lib/types';

interface LogOffFlowProps {
  initialLog: DailyLog | null;
  today: string;
}

export function LogOffFlow({ initialLog, today }: LogOffFlowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loggedOff, setLoggedOff] = useState(initialLog?.loggedOff ?? false);

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [focusScore, setFocusScore] = useState(3);
  const [reflection, setReflection] = useState('');
  const [tomorrowTasks, setTomorrowTasks] = useState(['', '', '']);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setLoggedOff(true);
      startTransition(async () => {
        const result = await logOffAction({
          date: today,
          focusScore,
          reflection,
          tomorrowTasks,
        });
        if (result?.error) {
          toast.error(result.error);
          setLoggedOff(false);
        } else {
          toast.success('Logged off for the day. Great work!');
          setStep(3);
          router.refresh();
        }
      });
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setStep(1);
      setFocusScore(3);
      setReflection('');
      setTomorrowTasks(['', '', '']);
    }
  };

  const updateTomorrowTask = (index: number, value: string) => {
    setTomorrowTasks((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  if (loggedOff) {
    return (
      <div className="pt-4 text-center text-sm font-light text-foreground/40">
        You&apos;ve logged off for today. Great work!
      </div>
    );
  }

  return (
    <>
      <div className="pt-12">
        <button
          onClick={() => setOpen(true)}
          className="text-sm font-normal text-foreground/70 hover:text-foreground/90 transition-colors"
        >
          Log off for the day
        </button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {step === 1 && (
            <>
              <DialogHeader>
                <DialogTitle className="font-light text-xl">How focused did you feel today?</DialogTitle>
                <p className="text-xs font-mono text-foreground/30 uppercase tracking-wider">Step 1 of 2</p>
              </DialogHeader>
              <div className="py-4">
                <EmojiSlider value={focusScore} onChange={setFocusScore} max={5} />
              </div>
              <DialogFooter>
                <Button onClick={handleNext}>Next</Button>
              </DialogFooter>
            </>
          )}

          {step === 2 && (
            <>
              <DialogHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xs font-mono text-foreground/40 uppercase tracking-wider">
                    Reflect
                  </DialogTitle>
                  <span className="text-xs font-mono text-foreground/30 uppercase tracking-wider">Step 2 of 2</span>
                </div>
              </DialogHeader>
              <div className="space-y-6 py-2">
                {/* Reflection */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">How did you feel about today&apos;s work?</label>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Briefly describe how you felt…"
                    rows={4}
                    className="w-full text-sm bg-transparent outline-none resize-none placeholder:text-muted-foreground/40 leading-relaxed"
                  />
                </div>

                {/* Tomorrow's tasks */}
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Tasks for tomorrow</label>
                  <div className="space-y-1">
                    {tomorrowTasks.map((task, i) => (
                      <input
                        key={i}
                        value={task}
                        onChange={(e) => updateTomorrowTask(i, e.target.value)}
                        placeholder={`Task ${i + 1}`}
                        className="w-full text-sm bg-transparent outline-none border-b border-transparent focus:border-border/60 transition-colors pb-1 placeholder:text-muted-foreground/40"
                        autoComplete="off"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleNext} disabled={isPending}>
                  {isPending ? 'Saving...' : 'Finish'}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === 3 && (
            <>
              <DialogHeader>
                <DialogTitle className="font-light text-xl">Good work today!</DialogTitle>
              </DialogHeader>
              <div className="py-4 text-center space-y-1">
                <p className="text-5xl">{FOCUS_EMOJIS[focusScore]}</p>
                <p className="text-sm text-muted-foreground pt-2">
                  Focus score: {focusScore}/5
                </p>
                <p className="text-sm text-muted-foreground">See you tomorrow.</p>
              </div>
              <DialogFooter showCloseButton>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
