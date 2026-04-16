'use client';

import Link from 'next/link';
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
              <span className="text-muted-foreground">Not your hours.</span>
            </h1>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
            The minimal workspace for people who ship. Start a work block, rate
            your focus, and see what you actually get done.
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
  const blocks = [
    { title: 'Deep work — product build', duration: '1h 45m', rating: 'deep', ratingColor: 'text-green-500' },
    { title: 'Code review + PR feedback', duration: '45m', rating: 'ok', ratingColor: 'text-yellow-500' },
    { title: 'Research competitor pricing', duration: '30m', rating: 'distracted', ratingColor: 'text-orange-500' },
    { title: 'Landing page redesign', duration: '1h 10m', rating: 'deep', ratingColor: 'text-green-500' },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-2xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
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
          <div className="text-right text-xs text-muted-foreground">
            <span className="text-foreground font-semibold text-sm">2h 55m</span> deep
            <span className="mx-1.5">·</span>
            <span className="text-foreground font-semibold text-sm">4h 10m</span> total
          </div>
        </div>

        <div className="space-y-1">
          {blocks.map((b, i) => (
            <div
              key={b.title}
              className="flex items-start gap-3 py-3 group hover:bg-foreground/[0.03] rounded-md px-2 -mx-2 transition-colors opacity-0 animate-in fade-in slide-in-from-bottom-2 fill-mode-forwards"
              style={{ animationDelay: `${i * 100}ms` }}
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
        </div>
      </div>
    </div>
  );
}
