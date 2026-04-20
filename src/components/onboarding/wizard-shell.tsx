'use client';

import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface WizardShellProps {
  step: number;
  direction: 1 | -1;
  total: number;
  children: React.ReactNode;
}

export function WizardShell({ step, direction, total, children }: WizardShellProps) {
  return (
    <div className="space-y-8">
      {/* Brand row + progress dots */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium tracking-tight lowercase text-foreground/80">output</span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <motion.div
              key={i}
              layout
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className={cn(
                'h-1 rounded-full',
                i === step
                  ? 'w-6 bg-foreground'
                  : i < step
                    ? 'w-3 bg-foreground/50'
                    : 'w-3 bg-foreground/15'
              )}
            />
          ))}
        </div>
      </div>

      {/* Step body */}
      <div className="relative min-h-[340px]">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ x: direction * 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30, mass: 0.8 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
