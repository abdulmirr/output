'use client';

import Link from 'next/link';
import { FadeIn } from './fade-in';
import { V2Animation } from './v2-animation';

export function V2HeroSection() {
  return (
    <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center max-w-7xl mx-auto px-6">
      {/* Background radial gradient to give Obsidian feel */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/10 dark:bg-primary/5 blur-[120px] -z-10 rounded-full pointer-events-none" />

      <div className="text-center max-w-3xl space-y-8 z-10">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/80 border border-border text-xs font-medium text-muted-foreground mb-6">
            <span className="flex w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Output Web is officially live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-foreground">
            Measure what matters.
          </h1>
        </FadeIn>

        <FadeIn delay={100}>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light">
            A minimalist tracker for deep work. Start your sessions, rate your focus, and see your meaningful output compound over time.
          </p>
        </FadeIn>

        <FadeIn delay={200}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-lg text-sm font-medium hover:bg-foreground/90 hover:scale-[1.02] transition-all shadow-md"
            >
              Start tracking
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent border border-border text-foreground px-8 py-3.5 rounded-lg text-sm font-medium hover:bg-muted hover:text-foreground transition-all"
            >
              Log in
            </Link>
          </div>
        </FadeIn>
      </div>

      <FadeIn delay={400} className="w-full z-10">
        <V2Animation />
      </FadeIn>
    </section>
  );
}
