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
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Get started — it&apos;s free
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-3"
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
    { label: 'Deep work — product build', time: '9:00 – 10:45', duration: '1h 45m', rating: 'Deep' as const },
    { label: 'Code review + PR feedback', time: '11:00 – 11:45', duration: '45m', rating: 'Okay' as const },
    { label: 'Research competitor pricing', time: '1:00 – 1:30', duration: '30m', rating: 'Shallow' as const },
    { label: 'Landing page redesign', time: '2:15 – 3:25', duration: '1h 10m', rating: 'Deep' as const },
  ];

  const ratingDot: Record<string, string> = {
    Deep: 'bg-green-500',
    Okay: 'bg-yellow-500',
    Shallow: 'bg-red-500',
  };

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

        <div className="space-y-2">
          {blocks.map((b, i) => (
            <div
              key={b.label}
              className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3 transition-all duration-300 hover:shadow-md hover:-translate-y-px"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-2 w-2 rounded-full ${ratingDot[b.rating]} shrink-0`} />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{b.label}</div>
                  <div className="text-[11px] text-muted-foreground">{b.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className="text-xs text-muted-foreground font-medium">{b.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
