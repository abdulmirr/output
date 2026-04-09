'use client';

import { useActionState, useEffect } from 'react';
import { joinWaitlist } from './actions';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';

export function WaitlistForm() {
  const [state, formAction, isPending] = useActionState(joinWaitlist, {
    success: false,
    message: '',
  });

  useEffect(() => {
    if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  if (state.success) {
    return (
      <div className="flex items-center gap-3 text-sm text-muted-foreground animate-in fade-in duration-500">
        <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
        <span>You're on the list. We'll be in touch.</span>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input
        type="email"
        name="email"
        placeholder="your@email.com"
        required
        disabled={isPending}
        className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/50 focus:border-ring disabled:opacity-50 transition-colors"
      />
      <button
        type="submit"
        disabled={isPending}
        className={cn(buttonVariants({ size: 'default' }), 'shrink-0 gap-1.5')}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <>
            <span>Join</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
