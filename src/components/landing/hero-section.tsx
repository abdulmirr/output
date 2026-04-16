'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FadeIn } from './fade-in';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      {/* Animated gradient orb */}
      <div className="landing-orb" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08]">
              Track your output.
              <br />
              <span className="font-medium text-muted-foreground/60 tracking-normal">Enter deep work.</span>
            </h1>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            Start a work block, rate your focus, see what you get done.
          </p>
        </FadeIn>

        <FadeIn delay={240}>
          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-7 py-3 rounded-md text-sm font-medium hover:bg-foreground/90 transition-all shadow-sm"
            >
              Get started
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 border border-border bg-background hover:bg-muted text-foreground px-7 py-3 rounded-md text-sm font-medium transition-colors"
            >
              Log in
            </Link>
          </div>
        </FadeIn>

        {/* Hero product mockup */}
        <FadeIn delay={400}>
          <div className="mt-16 md:mt-20">
            <HeroMockup />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function HeroMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 7); // 7 steps in sequence
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const allBlocks = [
    { title: 'Deep work — product build', duration: '1h 45m', rating: 'deep', ratingColor: 'text-green-500' },
    { title: 'Code review + PR feedback', duration: '45m', rating: 'ok', ratingColor: 'text-yellow-500' },
    { title: 'Research competitor pricing', duration: '30m', rating: 'distracted', ratingColor: 'text-orange-500' },
  ];
  
  const finalBlock = { title: 'Landing page redesign', duration: '1h 10m', rating: 'deep', ratingColor: 'text-green-500' };

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-2xl shadow-black/5 dark:shadow-black/20 overflow-hidden min-h-[360px]">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
        <div className="h-2.5 w-2.5 rounded-full bg-border" />
        <div className="h-2.5 w-2.5 rounded-full bg-border" />
        <div className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="ml-3 text-[11px] text-muted-foreground font-medium">Output — Wednesday, Apr 16</span>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">April 16</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Wednesday</p>
          </div>
          <div className="text-right text-xs text-muted-foreground transition-opacity duration-500">
            <span className="text-foreground font-semibold text-sm">{step >= 6 ? '2h 55m' : '1h 45m'}</span> deep
            <span className="mx-1.5">·</span>
            <span className="text-foreground font-semibold text-sm">{step >= 6 ? '4h 10m' : '3h 0m'}</span> total
          </div>
        </div>

        <div className="space-y-1 relative">
          {allBlocks.map((b, i) => (
            <div
              key={b.title}
              className={`flex items-start gap-3 py-3 group hover:bg-foreground/[0.03] rounded-md px-2 -mx-2 transition-all duration-500 transform ${step > i ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
            >
              <div className="text-sm text-muted-foreground font-mono w-28 shrink-0 pt-0.5 select-none">
                {b.duration}
              </div>
              <div className="w-24 shrink-0 pt-0.5">
                <span className={`text-sm font-mono select-none ${b.ratingColor}`}>
                  {b.rating}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-light whitespace-pre-wrap break-words">{b.title}</p>
              </div>
            </div>
          ))}

          {/* Animating final block */}
          <div
            className={`flex items-start gap-3 py-3 group hover:bg-foreground/[0.03] rounded-md px-2 -mx-2 transition-all duration-500 transform ${step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {step >= 4 && (
              <>
                <div className="text-sm text-muted-foreground font-mono w-28 shrink-0 pt-0.5 select-none">
                  {step >= 5 ? finalBlock.duration : '1h 10m (timer)'}
                </div>
                <div className="w-24 shrink-0 pt-0.5">
                  {step === 4 ? (
                    <span className="text-sm font-mono select-none text-muted-foreground/50 animate-pulse">
                      In progress
                    </span>
                  ) : step >= 5 ? (
                    <span className={`text-sm font-mono select-none ${finalBlock.ratingColor} animate-in fade-in zoom-in duration-300`}>
                      {finalBlock.rating}
                    </span>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-light whitespace-pre-wrap break-words">{finalBlock.title}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
