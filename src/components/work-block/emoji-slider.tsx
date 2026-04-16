'use client';

import { Slider } from '@/components/ui/slider';
import { FOCUS_EMOJIS, FOCUS_LABELS } from '@/lib/constants';

interface EmojiSliderProps {
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
  max?: number;
}

export function EmojiSlider({ value, onChange, compact, max = 5 }: EmojiSliderProps) {
  return (
    <div className={compact ? 'space-y-2' : 'space-y-4'}>
      <div className="flex items-center gap-3">
        <span className={compact ? 'text-xl' : 'text-4xl transition-all duration-200'}>
          {FOCUS_EMOJIS[value]}
        </span>
        <div className="flex flex-col">
          <span className={compact ? 'text-sm font-normal' : 'text-lg font-normal'}>{value}/{max}</span>
          <span className="text-xs text-muted-foreground">{FOCUS_LABELS[value]}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : v)}
        min={1}
        max={max}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Wasted</span>
        <span>Deep</span>
      </div>
    </div>
  );
}
