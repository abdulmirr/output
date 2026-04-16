'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EmojiSlider } from './emoji-slider';
import { useState } from 'react';

interface FocusRatingProps {
  onSubmit: (focusScore: number, thoughts: string | null) => void;
  submitting?: boolean;
}

export function FocusRating({ onSubmit, submitting }: FocusRatingProps) {
  const [score, setScore] = useState(3); // 1-5 scale
  const [thoughts, setThoughts] = useState('');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-light">How focused were you?</h2>
      </div>

      <EmojiSlider value={score} onChange={setScore} max={5} />

      <Textarea
        value={thoughts}
        onChange={(e) => setThoughts(e.target.value)}
        placeholder="Optional: share any thoughts..."
        className="min-h-[60px] resize-none text-sm bg-transparent dark:bg-transparent border-0 shadow-none focus-visible:ring-0 px-0"
      />

      <Button
        onClick={() => onSubmit(score, thoughts || null)}
        disabled={submitting}
        className="w-full"
      >
        {submitting ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );
}
