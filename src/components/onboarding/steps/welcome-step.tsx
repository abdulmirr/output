'use client';

import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

interface WelcomeStepProps {
  onNext: () => void;
  firstName: string | null;
}

export function WelcomeStep({ onNext, firstName }: WelcomeStepProps) {
  return (
    <div className="space-y-8 pt-4">
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22, delay: 0.08 }}
          className="relative"
        >
          <div className="h-20 w-20 rounded-2xl border border-border bg-card flex items-center justify-center text-3xl font-semibold tracking-tight">
            o
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 18 }}
            className="absolute -inset-3 rounded-3xl border border-foreground/10"
            aria-hidden
          />
        </motion.div>
      </div>

      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          {firstName ? `Welcome, ${firstName}.` : 'Welcome to Output.'}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          A deliberate way to track your deep work. Let&apos;s get you set up — takes about 45 seconds.
        </p>
      </div>

      <div className="flex justify-center pt-2">
        <Button onClick={onNext} className="min-w-[160px]">
          Let&apos;s go →
        </Button>
      </div>
    </div>
  );
}
