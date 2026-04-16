'use client';

import { Textarea } from '@/components/ui/textarea';
import { useEffect, useRef, useState } from 'react';
import { updateDailyThoughts } from '@/app/(app)/output/actions';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ThoughtsSectionProps {
  initialThoughts: string;
  today: string;
}

export function ThoughtsSection({ initialThoughts, today }: ThoughtsSectionProps) {
  const [thoughts, setThoughts] = useState(initialThoughts);
  const [open, setOpen] = useState(!!initialThoughts);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (value: string) => {
    setThoughts(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateDailyThoughts(today, value);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="space-y-2 mt-8">
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="absolute -left-5 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground/40 transition-colors"
        >
          {open
            ? <ChevronDown className="h-4 w-4" />
            : <ChevronRight className="h-4 w-4" />
          }
        </button>
        <h3
          className="text-sm font-normal uppercase tracking-wider text-foreground/70 cursor-pointer hover:text-foreground/90 transition-colors"
          onClick={() => setOpen((o) => !o)}
        >
          Thoughts
        </h3>
      </div>
      {open && (
        <Textarea
          value={thoughts}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="jot down any thoughts as you work..."
          className="min-h-[100px] resize-none text-base font-light leading-relaxed border-0 shadow-none focus-visible:ring-0 px-0 bg-transparent dark:bg-transparent placeholder:text-foreground/20"
          autoFocus={!initialThoughts}
        />
      )}
    </div>
  );
}
