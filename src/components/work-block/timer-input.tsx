'use client';

import { Input } from '@/components/ui/input';
import { parseDurationInput, formatDuration } from '@/lib/utils';
import { useState } from 'react';

interface TimerInputProps {
  onDurationChange: (seconds: number | null) => void;
}

export function TimerInput({ onDurationChange }: TimerInputProps) {
  const [value, setValue] = useState('');
  const parsed = parseDurationInput(value);

  const handleChange = (text: string) => {
    setValue(text);
    onDurationChange(parseDurationInput(text));
  };

  return (
    <div className="space-y-1">
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="ex 1h 20m, 45m"
        className="border-0 shadow-none focus-visible:ring-0 px-0 text-base font-normal"
        autoComplete="off"
      />
      {parsed !== null && (
        <p className="text-xs text-muted-foreground">
          Duration: {formatDuration(parsed)}
        </p>
      )}
    </div>
  );
}
