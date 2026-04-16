'use client';

import Link from 'next/link';
import { FadeIn } from './fade-in';

export function FinalCTA() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <FadeIn>
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Your best work starts here.
            </h2>
            <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed">
              Join students, founders, and creators who track what matters.
            </p>
            <div className="mt-8">
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
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
