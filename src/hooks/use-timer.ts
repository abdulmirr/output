'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTimerDisplay } from '@/lib/utils';

interface UseTimerOptions {
  mode: 'stopwatch' | 'countdown';
  initialSeconds?: number;
  onComplete?: () => void;
}

interface UseTimerReturn {
  seconds: number;
  isRunning: boolean;
  formattedTime: string;
  start: () => void;
  pause: () => void;
  reset: (newSeconds?: number) => void;
}

export function useTimer({
  mode,
  initialSeconds = 0,
  onComplete,
}: UseTimerOptions): UseTimerReturn {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (mode === 'countdown') {
          const next = prev - 1;
          if (next <= 0) {
            setIsRunning(false);
            onCompleteRef.current?.();
            return 0;
          }
          return next;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, mode]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(
    (newSeconds?: number) => {
      setIsRunning(false);
      setSeconds(newSeconds ?? initialSeconds);
    },
    [initialSeconds]
  );

  return {
    seconds,
    isRunning,
    formattedTime: formatTimerDisplay(mode === 'countdown' ? seconds : seconds),
    start,
    pause,
    reset,
  };
}
