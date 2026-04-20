'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { completeOnboarding } from '@/app/onboarding/actions';

interface ReadyStepProps {
  name: string;
  onBack: () => void;
}

export function ReadyStep({ name, onBack }: ReadyStepProps) {
  const [pending, setPending] = useState<'tour' | 'skip' | null>(null);
  const router = useRouter();

  const finish = async (startTour: boolean) => {
    setPending(startTour ? 'tour' : 'skip');
    try {
      await completeOnboarding({ startTour });
    } catch {
      // continue regardless
    }
    router.push('/output');
  };

  return (
    <div className="space-y-8 pt-2">
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="relative h-16 w-16 rounded-full border border-foreground/30 flex items-center justify-center"
        >
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-8 w-8 text-foreground"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
          >
            <motion.path
              d="M5 12l4 4L19 7"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
            />
          </motion.svg>
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: [0, 0.4, 0], scale: [1, 1.6, 1.8] }}
            transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border border-foreground/30"
            aria-hidden
          />
        </motion.div>
      </div>

      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          {name ? `You\u2019re all set, ${name}.` : 'You\u2019re all set.'}
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Next, we&apos;ll show you around your Output page. It takes 60 seconds — you can skip anytime.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button
          onClick={() => finish(true)}
          disabled={pending !== null}
          className="min-w-[220px]"
        >
          {pending === 'tour' ? 'Loading…' : 'Show me around →'}
        </Button>
        <button
          onClick={() => finish(false)}
          disabled={pending !== null}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {pending === 'skip' ? 'Taking you in…' : 'Skip tour, take me to Output'}
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onBack}
          disabled={pending !== null}
          className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
