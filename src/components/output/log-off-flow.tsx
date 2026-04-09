'use client';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
  const [focusScore, setFocusScore] = useState(5);
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
      setFocusScore(5);
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
      <div className="pt-4 text-center text-sm text-muted-foreground">
        You&apos;ve logged off for today. Great work!
      </div>
    );
  }

  return (
    <>
      <div className="pt-12">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="text-muted-foreground hover:text-foreground px-2 -ml-2"
        >
          Log off for the day
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          {step === 1 && (
            <>
              <DialogHeader>
                <DialogTitle>How focused did you feel today?</DialogTitle>
                <p className="text-xs text-muted-foreground">Step 1 of 2</p>
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
              <DialogHeader>
                <DialogTitle>Reflect on today</DialogTitle>
                <p className="text-xs text-muted-foreground">Step 2 of 2</p>
              </DialogHeader>
              <div className="space-y-4 py-1">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    How did you feel about today&apos;s work?
                  </p>
                  <Textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Briefly describe how you felt..."
                    className="min-h-[88px] resize-none border-0 shadow-none focus-visible:ring-0 px-0 bg-transparent dark:bg-transparent"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Set 2–3 tasks for tomorrow
                  </p>
                  <div className="space-y-2">
                    {tomorrowTasks.map((task, i) => (
                      <Input
                        key={i}
                        value={task}
                        onChange={(e) => updateTomorrowTask(i, e.target.value)}
                        placeholder={`Task ${i + 1}`}
                        className="border-0 shadow-none focus-visible:ring-0 px-0"
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
                <DialogTitle>Good work today!</DialogTitle>
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
