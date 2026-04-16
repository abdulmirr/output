'use client';

import Link from 'next/link';
import { FadeIn } from './fade-in';

export function FinalCTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <FadeIn>
          <div className="relative rounded-2xl border border-border bg-card/30 p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Ready to track what matters?
              </h2>
              <p className="mt-3 text-muted-foreground text-base leading-relaxed">
                Join students, founders, and creators building their best work. 
                Stop counting hours and start measuring your actual output.
              </p>
            </div>
            <div className="relative z-10 shrink-0">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-md text-sm font-medium hover:bg-foreground/90 transition-all shadow-sm"
              >
                Get started
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
