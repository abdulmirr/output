'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface TimePickerDropdownProps {
  value: string; // "HH:MM" 24h format
  onChange: (value: string) => void;
  label?: string;
  compact?: boolean;
}

function generateTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const period = h < 12 ? 'AM' : 'PM';
      const label = `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
      options.push({ value, label });
    }
  }
  return options;
}

const TIME_OPTIONS = generateTimeOptions();

/** Convert HH:MM 24h string to display label like "11:02 AM" */
export function toDisplayLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return '';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const period = h < 12 ? 'AM' : 'PM';
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

/**
 * Parse a free-form time string into "HH:MM" 24h format.
 * Accepts formats like: "11:02 am", "11:02am", "2:30 PM", "14:30", "9am", "9:5p", etc.
 * If `periodHint` is provided and the input omits am/pm, the hint is applied
 * (only for hour values 1–12 so 24h inputs still parse correctly).
 * Returns null if unparseable.
 */
export function parseTimeInput(input: string, periodHint?: 'am' | 'pm'): string | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  // Match patterns: H:MM, HH:MM, H:MMam, HH:MM pm, Ham, HHam, H:M, etc.
  const match = trimmed.match(
    /^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm|a|p)?$/
  );
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  let period = match[3];

  if (minutes < 0 || minutes > 59) return null;

  if (!period && periodHint && hours >= 1 && hours <= 12) {
    period = periodHint;
  }

  if (period) {
    // 12-hour format
    if (hours < 1 || hours > 12) return null;
    if (period.startsWith('a')) {
      if (hours === 12) hours = 0;
    } else {
      if (hours !== 12) hours += 12;
    }
  } else {
    // 24-hour format
    if (hours < 0 || hours > 23) return null;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/** Returns 'am' | 'pm' if the input has an explicit period marker, else null. */
export function detectPeriod(input: string): 'am' | 'pm' | null {
  const match = input.trim().toLowerCase().match(/(am|pm|a|p)$/);
  if (!match) return null;
  return match[1].startsWith('a') ? 'am' : 'pm';
}

/**
 * Parse a start/end pair, inferring a missing am/pm from the other side.
 * If the naive inference produces end <= start, tries the opposite period
 * for the ambiguous side.
 */
export function parseTimeRange(
  startInput: string,
  endInput: string
): { start: string | null; end: string | null } {
  const startPeriod = detectPeriod(startInput);
  const endPeriod = detectPeriod(endInput);

  let start = parseTimeInput(startInput, endPeriod ?? undefined);
  let end = parseTimeInput(endInput, startPeriod ?? undefined);

  if (start && end) {
    const toMins = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      return h * 60 + m;
    };
    if (toMins(end) <= toMins(start)) {
      if (!startPeriod && endPeriod) {
        const opposite = endPeriod === 'am' ? 'pm' : 'am';
        const alt = parseTimeInput(startInput, opposite);
        if (alt && toMins(alt) < toMins(end)) start = alt;
      } else if (!endPeriod && startPeriod) {
        const opposite = startPeriod === 'am' ? 'pm' : 'am';
        const alt = parseTimeInput(endInput, opposite);
        if (alt && toMins(alt) > toMins(start)) end = alt;
      }
    }
  }

  return { start, end };
}

export function TimePickerDropdown({ value, onChange, label, compact }: TimePickerDropdownProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value to input string
  useEffect(() => {
    if (value) {
      setInputValue(toDisplayLabel(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  const commitInput = () => {
    const parsed = parseTimeInput(inputValue);
    if (parsed) {
      onChange(parsed);
      setInputValue(toDisplayLabel(parsed));
    } else if (value) {
      // Reset to current value if input is invalid
      setInputValue(toDisplayLabel(value));
    } else {
      setInputValue('');
    }
  };

  // Click outside to close and commit
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        commitInput();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, inputValue]);

  const filteredOptions = TIME_OPTIONS.filter(o =>
    o.label.toLowerCase().includes(inputValue.toLowerCase()) ||
    o.value.includes(inputValue)
  );

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className={compact ? 'text-xs text-muted-foreground block mb-1' : 'text-base font-semibold text-muted-foreground block mb-2'}>{label}</label>
      )}
      <Input
        type="text"
        placeholder="Type or select time..."
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitInput();
            setOpen(false);
          }
        }}
        onBlur={() => {
          // Small delay so dropdown click can fire first
          setTimeout(() => {
            if (!containerRef.current?.contains(document.activeElement)) {
              commitInput();
              setOpen(false);
            }
          }, 150);
        }}
        autoComplete="off"
        className={compact
          ? 'w-full text-sm bg-transparent dark:bg-transparent outline-none border-b border-transparent focus:border-border/60 transition-colors pb-1 placeholder:text-muted-foreground/40 shadow-none border-0 focus-visible:ring-0 px-0'
          : 'w-full border-0 shadow-none focus-visible:ring-0 px-0 text-base bg-transparent dark:bg-transparent'
        }
      />
      {open && filteredOptions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-xl overflow-hidden max-h-[220px] overflow-y-auto">
          {filteredOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setInputValue(option.label);
                setOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2.5 text-sm text-left transition-colors',
                option.value === value
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'hover:bg-accent/50 text-popover-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
