'use client';

import Image from 'next/image';
import { useState, useTransition } from 'react';
import { ArrowUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitFeedback } from './actions';

const ROADMAP = [
  {
    title: 'Desktop app',
    body: 'this unlocks ability to use keyboard shortcuts to start a block/add a task from anywhere. not possible with a web app.',
  },
  {
    title: 'Mobile app',
    body: "let's say you go gym or do some reading on your phone, i want you to be able to log that too.",
  },
  {
    title: 'Blocking apps & websites',
    body: "add links to block while you\u2019re in a work session. defend your focus at the OS level.",
  },
  {
    title: 'AI',
    body: 'claude mentor that analyzes your week and gives you advice/feedback based on what it observes. not sure how to approach this yet.',
  },
];

export function FeedbackPageClient() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  const trimmed = message.trim();
  const canSubmit = trimmed.length > 0 && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setStatus('idle');
    setErrorMsg('');
    startTransition(async () => {
      const res = await submitFeedback({ message: trimmed });
      if (res?.error) {
        setStatus('error');
        setErrorMsg(res.error);
        return;
      }
      setStatus('success');
      setMessage('');
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {/* LETTER */}
      <article className="space-y-5 text-base md:text-[17px] font-light leading-[1.75] text-foreground/80">
        <p>hey, thank you so much for using output!</p>

        <p>
          since i&rsquo;m a student and a new developer, i haven&rsquo;t gotten a
          chance to make the app perfect yet. i built this tool for myself but
          thought many people would benefit from tracking their actual work and
          fostering a deep work habit.
        </p>

        <p>
          i had a lot of fun building this &amp; want to continue working on it to
          make it an amazing tool.
        </p>

        <p>
          i&rsquo;m looking for honest feedback and what kind of direction to
          take this app into. so i&rsquo;d appreciate any thoughts, feedback,
          ideas or just what you liked/disliked about output so far below.
        </p>

        <p>
          marketing ideas would be appreciated too. i&rsquo;m tryna get users
          it&rsquo;s tough out here lol.
        </p>

        <p>
          also if you know how to code and want to work on this project with me,
          reach out pls!<br />
          i have no idea what i&rsquo;m doing and would appreciate the help.
        </p>

        <p>much love, stay locked in.</p>

        <p className="leading-tight">thanks,<br />abdul</p>

        <div className="pt-6 w-[40%]">
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <Image
              src="/abdul.jpg"
              alt="Abdul"
              fill
              sizes="50vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </article>

      {/* SUBMISSION */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
            Send me a note
          </h2>
          <p className="text-xs font-mono text-foreground/40">
            Ideas, feedback, bugs, marketing thoughts
          </p>
        </div>

        <div
          className={cn(
            'group relative rounded-[6px] ring-1 transition-all bg-background',
            'ring-foreground/[0.08] focus-within:ring-foreground/25 focus-within:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_-12px_rgba(0,0,0,0.08)]',
            status === 'error' && 'ring-destructive/40'
          )}
        >
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (status !== 'idle') setStatus('idle');
            }}
            onKeyDown={handleKeyDown}
            placeholder="what&rsquo;s on your mind?"
            maxLength={5000}
            rows={6}
            className="w-full resize-none bg-transparent px-5 pt-5 pb-14 text-base font-light leading-relaxed text-foreground placeholder:text-foreground/30 focus:outline-none"
          />

          <div className="absolute bottom-3 left-5 right-3 flex items-center justify-between gap-3 pointer-events-none">
            <span className="text-xs font-mono text-foreground/30 tabular-nums">
              {trimmed.length}/5000
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              aria-label="Submit feedback"
              className={cn(
                'pointer-events-auto flex items-center gap-1.5 rounded-full px-3.5 h-8 text-sm font-normal transition-all',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                canSubmit
                  ? 'bg-foreground text-background hover:bg-foreground/90 active:translate-y-px'
                  : 'bg-foreground/10 text-foreground/50'
              )}
            >
              {isPending ? (
                <span className="text-xs">sending&hellip;</span>
              ) : (
                <>
                  <span>Send</span>
                  <ArrowUp strokeWidth={2} className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* status line */}
        <div className="min-h-[1.25rem]">
          {status === 'success' && (
            <p className="flex items-center gap-2 text-sm font-light text-foreground/70">
              <Check strokeWidth={1.5} className="h-4 w-4" />
              Got it. Really appreciate you.
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm font-light text-destructive">
              {errorMsg || 'Something went wrong. Try again in a sec.'}
            </p>
          )}
        </div>
      </section>

      {/* ROADMAP */}
      <section className="space-y-3">
        <h2 className="text-sm font-normal uppercase tracking-wider text-foreground/70">
          On the roadmap
        </h2>

        <ul className="space-y-3">
          {ROADMAP.map((item) => (
            <li key={item.title} className="flex items-start gap-2">
              <span className="mt-[0.35rem] h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
              <div>
                <p className="text-xs font-mono text-foreground/70">{item.title}</p>
                <p className="text-xs font-mono text-foreground/40">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
